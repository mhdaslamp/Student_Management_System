const User = require('../models/User');

exports.getMe = async (req, res) => {
    try {
        const student = await User.findById(req.user.userId).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getInternalResults = async (req, res) => {
    try {
        const InternalResult = require('../models/InternalResult');
        const results = await InternalResult.find({ student: req.user.userId })
            .populate('batch', 'name branch scheme')
            .sort({ createdAt: -1 });

        res.json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.uploadCertificate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Certificate title is required' });
        }

        const Certificate = require('../models/Certificate');
        const newCert = new Certificate({
            student: req.user.userId,
            title,
            fileUrl: `/uploads/certificates/${req.file.filename}`
        });
        await newCert.save();
        res.status(201).json(newCert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getCertificates = async (req, res) => {
    try {
        const Certificate = require('../models/Certificate');
        const certificates = await Certificate.find({ student: req.user.userId }).sort({ createdAt: -1 });
        res.json(certificates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
