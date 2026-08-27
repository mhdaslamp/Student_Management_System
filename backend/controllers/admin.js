const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { BCRYPT_SALT_ROUNDS, ROLES } = require('../src/config/constants');

exports.addStaff = async (req, res, next) => {
    const { name, email, password, department, role, designation } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Validate Role
        const validRoles = [ROLES.TEACHER, ROLES.HOD, ROLES.PRINCIPAL, ROLES.ADMIN];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified' });
        }

        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            designation,
            department: (role === ROLES.TEACHER || role === ROLES.HOD) ? department : undefined
        });

        await newUser.save();
        res.status(201).json({ success: true, message: `${role} added successfully`, user: newUser });
    } catch (err) {
        next(err);
    }
};

exports.getStaff = async (req, res, next) => {
    try {
        const { role } = req.query;
        let query = { role: { $in: [ROLES.TEACHER, ROLES.HOD, ROLES.PRINCIPAL, ROLES.ADMIN] } };

        if (role) {
            query.role = role;
        }

        const staff = await User.find(query).select('-password');
        res.json(staff);
    } catch (err) {
        next(err);
    }
};

exports.updateStaff = async (req, res, next) => {
    const { name, email, department, password } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if updating email conflicts with another user
        if (email && email !== user.email) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (department) user.department = department;

        // Handle password update if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ success: true, message: 'User updated successfully', user });
    } catch (err) {
        next(err);
    }
};

exports.deleteStaff = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'User removed' });
    } catch (err) {
        next(err);
    }
};
