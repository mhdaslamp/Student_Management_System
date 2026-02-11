const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const auth = require('../middleware/auth');

router.get('/me', auth('student'), studentController.getMe);

module.exports = router;
