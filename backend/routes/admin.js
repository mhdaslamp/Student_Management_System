const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const auth = require('../middleware/auth');

// Protected route: Only admin can access
router.post('/teacher', auth('admin'), adminController.addTeacher);

module.exports = router;
