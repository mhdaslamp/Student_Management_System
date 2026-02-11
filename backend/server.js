const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedAdmin = require('./utils/seed');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

// Database Connection
let mongod = null;

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;
        let isEmbedded = false;

        // Check if we should use embedded DB (if no MONGO_URI or explicit override)
        if (!mongoUri || mongoUri.includes('memory-server')) {
            try {
                mongod = await MongoMemoryServer.create({
                    instance: {
                        dbPath: path.join(dataDir, 'db'),
                        storageEngine: 'wiredTiger',
                    },
                    binary: {
                        version: '6.0.4',
                    },
                });
                mongoUri = mongod.getUri();
                isEmbedded = true;
                console.log('---------------------------------------------------');
                console.log('🚀 Using Embedded Persistent Database');
                console.log(`📂 Data stored in: ${path.join(dataDir, 'db')}`);
                console.log('---------------------------------------------------');
            } catch (err) {
                console.error('Failed to start embedded DB:', err);
                // Fallback to whatever env has, or fail
                if (!mongoUri) throw new Error('No MongoDB URI provided and embedded DB failed to start');
            }
        }

        await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${isEmbedded ? 'Embedded (Persistent)' : 'External URI'}`);

        // Seed Admin only if it doesn't exist
        await seedAdmin();

    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

// Handle cleanup
process.on('SIGINT', async () => {
    if (mongod) {
        await mongoose.disconnect();
        await mongod.stop();
    }
    process.exit(0);
});

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));

// Temporary Debug Route
app.get('/debug-users', async (req, res) => {
    const User = require('./models/User');
    const users = await User.find({}, 'name email role registerId admissionNo');
    res.json(users);
});

app.use('/api/student', require('./routes/student'));
app.use('/api/academic', require('./routes/academic'));

app.get('/', (req, res) => {
    res.send('Student Management System API is running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
