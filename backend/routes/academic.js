const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academic');
const auth = require('../middleware/auth');
const multer = require('multer'); // Added for file uploads

const upload = multer(); // Added for file uploads

// Results
router.post('/result', auth('teacher'), academicController.addResult);
router.post('/result/upload', auth(['teacher', 'admin']), upload.single('file'), academicController.uploadResultPDF); // Added POST /result/upload endpoint
router.get('/result/student', auth('student'), academicController.getResultsByStudent);
router.get('/result/batch', auth(['teacher', 'admin']), academicController.getResultsByBatch);

// Assignments
router.post('/assignment', auth('teacher'), academicController.createAssignment);
router.get('/assignment', auth(['student', 'teacher']), academicController.getAssignments);

module.exports = router;
