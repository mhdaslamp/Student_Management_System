/**
 * @file controllers/sync.js
 * @description Admin-only endpoints to manage the Google Directory sync.
 */

'use strict';

const { getOAuthUrl, exchangeCodeForTokens } = require('../src/services/googlePeopleApi');
const { runDirectorySync, processContactsList } = require('../src/services/batchAutoCreate');
const { runAutomatedBrowserSync } = require('../src/services/browserDirectoryScraper');
const XLSX  = require('xlsx');
const Batch = require('../models/Batch');
const User  = require('../models/User');

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

/**
 * GET /api/sync/oauth/url
 * Returns the Google OAuth2 consent URL. Admin visits this to grant access.
 */
exports.getOAuthUrl = (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({
            success: false,
            message: 'Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
        });
    }
    const url = getOAuthUrl();
    res.json({ success: true, url });
};

/**
 * GET /api/sync/oauth/callback?code=...
 * Google redirects here after the admin grants consent.
 * Exchanges the code for tokens and displays the refresh_token.
 */
exports.handleOAuthCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ success: false, message: 'Missing auth code.' });

        const tokens = await exchangeCodeForTokens(code);

        // In production, store this in a secrets manager or env var.
        // We display it here so the admin can copy it to GOOGLE_REFRESH_TOKEN in .env
        res.json({
            success: true,
            message:       'OAuth successful! Copy the refresh_token below into your GOOGLE_REFRESH_TOKEN .env variable.',
            refresh_token: tokens.refresh_token,
            access_token:  tokens.access_token,
            expiry_date:   tokens.expiry_date,
        });
    } catch (err) {
        next(err);
    }
};

// ─── Sync Trigger ─────────────────────────────────────────────────────────────

/**
 * POST /api/sync/directory
 * Triggers a full directory sync. Admin only.
 * Creates/updates Batch and User documents from the Google directory.
 */
exports.triggerSync = async (req, res, next) => {
    try {
        if (!process.env.GOOGLE_REFRESH_TOKEN) {
            return res.status(400).json({
                success: false,
                message: 'Google not connected. Visit GET /api/sync/oauth/url to connect your account first.',
            });
        }

        const summary = await runDirectorySync(req.user.userId);
        res.json({ success: true, summary });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/sync/csv
 * Imports contacts from an uploaded CSV or Excel file exported from Google Contacts.
 */
exports.uploadCSV = async (req, res, next) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a CSV or Excel file.' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return res.status(400).json({ success: false, message: 'Uploaded file is empty.' });
        }

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
        if (!rows || rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No rows found in the uploaded file.' });
        }

        const contacts = [];

        for (const row of rows) {
            // Find email from known column names or any key containing 'email' or 'e-mail'
            let email = row['E-mail 1 - Value'] || row['Email'] || row['email'] || row['E-mail Address'] || row['Email Address'] || row['E-mail'] || '';
            let name = row['Name'] || row['name'] || row['Full Name'] || row['Given Name'] || '';

            if (!email) {
                // Search across all row keys
                for (const key of Object.keys(row)) {
                    const lk = key.toLowerCase();
                    if ((lk.includes('email') || lk.includes('e-mail')) && row[key]) {
                        email = row[key];
                        break;
                    }
                }
            }

            if (!name) {
                for (const key of Object.keys(row)) {
                    const lk = key.toLowerCase();
                    if (lk.includes('name') && row[key]) {
                        name = row[key];
                        break;
                    }
                }
            }

            if (email && typeof email === 'string' && email.includes('@')) {
                contacts.push({
                    name: (typeof name === 'string' ? name.trim() : ''),
                    email: email.toLowerCase().trim()
                });
            }
        }

        if (contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid email addresses found in the uploaded file. Please make sure the file contains an email column.'
            });
        }

        const summary = await processContactsList(contacts, req.user.userId);
        res.json({ success: true, summary });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/sync/paste
 * Parses raw text or list of emails pasted by admin.
 */
exports.syncFromText = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Please paste student details or email list.' });
        }

        const lines = text.split(/\r?\n/);
        const contacts = [];
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

        for (const line of lines) {
            const matches = line.match(emailRegex);
            if (matches && matches.length > 0) {
                const email = matches[0].toLowerCase().trim();
                // Name is line content without the email
                let name = line.replace(email, '').replace(/[\t,;|\-]+/g, ' ').trim();
                contacts.push({ name, email });
            }
        }

        if (contacts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid email addresses found in the pasted text.'
            });
        }

        let adminId = req.user?.userId;
        if (!adminId) {
            const defaultAdmin = await User.findOne({ role: 'admin' });
            adminId = defaultAdmin?._id;
        }

        const summary = await processContactsList(contacts, adminId);
        res.json({ success: true, summary });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/sync/automate-browser
 * Spawns the native Python Selenium script to open a visible Chrome window,
 * scroll through Google Contacts Directory, extract contacts, and build batches.
 */
exports.automatedBrowserSync = async (req, res, next) => {
    try {
        const { spawn } = require('child_process');
        const path = require('path');
        const pythonScript = path.join(__dirname, '../scripts/sync_contacts.py');
        
        console.log('🐍 Launching Python Selenium Directory Sync:', pythonScript);

        const pyProcess = spawn('python', [pythonScript], {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8',
                PYTHONUTF8: '1',
                BACKEND_URL: `http://localhost:${process.env.PORT || 5000}/api/sync/paste`
            }
        });

        let stdout = '';
        let stderr = '';

        pyProcess.stdout.on('data', (data) => {
            const str = data.toString();
            stdout += str;
            process.stdout.write(str);
        });

        pyProcess.stderr.on('data', (data) => {
            stderr += data.toString();
            process.stderr.write(data.toString());
        });

        pyProcess.on('close', (code) => {
            if (code === 0) {
                res.json({
                    success: true,
                    message: 'Python Google Contacts sync completed successfully!'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: `Python sync exited with code ${code}. Error: ${stderr || stdout}`
                });
            }
        });

    } catch (err) {
        console.error('Automated Browser Sync Error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Automated Python sync failed.'
        });
    }
};

// ─── Sync Status ──────────────────────────────────────────────────────────────

/**
 * GET /api/sync/status
 * Returns current DB counts and last sync time per batch.
 */
exports.getSyncStatus = async (req, res, next) => {
    try {
        const [totalStudents, totalBatches, lastSyncedBatch] = await Promise.all([
            User.countDocuments({ role: 'student', syncedFromDirectory: true }),
            Batch.countDocuments({ lastSyncedAt: { $exists: true } }),
            Batch.findOne({ lastSyncedAt: { $exists: true } })
                 .sort({ lastSyncedAt: -1 })
                 .select('lastSyncedAt'),
        ]);

        // Per-department breakdown
        const deptBreakdown = await User.aggregate([
            { $match: { role: 'student', syncedFromDirectory: true } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        // Per-year breakdown
        const yearBreakdown = await Batch.aggregate([
            { $match: { admissionYear: { $exists: true } } },
            { $group: { _id: '$admissionYear', studentCount: { $sum: { $size: '$students' } }, batches: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        const isConnected = !!process.env.GOOGLE_REFRESH_TOKEN;

        res.json({
            success: true,
            isConnected,
            lastSyncedAt:   lastSyncedBatch?.lastSyncedAt || null,
            totalStudents,
            totalBatches,
            byDepartment:   deptBreakdown.map(d => ({ dept: d._id, count: d.count })),
            byYear:         yearBreakdown.map(y => ({ year: y._id, batches: y.batches, students: y.studentCount })),
        });
    } catch (err) {
        next(err);
    }
};
