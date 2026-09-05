const express      = require('express');
const router       = express.Router();
const rateLimit    = require('express-rate-limit');
const authController = require('../controllers/auth');
const { IS_PRODUCTION } = require('../src/config/env');

/**
 * Rate limiter for auth endpoints.
 * Prevents brute-force login attacks: max 20 attempts per IP per 15 minutes.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
});

router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleLogin);

// /setup-admin is disabled in production to prevent unauthorized first-admin creation.
// Only available in development/staging environments.
if (!IS_PRODUCTION) {
    router.post('/setup-admin', authController.createInitialAdmin);
}

module.exports = router;
