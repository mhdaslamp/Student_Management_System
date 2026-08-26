/**
 * @file env.js
 * @description Environment variable loader and validator.
 * Fails fast with a clear message if required env vars are missing.
 * Import this ONCE at the top of server.js — it loads dotenv too.
 */

const dotenv = require('dotenv');
const path   = require('path');

// Load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─── Required Variables ────────────────────────────────────────────────────────

const REQUIRED_PROD_VARS = ['JWT_SECRET'];

const missing = REQUIRED_PROD_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`\n❌ FATAL: Missing required environment variables:\n  ${missing.join('\n  ')}`);
    console.error('Add them to your .env file (see .env.example) and restart.\n');
    process.exit(1);
}

// ─── Derived Config ────────────────────────────────────────────────────────────

const NODE_ENV    = process.env.NODE_ENV  || 'development';
const PORT        = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET  = process.env.JWT_SECRET;

/**
 * MongoDB URI:
 *  - If set in .env → use external Atlas URI (production)
 *  - If not set     → fall through to embedded MongoDB in database.js (local dev)
 */
const MONGO_URI   = process.env.MONGO_URI || null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const DOMAIN_URL   = process.env.DOMAIN_URL   || null;

const IS_PRODUCTION  = NODE_ENV === 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';

// ─── Allowed CORS Origins ──────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    FRONTEND_URL,
    DOMAIN_URL,
].filter(Boolean);

// ─── Export ────────────────────────────────────────────────────────────────────

module.exports = {
    NODE_ENV,
    PORT,
    JWT_SECRET,
    MONGO_URI,
    FRONTEND_URL,
    DOMAIN_URL,
    IS_PRODUCTION,
    IS_DEVELOPMENT,
    ALLOWED_ORIGINS,
};
