const mongoose = require('mongoose');
const path = require('path');
const User = require('../../models/User'); // corrected path from scripts/debug/
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_management_system')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedTeacher = async () => {
    try {
        const teacherEmail = process.env.SEED_TEACHER_EMAIL;
        const teacherPassword = process.env.SEED_TEACHER_PASSWORD;
        const teacherDept = process.env.SEED_TEACHER_DEPT || 'CSE';

        if (!teacherEmail || !teacherPassword) {
            console.error('Error: SEED_TEACHER_EMAIL and SEED_TEACHER_PASSWORD must be set in .env');
            process.exit(1);
        }

        const existingTeacher = await User.findOne({ email: teacherEmail });
        if (existingTeacher) {
            console.log(`Teacher ${teacherEmail} already exists. Updating password.`);
            const salt = await bcrypt.genSalt(10);
            existingTeacher.password = await bcrypt.hash(teacherPassword, salt);
            await existingTeacher.save();
            console.log('Password reset successfully.');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(teacherPassword, salt);

        const teacher = new User({
            name: 'Test Teacher',
            email: teacherEmail,
            password: hashedPassword,
            role: 'teacher',
            department: teacherDept
        });

        await teacher.save();
        console.log(`Teacher created: ${teacherEmail}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTeacher();
