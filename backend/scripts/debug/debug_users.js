const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = async () => {
    try {
        // Use the same DB logic as server.js (assuming simple URI or default)
        // For embedded, we need to connect to the running instance?
        // Actually, for persistent embedded, we can't easily connect from a separate script if the lock is held.
        // BUT, since the server is running, we can interpret 'process.env.MONGO_URI' if it was set?
        // No, embedded server generates a random URI or listen on a port?
        // If it is persistent, it uses a specific path.
        // We cannot access the WiredTiger files directly while another process (server.js) is using them.

        // ALTERNATIVE: Add a temporary GET /debug/users route to the server?
        // That is safer than trying to open the DB file twice.
        console.log("Cannot connect to embedded DB externally while it runs.");
    } catch (err) {
        console.error(err);
    }
};

// connectDB();
