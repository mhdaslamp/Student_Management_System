const express              = require('express');
const router               = express.Router();
const academicController   = require('../controllers/academic');
const auth                 = require('../middleware/auth');
const { pdfOnly }          = require('../src/middleware/upload');
const { BATCH_VIEWER_ROLES } = require('../src/config/constants');

// ─── Results ──────────────────────────────────────────────────────────────────
router.post('/result',                  auth('teacher'),            academicController.addResult);
router.post('/result/upload',           auth('admin'),              pdfOnly.single('file'), academicController.uploadResultPDF);
router.get('/result/student',           auth('student'),            academicController.getResultsByStudent);
router.get('/result/batch',             auth(BATCH_VIEWER_ROLES),   academicController.getResultsByBatch);

// ─── Overview & Publishing ────────────────────────────────────────────────────
router.get('/result/draft-overview',    auth(BATCH_VIEWER_ROLES),   academicController.getDraftResultOverview);
router.get('/result/overview',          auth(BATCH_VIEWER_ROLES),   academicController.getAllResultOverview);
router.get('/result/overview/:batchId', auth(BATCH_VIEWER_ROLES),   academicController.getBatchResultOverview);
router.post('/result/publish',          auth('admin'),              academicController.publishResult);
router.post('/result/delete',           auth('admin'),              academicController.deleteResult);

// ─── Result Details ───────────────────────────────────────────────────────────
router.get('/result/details/all',       auth(BATCH_VIEWER_ROLES),   academicController.getAllResultDetails);
router.get('/result/details/:batchId',  auth(BATCH_VIEWER_ROLES),   academicController.getBatchResultDetails);

// ─── Downloads ────────────────────────────────────────────────────────────────
router.get('/result/download/all',      auth(BATCH_VIEWER_ROLES),   academicController.downloadResultExcelGlobal);
router.get('/result/download/:batchId', auth(BATCH_VIEWER_ROLES),   academicController.downloadBatchResult);

// ─── Analysis ─────────────────────────────────────────────────────────────────
router.get('/result/analysis/college',     auth(BATCH_VIEWER_ROLES), academicController.getCollegeResultAnalysis);
router.get('/result/analysis/department',  auth(BATCH_VIEWER_ROLES), academicController.getDepartmentResultAnalysis);
router.get('/result/analysis/:batchId',    auth(BATCH_VIEWER_ROLES), academicController.getBatchResultAnalysis);

// ─── Assignments ──────────────────────────────────────────────────────────────
router.post('/assignment',              auth('teacher'),            academicController.createAssignment);
router.get('/assignment',               auth(['student', 'teacher']), academicController.getAssignments);

module.exports = router;
