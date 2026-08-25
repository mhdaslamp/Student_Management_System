/**
 * @file errorHandler.js
 * @description Global Express error handling middleware.
 * Register this LAST in app.js (after all routes).
 *
 * Usage in controllers: instead of res.status(500).send('Server Error'),
 * call next(err) and this middleware handles it consistently.
 */

const { IS_PRODUCTION } = require('../config/env');

/**
 * Centralized error response shape:
 * { success: false, message: string, code?: string, errors?: any[] }
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
    // Default values
    let statusCode = err.statusCode || err.status || 500;
    let message    = err.message    || 'Internal Server Error';

    // ── Mongoose Validation Error ──────────────────────────────────────────
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join(', ');
        return res.status(statusCode).json({ success: false, message, errors });
    }

    // ── Mongoose Duplicate Key ─────────────────────────────────────────────
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `A record with this ${field} already exists.`;
        return res.status(statusCode).json({ success: false, message });
    }

    // ── Mongoose Cast Error (invalid ObjectId) ─────────────────────────────
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid value for ${err.path}: "${err.value}"`;
        return res.status(statusCode).json({ success: false, message });
    }

    // ── JWT Errors ─────────────────────────────────────────────────────────
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Session expired. Please log in again.';
        return res.status(statusCode).json({ success: false, message, code: 'TOKEN_EXPIRED' });
    }
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
        return res.status(statusCode).json({ success: false, message, code: 'INVALID_TOKEN' });
    }

    // ── Log full stack in development, sanitize in production ─────────────
    if (!IS_PRODUCTION) {
        console.error(`\n[ERROR] ${req.method} ${req.originalUrl}`);
        console.error(err.stack || err);
    } else {
        // In production only log minimal info (no stack traces to client)
        console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${statusCode}: ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only expose stack trace in development
        ...(IS_PRODUCTION ? {} : { stack: err.stack }),
    });
};

module.exports = errorHandler;
