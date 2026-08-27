/**
 * @file routes/sync.js
 * @description Routes for Google Directory sync and OAuth flow.
 */

'use strict';

const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const upload     = multer({ storage: multer.memoryStorage() });
const sync       = require('../controllers/sync');
const auth       = require('../middleware/auth');

// ─── OAuth (no auth guard — admin must be able to reach these even before setup) ──
router.get('/oauth/url',      sync.getOAuthUrl);
router.get('/oauth/callback', sync.handleOAuthCallback);

// ─── Sync operations (admin only) ─────────────────────────────────────────────
router.post('/directory',        auth('admin'), sync.triggerSync);
router.post('/automate-browser', auth('admin'), sync.automatedBrowserSync);
router.post('/upload',           auth('admin'), upload.single('file'), sync.uploadCSV);
router.post('/paste', (req, res, next) => {
    if (req.header('Authorization')) return auth('admin')(req, res, next);
    next();
}, sync.syncFromText);
router.get('/status', auth('admin'), sync.getSyncStatus);

module.exports = router;
