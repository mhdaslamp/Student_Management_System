const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    scheme: {
        type: String,
        enum: ['2019', '2024'],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // ─── Directory Sync fields ──────────────────────────────────────────
    admissionYear: {
        type: String,               // e.g. '2023'
    },
    studentType: {
        type: String,
        enum: ['regular', 'lateral'],
        default: 'regular',
    },
    lastSyncedAt: {
        type: Date,                 // timestamp of last directory sync
    },
}, { timestamps: true });

module.exports = mongoose.model('Batch', BatchSchema);
