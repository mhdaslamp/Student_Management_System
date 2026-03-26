const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    activityDetails: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    activityLevel: {
        type: String,
        enum: ['College Event', 'Zonal Event', 'State Event', 'University Event', 'National Event', 'International Event'],
        required: true
    },
    prize: {
        type: String,
        enum: ['First', 'Second', 'Third', 'Other', 'None'],
        required: true
    },
    dates: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    proofDetails: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
