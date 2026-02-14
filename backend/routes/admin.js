const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const auth = require('../middleware/auth');

// Protected route: Only admin can access
router.post('/teacher', auth('admin'), adminController.addTeacher);
router.get('/teacher', auth('admin'), adminController.getTeachers);
router.put('/teacher/:id', auth('admin'), adminController.updateTeacher);
router.delete('/teacher/:id', auth('admin'), adminController.deleteTeacher);

module.exports = router;
