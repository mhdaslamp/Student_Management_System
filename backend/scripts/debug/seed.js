const mongoose = require('mongoose');
const path = require('path');
const User = require('../../models/User'); // corrected path from scripts/debug/
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit();
        }

        const adminEmail = process.env.SEED_ADMIN_EMAIL;
        const adminPassword = process.env.SEED_ADMIN_PASSWORD;
        const adminName = process.env.SEED_ADMIN_NAME || 'Admin User';

        if (!adminEmail || !adminPassword) {
            console.error('Error: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
            process.exit(1);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const admin = new User({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log(`Admin created: ${adminEmail}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
