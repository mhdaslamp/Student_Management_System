/**
 * @file models/Activity.js
 * @description KTU Activity Points record.
 *
 * Architecture — each concept is separated for extensibility:
 *   1. Activity Record  - student-submitted data (this model core fields)
 *   2. Evidence         - uploaded file reference (evidence sub-document)
 *   3. Extracted Data   - AI/OCR output           (Step 2 - extractedData field)
 *   4. KTU Rule         - matched rule             (Step 3 - ktuRule field)
 *   5. Calculated Points- computed points          (Step 4 - calculatedPoints)
 *   6. Verification     - SFA approval trail       (Step 5 - verificationHistory)
 */

'use strict';

const mongoose = require('mongoose');
const {
    ACTIVITY_TYPES,
    ACTIVITY_LEVELS,
    ACTIVITY_ACHIEVEMENT_TYPES,
    ACTIVITY_STATUSES,
    SEMESTERS,
} = require('../src/config/constants');

// Evidence Sub-Document
const evidenceSchema = new mongoose.Schema({
    filePath:     { type: String, required: true },
    originalName: { type: String },
    mimetype:     { type: String },
    sizeBytes:    { type: Number },
    uploadedAt:   { type: Date, default: Date.now },
}, { _id: false });

// Main Activity Schema
const activitySchema = new mongoose.Schema({

    student: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
        index:    true,
    },

    ktuRuleId: {
        type: String,
        enum: ACTIVITY_TYPES.map(t => t.id),
        required: true,
    },

    activityGroup: {
        type: String,
        enum: ['I', 'II', 'III'],
        required: true,
    },

    activityLabel: {
        type: String,
        required: true,
    },

    activityName: {
        type:     String,
        required: true,
        trim:     true,
    },

    semester: {
        type:     String,
        enum:     SEMESTERS,
        required: true,
    },

    activityDate: { type: Date },
    startDate:    { type: Date },
    endDate:      { type: Date },

    eventLevel: {
        type: String,
        enum: [...ACTIVITY_LEVELS.map(l => l.id), null],
    },

    achievementType: {
        type: String,
        enum: [...ACTIVITY_ACHIEVEMENT_TYPES.map(a => a.id), null],
    },

    scoreOrRank: {
        type: String,
        trim: true,
    },

    stageOrPhase: {
        type: String,
        trim: true,
    },

    organizer: {
        type:     String,
        required: true,
        trim:     true,
    },

    otherDescription: {
        type: String,
        trim: true,
    },

    evidence: {
        type:     evidenceSchema,
        required: true,
    },

    status: {
        type:    String,
        enum:    Object.values(ACTIVITY_STATUSES),
        default: ACTIVITY_STATUSES.SUBMITTED,
        index:   true,
    },

    // Future step placeholders
    extractedData:       { type: mongoose.Schema.Types.Mixed, default: null },
    ktuRule:             { type: mongoose.Schema.Types.Mixed, default: null },
    calculatedPoints:    { type: Number, default: null },
    awardedPoints:       { type: Number, default: null },
    verificationHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
    verificationNote:    { type: String },

}, { timestamps: true });

activitySchema.index({ student: 1, createdAt: -1 });
activitySchema.index({ student: 1, semester: 1 });
activitySchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Activity', activitySchema);
