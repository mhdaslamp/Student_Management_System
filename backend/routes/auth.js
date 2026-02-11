const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/setup-admin', authController.createInitialAdmin);

module.exports = router;
