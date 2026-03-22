const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = async () => {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin account already exists.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Admin User',
            email: 'admin@admin.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Admin account seeded: admin@admin.com / admin123');
    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
    }
};
