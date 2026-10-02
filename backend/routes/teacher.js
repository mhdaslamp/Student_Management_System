const express            = require('express');
const router             = express.Router();
const teacherController  = require('../controllers/teacher');
const auth               = require('../middleware/auth');
const { excelOnly }      = require('../src/middleware/upload');
const {
    BATCH_VIEWER_ROLES,
    APPROVER_ROLES,
} = require('../src/config/constants');

// ─── Batch Management ─────────────────────────────────────────────────────────
router.post('/batch',                        auth('teacher'),              teacherController.createBatch);
router.get('/batch',                         auth(BATCH_VIEWER_ROLES),     teacherController.getBatches);
router.get('/batch/:batchId',                auth(BATCH_VIEWER_ROLES),     teacherController.getBatchDetails);
router.post('/batch/:batchId/upload',        auth(['teacher', 'admin']),   excelOnly.single('file'), teacherController.uploadStudents);
router.post('/batch/:batchId/student',       auth('teacher'),              teacherController.addStudent);

// ─── Internal Marks ───────────────────────────────────────────────────────────
router.get('/internal/template/:batchId', auth('teacher'),                    teacherController.downloadInternalTemplate);
router.post('/internal/upload/:batchId',  auth('teacher'),                    excelOnly.single('file'), teacherController.uploadInternalmarks);

// ─── Student Management ───────────────────────────────────────────────────────
router.put('/student/:studentId',    auth('teacher'),                         teacherController.updateStudent);
router.delete('/student/:studentId', auth('teacher'),                         teacherController.deleteStudent);

// ─── Activity Points (Verification) ───────────────────────────────────────────
const teacherActivityPoints = require('../controllers/teacherActivityPoints');
router.get('/activities',            auth('teacher'),                         teacherActivityPoints.getActivities);
router.put('/activities/:id/verify', auth('teacher'),                         teacherActivityPoints.verifyActivity);

module.exports = router;
