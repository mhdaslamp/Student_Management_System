const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/certificates';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

router.get('/me', auth('student'), studentController.getMe);
router.get('/internal', auth('student'), studentController.getInternalResults);

router.post('/certificates', auth('student'), upload.single('file'), studentController.uploadCertificate);
router.get('/certificates', auth('student'), studentController.getCertificates);

module.exports = router;
