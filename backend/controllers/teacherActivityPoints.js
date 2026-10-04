'use strict';

const Activity = require('../models/Activity');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { ACTIVITY_STATUSES } = require('../src/config/constants');
const { processActivityAsync } = require('../src/services/activityQueue');

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
        
        // Admin/HOD logic if applicable
        if (['admin', 'principal', 'exam_controller'].includes(req.user.role)) {
            batchQuery = {};
        } else if (req.user.role === 'hod') {
            const user = await User.findById(req.user.userId);
            if (user && user.department) {
                batchQuery = { branch: new RegExp(`^${user.department}$`, 'i') };
            } else {
                batchQuery = { _id: null };
            }
        }

        if (batchId) {
            batchQuery._id = batchId;
        }

        const { studentId } = req.query;

        const batches = await Batch.find(batchQuery);
        const studentIds = batches.reduce((acc, batch) => [...acc, ...batch.students], []);

        if (studentId) {
            query.student = studentId;
        } else {
            query.student = { $in: studentIds };
        }
        
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

/**
 * POST /api/teacher/activities/:id/retry-ai
 * Retriggers the background AI extraction queue for a specific activity.
 */
exports.retryAiAnalysis = async (req, res, next) => {
    try {
        const activity = await Activity.findById(req.params.id);
        
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }
        
        if (activity.status === ACTIVITY_STATUSES.PROCESSING) {
            return res.status(400).json({ success: false, message: 'Activity is already being processed.' });
        }
        
        // Reset old data to prevent stale UI during retry
        activity.extractedData = null;
        activity.ktuRule = null;
        activity.status = ACTIVITY_STATUSES.PROCESSING;
        await activity.save();
        
        // Fire and forget
        processActivityAsync(activity._id).catch(console.error);
        
        return res.json({ 
            success: true, 
            message: 'AI analysis has been queued successfully. It may take up to 30 seconds.' 
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/teacher/activities/summary
 * Gets aggregated student activity points broken down by KTU Slabs
 */
exports.getStudentSummary = async (req, res, next) => {
    try {
        const { batchId } = req.query;
        let batchQuery = { createdBy: req.user.userId };
        
        if (['admin', 'principal', 'exam_controller'].includes(req.user.role)) {
            batchQuery = {};
        } else if (req.user.role === 'hod') {
            const user = await User.findById(req.user.userId);
            if (user && user.department) {
                batchQuery = { branch: new RegExp(`^${user.department}$`, 'i') };
            } else {
                batchQuery = { _id: null };
            }
        }
        if (batchId && batchId !== 'all') {
            batchQuery._id = batchId;
        }

        const batches = await Batch.find(batchQuery);
        const studentIds = batches.reduce((acc, batch) => [...acc, ...batch.students], []);

        const students = await User.find({ _id: { $in: studentIds } })
            .select('name rollNo email _id')
            .lean();

        const activities = await Activity.find({
            student: { $in: studentIds }
        }).lean();

        // KTU points limit is 40 per slab. Total limit 100/120.
        const summary = students.map(student => {
            const studentActivities = activities.filter(a => a.student.toString() === student._id.toString());
            
            let slab1Points = 0; // Rule 1.x
            let slab2Points = 0; // Rule 2.x
            let slab3Points = 0; // Rule 3.x
            let pendingCount = 0;

            studentActivities.forEach(act => {
                if ([ACTIVITY_STATUSES.PENDING_VERIFICATION, ACTIVITY_STATUSES.REVIEW_REQUIRED].includes(act.status)) {
                    pendingCount++;
                }
                
                // Only count VERIFIED or APPROVED
                if (act.status !== ACTIVITY_STATUSES.VERIFIED && act.status !== 'APPROVED') return;

                const points = act.awardedPoints !== undefined && act.awardedPoints !== null 
                    ? act.awardedPoints 
                    : (act.calculatedPoints || 0);
                
                if (!act.ktuRuleId) return;

                if (act.ktuRuleId.startsWith('1.')) {
                    slab1Points += points;
                } else if (act.ktuRuleId.startsWith('2.')) {
                    slab2Points += points;
                } else if (act.ktuRuleId.startsWith('3.')) {
                    slab3Points += points;
                }
            });

            return {
                ...student,
                slabs: {
                    slab1: Math.min(slab1Points, 40),
                    slab2: Math.min(slab2Points, 40),
                    slab3: Math.min(slab3Points, 40)
                },
                totalPoints: Math.min(slab1Points, 40) + Math.min(slab2Points, 40) + Math.min(slab3Points, 40),
                pendingCount
            };
        });

        // Sort by pending actions first, then name
        summary.sort((a, b) => {
            if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
            return a.name.localeCompare(b.name);
        });

        return res.json({ success: true, summary });
    } catch (err) {
        next(err);
    }
};
