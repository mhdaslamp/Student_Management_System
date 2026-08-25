/**
 * @file server.js
 * @description Application entry point.
 * Responsibilities: load env → connect DB → start HTTP server.
 * All Express app config (middleware, routes, errors) lives in app.js.
 */

// 1. Load and validate environment variables first
require('./src/config/env');

const { PORT }                                    = require('./src/config/env');
const { connectDB, gracefulShutdown, setupNodemonSignal } = require('./src/config/database');
const app                                         = require('./app');

// 2. Register process signal handlers for graceful shutdown
process.on('SIGINT',  gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
setupNodemonSignal();

// 3. Connect to database (embedded locally, Atlas in production)
connectDB();

// 4. Start HTTP server
app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
