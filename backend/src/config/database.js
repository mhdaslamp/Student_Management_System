/**
 * @file database.js
 * @description MongoDB connection manager.
 * Handles embedded (local dev) vs external (production/Atlas) URI selection,
 * graceful shutdown, and nodemon restart cleanup.
 */

const mongoose   = require('mongoose');
const path       = require('path');
const fs         = require('fs');
const { MONGO_URI, IS_PRODUCTION } = require('./env');

// Only import MongoMemoryServer in non-production environments
let MongoMemoryServer;
if (!IS_PRODUCTION) {
    try {
        MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
    } catch (e) {
        // Not installed (e.g. in prod where it's a devDependency) — fine, MONGO_URI will be used
    }
}

const seedAdmin  = require('../../utils/seed');

// Reference kept so gracefulShutdown can stop the embedded server
let mongod = null;

// ─── Data directory for embedded DB ────────────────────────────────────────────
const dataDir = path.join(__dirname, '../../data');
const dbPath  = path.join(dataDir, 'db');

/**
 * Ensures the local data/db directory exists (no-op in production).
 */
const ensureDataDir = () => {
    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
    }
};

/**
 * Removes stale mongod.lock file to fix Windows restart issues.
 */
const clearLockFile = () => {
    const lockFile = path.join(dbPath, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
        try {
            fs.unlinkSync(lockFile);
        } catch (e) {
            console.warn('⚠️  Could not remove mongod.lock (may be in use):', e.message);
        }
    }
};

/**
 * Starts the embedded MongoDB Memory Server (local dev only).
 * Uses wiredTiger storage so data persists across restarts.
 * @returns {string} The connection URI of the started embedded server
 */
const startEmbeddedDB = async () => {
    ensureDataDir();
    clearLockFile();

    mongod = await MongoMemoryServer.create({
        instance: {
            dbPath,
            storageEngine: 'wiredTiger',
            port: 27017,
        },
        binary: {
            version: '6.0.4',
        },
    });

    const uri = mongod.getUri();
    console.log('--------------------------------------------------');
    console.log('🚀 Using Embedded Persistent Database (Local Dev)');
    console.log(`📂 Data stored in: ${dbPath}`);
    console.log('--------------------------------------------------');
    return uri;
};

/**
 * Connects to MongoDB.
 * - Production: uses MONGO_URI from env (Atlas)
 * - Development: falls back to embedded MongoDB if MONGO_URI is not set
 */
const connectDB = async () => {
    try {
        let uri = MONGO_URI;

        if (!uri) {
            if (IS_PRODUCTION) {
                throw new Error('MONGO_URI must be set in production. Check your environment variables.');
            }
            if (!MongoMemoryServer) {
                throw new Error('mongodb-memory-server is not installed. Install it as a devDependency or set MONGO_URI.');
            }
            uri = await startEmbeddedDB();
        } else {
            // Mask credentials in logs
            const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
            console.log(`📡 Connecting to External MongoDB: ${maskedUri}`);
        }

        await mongoose.connect(uri);
        console.log('✅ MongoDB connected successfully!');

        // Seed the default admin account if it doesn't exist
        await seedAdmin();

    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

/**
 * Gracefully shuts down the DB connection and embedded server (if running).
 * Called on SIGINT / SIGTERM.
 */
const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down...');
    try {
        await mongoose.disconnect();
        if (mongod) {
            await mongod.stop();
            console.log('🛑 Embedded MongoDB stopped.');
        }
    } catch (err) {
        console.error('Error during shutdown:', err.message);
    }
    process.exit(0);
};

/**
 * Re-registers the SIGUSR2 signal for nodemon compatibility.
 * Nodemon sends SIGUSR2 before restart — we stop the embedded DB cleanly.
 */
const setupNodemonSignal = () => {
    process.once('SIGUSR2', async () => {
        try {
            await mongoose.disconnect();
            if (mongod) await mongod.stop();
        } catch (err) {
            console.error('Error on nodemon restart:', err.message);
        }
        process.kill(process.pid, 'SIGUSR2');
    });
};

module.exports = { connectDB, gracefulShutdown, setupNodemonSignal };
