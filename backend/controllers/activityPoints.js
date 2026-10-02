/**
 * @file controllers/activityPoints.js
 * @description KTU Activity Points CRUD controller.
 * All operations are scoped to the authenticated student (req.user.userId).
 */

'use strict';

const path     = require('path');
const fs       = require('fs');
const Activity = require('../models/Activity');
const { calculatePoints } = require('../src/services/ktuPointsEngine');
const { processActivityAsync } = require('../src/services/activityQueue');
const {
    ACTIVITY_TYPES,
    ACTIVITY_STATUSES,
} = require('../src/config/constants');

// --- Helpers ------------------------------------------------------------------

/** Resolves the ACTIVITY_TYPES metadata object for a given ktuRuleId. */
const getActivityTypeMeta = (ruleId) => ACTIVITY_TYPES.find(t => t.id === ruleId);

/**
 * Builds the evidence sub-document from a multer file object.
 * @param {object} file - req.file from multer
 * @returns {{ filePath, originalName, mimetype, sizeBytes, uploadedAt }}
 */
const buildEvidenceDoc = (file) => ({
    filePath:     file.path, // Cloudinary URL
    originalName: file.originalname,
    mimetype:     file.mimetype,
    sizeBytes:    file.size,
    uploadedAt:   new Date(),
});

/**
 * Deletes an evidence file from disk if it exists.
 * @param {string} filePath - relative path stored in DB (e.g. 'uploads/evidence/...')
 */
const deleteEvidenceFile = (filePath) => {
    if (!filePath || filePath.startsWith('http')) return; // Cloudinary handles its own storage
    const abs = path.join(__dirname, '..', filePath);
    if (fs.existsSync(abs)) {
        fs.unlinkSync(abs);
    }
};

// --- Controllers --------------------------------------------------------------

/**
 * POST /api/activity-points
 * Create a new activity record for the authenticated student.
 * Requires multipart/form-data with an 'evidence' file field.
 */
exports.createActivity = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Evidence file is required.' });
        }

        const {
            ktuRuleId, activityName, semester,
            activityDate, startDate, endDate,
            eventLevel, achievementType, scoreOrRank, stageOrPhase,
            organizer, otherDescription,
        } = req.body;

        // Validate that the ktuRuleId is a known activity type
        const typeMeta = getActivityTypeMeta(ktuRuleId);
        if (!typeMeta) {
            deleteEvidenceFile(path.join('uploads', 'evidence', path.basename(req.file.path)));
            return res.status(400).json({ success: false, message: 'Invalid activity type.' });
        }

        const activity = new Activity({
            student:          req.user.userId,
            ktuRuleId,
            activityGroup:    typeMeta.group,
            activityLabel:    typeMeta.label,
            activityName,
            semester,
            activityDate:     activityDate  || undefined,
            startDate:        startDate     || undefined,
            endDate:          endDate       || undefined,
            eventLevel:       eventLevel    || undefined,
            achievementType:  achievementType || undefined,
            scoreOrRank:      scoreOrRank   || undefined,
            stageOrPhase:     stageOrPhase  || undefined,
            organizer,
            otherDescription: otherDescription || undefined,
            evidence:         buildEvidenceDoc(req.file),
            status:           ACTIVITY_STATUSES.SUBMITTED,
        });

        const pointsData = calculatePoints(activity);
        activity.calculatedPoints = pointsData.points;
        activity.ktuRule = { breakdown: pointsData.breakdown };

        await activity.save();

        // Fire AI pipeline in background (non-blocking)
        setImmediate(() => processActivityAsync(activity._id.toString()));

        return res.status(201).json({
            success: true,
            message: 'Activity submitted successfully.',
            activity,
        });
    } catch (err) {
        // Clean up uploaded file if DB save fails
        if (req.file) {
            deleteEvidenceFile(path.join('uploads', 'evidence', path.basename(req.file.path)));
        }
        next(err);
    }
};

/**
 * GET /api/activity-points
 * List all activities for the authenticated student.
 */
exports.getMyActivities = async (req, res, next) => {
    try {
        const { semester, status, group } = req.query;
        const filter = { student: req.user.userId };

        if (semester) filter.semester     = semester;
        if (status)   filter.status       = status;
        if (group)    filter.activityGroup = group;

        const activities = await Activity
            .find(filter)
            .select('-extractedData -ktuRule -verificationHistory')
            .sort({ createdAt: -1 });

        return res.json({ success: true, activities });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/activity-points/:id
 * Get a single activity (ownership-checked).
 */
exports.getActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findOne({
            _id:     req.params.id,
            student: req.user.userId,
        });

        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }

        return res.json({ success: true, activity });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/activity-points/:id
 * Update an activity. Only allowed while status is DRAFT or SUBMITTED.
 * A new evidence file is optional � if not provided, the existing file is kept.
 */
exports.updateActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findOne({
            _id:     req.params.id,
            student: req.user.userId,
        });

        if (!activity) {
            if (req.file) deleteEvidenceFile(path.join('uploads', 'evidence', path.basename(req.file.path)));
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }

        // Allow edits while pending
        const editableStatuses = [ACTIVITY_STATUSES.DRAFT, ACTIVITY_STATUSES.SUBMITTED, ACTIVITY_STATUSES.PROCESSING, ACTIVITY_STATUSES.REVIEW_REQUIRED, ACTIVITY_STATUSES.PENDING_VERIFICATION];
        if (!editableStatuses.includes(activity.status)) {
            if (req.file) deleteEvidenceFile(path.join('uploads', 'evidence', path.basename(req.file.path)));
            return res.status(400).json({
                success: false,
                message: `Cannot edit an activity with status "${activity.status}".`,
            });
        }

        const {
            ktuRuleId, activityName, semester,
            activityDate, startDate, endDate,
            eventLevel, achievementType, scoreOrRank, stageOrPhase,
            organizer, otherDescription,
        } = req.body;

        // If ktuRuleId is changing, validate it
        if (ktuRuleId && ktuRuleId !== activity.ktuRuleId) {
            const typeMeta = getActivityTypeMeta(ktuRuleId);
            if (!typeMeta) {
                if (req.file) deleteEvidenceFile(path.join('uploads', 'evidence', path.basename(req.file.path)));
                return res.status(400).json({ success: false, message: 'Invalid activity type.' });
            }
            activity.ktuRuleId     = ktuRuleId;
            activity.activityGroup = typeMeta.group;
            activity.activityLabel = typeMeta.label;
        }

        if (activityName)     activity.activityName     = activityName;
        if (semester)         activity.semester         = semester;
        if (activityDate)     activity.activityDate     = new Date(activityDate);
        if (startDate)        activity.startDate        = new Date(startDate);
        if (endDate)          activity.endDate          = new Date(endDate);
        if (eventLevel)       activity.eventLevel       = eventLevel;
        if (achievementType)  activity.achievementType  = achievementType;
        if (scoreOrRank)      activity.scoreOrRank      = scoreOrRank;
        if (stageOrPhase)     activity.stageOrPhase     = stageOrPhase;
        if (organizer)        activity.organizer        = organizer;
        if (otherDescription !== undefined) activity.otherDescription = otherDescription;

        // Replace evidence file if a new one was uploaded
        if (req.file) {
            const oldPath = activity.evidence?.filePath;
            activity.evidence = buildEvidenceDoc(req.file);
            deleteEvidenceFile(oldPath);
        }

        const pointsData = calculatePoints(activity);
        activity.calculatedPoints = pointsData.points;
        activity.ktuRule = { breakdown: pointsData.breakdown };

        await activity.save();

        return res.json({ success: true, message: 'Activity updated successfully.', activity });
    } catch (err) {
        if (req.file) deleteEvidenceFile(path.join('uploads', 'evidence', path.basename(req.file.path)));
        next(err);
    }
};

/**
 * DELETE /api/activity-points/:id
 * Delete an activity and its evidence file.
 * Only allowed while status is DRAFT or SUBMITTED.
 */
exports.deleteActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findOne({
            _id:     req.params.id,
            student: req.user.userId,
        });

        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }

        const editableStatuses = [ACTIVITY_STATUSES.DRAFT, ACTIVITY_STATUSES.SUBMITTED, ACTIVITY_STATUSES.PROCESSING, ACTIVITY_STATUSES.REVIEW_REQUIRED, ACTIVITY_STATUSES.PENDING_VERIFICATION];
        if (!editableStatuses.includes(activity.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete an activity with status "${activity.status}".`,
            });
        }

        // Delete evidence file from disk
        deleteEvidenceFile(activity.evidence?.filePath);

        await activity.deleteOne();

        return res.json({ success: true, message: 'Activity deleted successfully.' });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/activity-points/:id/evidence
 * Stream the evidence file to the client.
 * Forces download with the original filename.
 */
exports.getEvidence = async (req, res, next) => {
    try {
        const activity = await Activity.findOne({
            _id:     req.params.id,
            student: req.user.userId,
        }).select('evidence');

        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found.' });
        }

        const filePath = path.join(__dirname, '..', activity.evidence.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Evidence file not found on disk.' });
        }

        res.setHeader('Content-Disposition', `inline; filename="${activity.evidence.originalName}"`);
        res.setHeader('Content-Type', activity.evidence.mimetype || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        next(err);
    }
};
