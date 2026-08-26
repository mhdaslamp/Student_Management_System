const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { JWT_SECRET }                       = require('../src/config/env');
const { JWT_EXPIRY, BCRYPT_SALT_ROUNDS }   = require('../src/config/constants');


exports.login = async (req, res, next) => {
    const { email, password, admissionNo } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (admissionNo) {
            user = await User.findOne({ admissionNo });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const payload = {
            userId: user._id,
            role:   user.role,
            name:   user.name,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        res.json({
            token,
            user: {
                id:         user._id,
                name:       user.name,
                role:       user.role,
                email:      user.email,
                department: user.department,
            },
        });
    } catch (err) {
        next(err);
    }
};


// Creates the initial admin account (run once on first deploy, then protect this route)
exports.createInitialAdmin = async (req, res, next) => {
    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({ name, email, password: hashedPassword, role: 'admin' });
        await newAdmin.save();

        res.status(201).json({ success: true, message: 'Admin created successfully' });
    } catch (err) {
        next(err);
    }
};

