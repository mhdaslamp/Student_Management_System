/**
 * @file app.js
 * @description Express application factory.
 * Sets up all middleware, routes, and error handlers.
 * Kept separate from server.js so it can be imported cleanly in tests.
 */

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const helmet       = require('helmet');

const { ALLOWED_ORIGINS } = require('./src/config/env');
const errorHandler         = require('./src/middleware/errorHandler');
const notFound             = require('./src/middleware/notFound');

const app = express();

// ─── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
        }
    },
    credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Student Management System API',
        version: '2.0.0',
    });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/teacher',  require('./routes/teacher'));
app.use('/api/student',  require('./routes/student'));
app.use('/api/academic', require('./routes/academic'));
app.use('/api/request',  require('./routes/request'));

// ─── 404 + Global Error Handler ───────────────────────────────────────────────
// Order matters: notFound must come before errorHandler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
