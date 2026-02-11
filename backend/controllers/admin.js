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
