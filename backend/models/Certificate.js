const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
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
