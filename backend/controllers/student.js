const User           = require('../models/User');
const InternalResult = require('../models/InternalResult'); // top-level import, not inside function

/**
 * GET /api/student/me
 * Returns the authenticated student's profile including batch info.
 */
exports.getMe = async (req, res, next) => {
    try {
        const student = await User.findById(req.user.userId)
            .select('-password')
            .populate('batch', 'name branch scheme');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/student/internal
 * Returns all internal assessment results for the authenticated student.
 */
exports.getInternalResults = async (req, res, next) => {
    try {
        const results = await InternalResult.find({ student: req.user.userId })
            .populate('batch', 'name branch scheme')
            .sort({ createdAt: -1 });

        res.json(results);
    } catch (err) {
        next(err);
    }
};
