const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.addTeacher = async (req, res) => {
    const { name, email, password, department } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            department,
            role: 'teacher'
        });

        await user.save();
        res.json({ message: 'Teacher added successfully', teacher: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        res.json(teachers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateTeacher = async (req, res) => {
    const { name, email, department, password } = req.body;
    try {
        let teacher = await User.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // Check if updating email conflicts with another user
        if (email && email !== teacher.email) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        teacher.name = name || teacher.name;
        teacher.email = email || teacher.email;
        teacher.department = department || teacher.department;

        // Handle password update if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            teacher.password = await bcrypt.hash(password, salt);
        }

        await teacher.save();
        res.json({ message: 'Teacher updated successfully', teacher });
    } catch (err) {
        console.error('Update Teacher Error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Return the specific error message to the frontend for debugging
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // Use deleteOne() instead of remove() which is deprecated
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'Teacher removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(500).send('Server Error');
    }
};
