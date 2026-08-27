/**
 * @file batchAutoCreate.js
 * @description Core sync pipeline: fetches directory contacts, parses emails,
 * and upserts Batch + User documents in MongoDB.
 *
 * Logic:
 *  1. Fetch all contacts from Google directory.
 *  2. Parse each email with emailParser.js.
 *  3. Skip non-student emails.
 *  4. Group students by (admissionYear + dept + studentType).
 *  5. For each group: find-or-create a Batch document.
 *  6. For each student: find-or-create a User document, link to Batch.
 *  7. Return a detailed summary.
 */

'use strict';

const User    = require('../../models/User');
const Batch   = require('../../models/Batch');
const { parseStudentEmail, toBatchName, isStudentEmail, isStaffEmail } = require('./emailParser');

/**
 * Groups an array of parsed students into a Map keyed by batch key.
 * Key format: "<admissionYear>-<dept>"   e.g. "2023-CS" (combines regular + lateral)
 *
 * @param {Array} parsedStudents
 * @returns {Map<string, Array>}
 */
function groupIntoBatches(parsedStudents) {
    const groups = new Map();
    for (const s of parsedStudents) {
        const key = `${s.admissionYear}-${s.dept}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
    }
    return groups;
}

/**
 * Runs the full directory sync pipeline.
 *
 * @param {string} createdByUserId - MongoDB _id of the admin triggering the sync.
 * @returns {Promise<object>} Sync summary report.
 */
/**
 * Processes an array of { name, email } contact objects into Batches and Users.
 * @param {Array<{name: string, email: string}>} contacts
 * @param {string} createdByUserId
 * @returns {Promise<object>} Sync summary
 */
async function processContactsList(contacts, createdByUserId) {
    const summary = {
        totalContacts:   contacts.length,
        studentsFound:   0,
        studentsSkipped: 0,
        batchesCreated:  0,
        batchesUpdated:  0,
        studentsCreated: 0,
        studentsUpdated: 0,
        errors:          [],
        batches:         [],
    };

    // ── Step 1: Parse and filter student emails ──────────────────────────────
    const parsedStudents = [];
    for (const contact of contacts) {
        if (!contact.email) continue;
        const parsed = parseStudentEmail(contact.email);
        if (!parsed) {
            summary.studentsSkipped++;
            continue;
        }
        // Attach name from directory
        parsedStudents.push({ ...parsed, name: contact.name || parsed.registerId });
    }
    summary.studentsFound = parsedStudents.length;

    // ── Step 2: Group into batches (Unified: Regular + Lateral in same class) ─
    const groups = groupIntoBatches(parsedStudents);

    // ── Step 3: Upsert Batches and Users ────────────────────────────────────
    for (const [batchKey, students] of groups) {
        const [admissionYear, dept] = batchKey.split('-');
        const batchName = toBatchName({ dept, admissionYear });

        // ── Find or create the Unified Batch ─────────────────────────────────
        let batch = await Batch.findOne({ admissionYear, branch: dept });

        if (!batch) {
            try {
                batch = await Batch.create({
                    name:         batchName,
                    branch:       dept,
                    scheme:       admissionYear >= '2024' ? '2024' : '2019',
                    admissionYear,
                    studentType:  'regular',
                    createdBy:    createdByUserId,
                    lastSyncedAt: new Date(),
                    students:     [],
                });
                summary.batchesCreated++;
            } catch (err) {
                summary.errors.push(`Batch create error [${batchKey}]: ${err.message}`);
                continue;
            }
        } else {
            batch.name = batchName;
            batch.lastSyncedAt = new Date();
            await batch.save();
            summary.batchesUpdated++;
        }

        const batchDetail = { batchName, admissionYear, dept, created: 0, updated: 0 };

        // ── Upsert each Student ──────────────────────────────────────────────
        for (const s of students) {
            try {
                let user = await User.findOne({ email: s.email });

                if (!user) {
                    // Create new student (no password — they sign in via Google)
                    user = await User.create({
                        name:                s.name || s.registerId,
                        email:               s.email,
                        role:                'student',
                        registerId:          s.registerId,
                        batch:               batch._id,
                        department:          s.dept,
                        studentType:         s.type,
                        syncedFromDirectory: true,
                    });
                    summary.studentsCreated++;
                    batchDetail.created++;
                } else {
                    // Update existing student: sync name if it was missing or changed
                    let dirty = false;
                    if (s.name && user.name !== s.name) { user.name = s.name; dirty = true; }
                    if (!user.batch) { user.batch = batch._id; dirty = true; }
                    if (!user.registerId) { user.registerId = s.registerId; dirty = true; }
                    if (!user.syncedFromDirectory) { user.syncedFromDirectory = true; dirty = true; }
                    if (dirty) await user.save();
                    summary.studentsUpdated++;
                    batchDetail.updated++;
                }

                // Ensure student is in the batch.students array
                if (!batch.students.includes(user._id)) {
                    batch.students.push(user._id);
                }

            } catch (err) {
                summary.errors.push(`Student upsert error [${s.email}]: ${err.message}`);
            }
        }

        await batch.save(); // persist student list updates
        summary.batches.push(batchDetail);
    }

    // ── Step 4: Automatically categorize and upsert Staff / Faculty / HODs ─────
    summary.staffCreated = 0;
    summary.staffUpdated = 0;

    for (const contact of contacts) {
        if (!contact.email) continue;
        const email = contact.email.toLowerCase().trim();

        if (isStaffEmail(email)) {
            try {
                const name = contact.name || email.split('@')[0].replace(/[._]/g, ' ');
                const lowerStr = (name + ' ' + email).toLowerCase();

                let role = 'teacher';
                let designation = 'Faculty';

                if (lowerStr.includes('principal')) {
                    role = 'principal';
                    designation = 'Principal';
                } else if (lowerStr.includes('hod') || lowerStr.includes('head of department')) {
                    designation = 'HOD';
                } else if (lowerStr.includes('tutor') || lowerStr.includes('advisor')) {
                    designation = 'Tutor';
                }

                let department = 'General';
                if (lowerStr.includes('cs')) department = 'CS';
                else if (lowerStr.includes('ec')) department = 'EC';
                else if (lowerStr.includes('ee')) department = 'EE';
                else if (lowerStr.includes('me') || lowerStr.includes('mech')) department = 'ME';
                else if (lowerStr.includes('ce') || lowerStr.includes('civil')) department = 'CE';
                else if (lowerStr.includes('it')) department = 'IT';

                let staff = await User.findOne({ email });
                if (!staff) {
                    await User.create({
                        name:                name.toUpperCase(),
                        email,
                        role,
                        designation,
                        department,
                        syncedFromDirectory: true,
                    });
                    summary.staffCreated++;
                } else {
                    summary.staffUpdated++;
                }
            } catch (staffErr) {
                summary.errors.push(`Staff upsert error [${email}]: ${staffErr.message}`);
            }
        }
    }

    return summary;
}

/**
 * Runs the full directory sync pipeline via Google People API.
 *
 * @param {string} createdByUserId - MongoDB _id of the admin triggering the sync.
 * @returns {Promise<object>} Sync summary report.
 */
async function runDirectorySync(createdByUserId) {
    let contacts;
    try {
        contacts = await fetchAllDirectoryContacts();
    } catch (err) {
        throw new Error(`Failed to fetch directory: ${err.message}`);
    }

    return await processContactsList(contacts, createdByUserId);
}

module.exports = { runDirectorySync, processContactsList };
