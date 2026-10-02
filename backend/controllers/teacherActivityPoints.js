'use strict';

const Activity = require('../models/Activity');
const Batch = require('../models/Batch');
const { ACTIVITY_STATUSES } = require('../src/config/constants');

/**
 * GET /api/teacher/activities
 * Get activities for students managed by the teacher.
 * Can filter by status.
 */
exports.getActivities = async (req, res, next) => {
    try {
        const { status, batchId } = req.query;
        let query = {};

        // Find batches managed by this teacher
        let batchQuery = { createdBy: req.user.userId };
        
        // Admin/HOD logic if applicable (assuming admins can see all)
        if (['admin', 'principal', 'exam_controller'].includes(req.user.role)) {
            batchQuery = {};
        }

        if (batchId) {
            batchQuery._id = batchId;
        }

        const batches = await Batch.find(batchQuery);
        const studentIds = batches.reduce((acc, batch) => [...acc, ...batch.students], []);

        query.student = { $in: studentIds };
        
        if (status) {
            if (status.includes(',')) {
                query.status = { $in: status.split(',') };
            } else {
                query.status = status;
            }
        }

        const activities = await Activity.find(query)
            .populate('student', 'name registerId email rollNo branch admissionYear')
            .sort({ createdAt: -1 });

        return res.json({ success: true, activities });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/teacher/activities/:id/verify
 * Approve, reject, or request changes for an activity.
 * Allows overriding calculatedPoints via awardedPoints.
 */
exports.verifyActivity = async (req, res, next) => {
    try {
        const { status, verificationNote, awardedPoints } = req.body;

        if (!Object.values(ACTIVITY_STATUSES).includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status provided.' });
        }

        const activity = await Activity.findById(req.params.id).populate('student', 'name registerId email');
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }

        // Add verification entry
        const verificationEntry = {
            verifiedBy: req.user.userId,
            date: new Date(),
            previousStatus: activity.status,
            newStatus: status,
            note: verificationNote || '',
            awardedPoints: awardedPoints !== undefined ? awardedPoints : activity.calculatedPoints
        };

        activity.status = status;
        if (verificationNote) {
            activity.verificationNote = verificationNote;
        }
        
        // Teacher overrides the score
        if (awardedPoints !== undefined) {
            activity.awardedPoints = awardedPoints;
        } else if (activity.awardedPoints === null && ['APPROVED'].includes(status)) {
            // Default awarded points to calculated points if approving and no override
            activity.awardedPoints = activity.calculatedPoints;
        }

        activity.verificationHistory.push(verificationEntry);

        await activity.save();

        return res.json({
            success: true,
            message: `Activity successfully marked as ${status}.`,
            activity
        });
    } catch (err) {
        next(err);
    }
};
