const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/request');
const auth       = require('../middleware/auth');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/attachments';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const APPROVER_ROLES = ['teacher', 'hod', 'principal'];

// Student — create & view
router.post('/',                  auth('student'),        upload.array('attachments', 5), ctrl.createRequest);
router.get('/my',                 auth('student'),        ctrl.getMyRequests);
router.post('/:id/resubmit',      auth('student'),        ctrl.resubmitRequest);

// Approvers — pending queue + actions
router.get('/pending',            auth(APPROVER_ROLES),   ctrl.getPendingRequests);
router.get('/history',            auth(APPROVER_ROLES),   ctrl.getApproverHistory);
router.post('/:id/approve',       auth(APPROVER_ROLES),   ctrl.approveRequest);
router.post('/:id/reject',        auth(APPROVER_ROLES),   ctrl.rejectRequest);

// PDF download — any authenticated user
router.get('/:id/pdf',            auth(['student', ...APPROVER_ROLES, 'admin']), ctrl.downloadPDF);

// Staff list — for flow builder dropdown (student uses this)
router.get('/staff',              auth('student'),        ctrl.getStaff);

// PUBLIC — QR code verification (no auth)
router.get('/verify/:reqId',      ctrl.verifyRequest);

// Attachment download - public for now since verify is public
router.get('/attachment/:reqId/:filename', ctrl.downloadAttachment);

module.exports = router;
