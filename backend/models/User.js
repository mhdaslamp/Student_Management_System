const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: function () { return this.role === 'admin' || this.role === 'teacher'; },
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        // Only required for admin (staff use Google Sign-In, students use Google Sign-In)
        required: function () { return this.role === 'admin'; }
    },
    department: {
        type: String,
    },
    designation: {
        type: String,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student', 'hod', 'principal'],
        required: true
    },
    // Specific to students
    registerId: {
        type: String,
        unique: true,
        sparse: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    // ─── Google / Firebase fields ───────────────────────────────────────────
    googleId: {
        type: String,
        unique: true,
        sparse: true,           // allows multiple null values
    },
    syncedFromDirectory: {
        type: Boolean,
        default: false,         // true = auto-synced from Google directory
    },
    studentType: {
        type: String,
        enum: ['regular', 'lateral'],
        default: 'regular',
    },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
