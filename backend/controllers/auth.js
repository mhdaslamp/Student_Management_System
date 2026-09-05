const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { JWT_SECRET }                       = require('../src/config/env');
const { JWT_EXPIRY, BCRYPT_SALT_ROUNDS }   = require('../src/config/constants');
const { verifyIdToken }                    = require('../src/services/firebaseAdmin');

exports.login = async (req, res, next) => {
    const { email, password, registerId, admissionNo } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (registerId || admissionNo) {
            const reg = registerId || admissionNo;
            user = await User.findOne({ registerId: reg });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Please sign in with Google' });
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

// ─── Google Sign-In ──────────────────────────────────────────────────────────

exports.googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'No ID token provided.' });
        }

        // 1. Verify the token with Firebase Admin
        const decodedToken = await verifyIdToken(idToken);
        const { email, uid: googleId, name: googleName } = decodedToken;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account has no email.' });
        }

        // 2. Domain check (Backend enforcement)
        const COLLEGE_DOMAIN = process.env.COLLEGE_DOMAIN || 'gecskp.ac.in';
        if (!email.endsWith('@' + COLLEGE_DOMAIN)) {
            return res.status(403).json({ success: false, message: 'Access restricted to ' + COLLEGE_DOMAIN + ' accounts.' });
        }

        // 3. Find the user in our database (by email or googleId)
        let user = await User.findOne({
            $or: [{ email }, { googleId }]
        });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Account not found in the system. If you are a student, please contact your admin to sync the directory.'
            });
        }

        // 4. Update googleId if this is their first time signing in with Google
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        // 5. Generate our own JWT (keeps the rest of the app untouched)
        const payload = {
            userId: user._id,
            role:   user.role,
            name:   user.name,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        res.json({
            success: true,
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
        console.error('Google Login Error:', err);
        return res.status(401).json({ success: false, message: 'Invalid or expired Google token.' });
    }
};
