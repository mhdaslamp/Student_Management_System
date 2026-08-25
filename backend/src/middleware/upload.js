/**
 * @file upload.js
 * @description Centralized Multer configuration.
 * Provides two pre-configured upload instances:
 *   - diskUpload  — saves files to disk (Excel uploads for students/internal marks)
 *   - memoryUpload — holds file in memory (PDF result uploads processed in-memory)
 *
 * Both enforce:
 *   - File type whitelist (xlsx, xls, pdf)
 *   - 10 MB max file size
 */

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const {
    MAX_FILE_SIZE_BYTES,
    ALLOWED_EXCEL_MIMETYPES,
    ALLOWED_PDF_MIMETYPES,
    ALLOWED_UPLOAD_MIMETYPES,
} = require('../config/constants');

// ─── Disk Storage (for Excel files) ────────────────────────────────────────────

const uploadsDir = path.join(__dirname, '../../uploads');

/** Ensures the uploads directory exists on startup */
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Prefix with timestamp to avoid filename collisions
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

// ─── File Filter ───────────────────────────────────────────────────────────────

/**
 * Rejects files that are not in the allowed MIME type list.
 * Also checks the file extension as a second layer of validation.
 */
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(xlsx|xls|pdf)$/i;
    const extValid  = allowedExtensions.test(path.extname(file.originalname));
    const mimeValid = ALLOWED_UPLOAD_MIMETYPES.includes(file.mimetype);

    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(
            Object.assign(new Error('Invalid file type. Only .xlsx, .xls, and .pdf files are allowed.'), {
                statusCode: 400,
            }),
            false,
        );
    }
};

/** Shared Multer limits */
const limits = {
    fileSize: MAX_FILE_SIZE_BYTES,
};

// ─── Exported Upload Instances ─────────────────────────────────────────────────

/**
 * diskUpload — saves file to `backend/uploads/` on disk.
 * Use for: student Excel uploads, internal marks Excel uploads.
 * After processing, always call fs.unlinkSync(req.file.path) to clean up.
 */
const diskUpload = multer({ storage: diskStorage, fileFilter, limits });

/**
 * memoryUpload — holds file buffer in memory (req.file.buffer).
 * Use for: PDF result uploads that are parsed and not stored.
 */
const memoryUpload = multer({ storage: multer.memoryStorage(), fileFilter, limits });

/**
 * pdfOnly — memory storage, only accepts PDF files.
 * Convenience wrapper for PDF-specific routes.
 */
const pdfFileFilter = (req, file, cb) => {
    const extValid  = /\.pdf$/i.test(path.extname(file.originalname));
    const mimeValid = ALLOWED_PDF_MIMETYPES.includes(file.mimetype);
    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(
            Object.assign(new Error('Invalid file type. Only PDF files are allowed.'), { statusCode: 400 }),
            false,
        );
    }
};
const pdfOnly = multer({ storage: multer.memoryStorage(), fileFilter: pdfFileFilter, limits });

/**
 * excelOnly — disk storage, only accepts Excel files.
 * Convenience wrapper for Excel-specific routes.
 */
const excelFileFilter = (req, file, cb) => {
    const extValid  = /\.(xlsx|xls)$/i.test(path.extname(file.originalname));
    const mimeValid = ALLOWED_EXCEL_MIMETYPES.includes(file.mimetype);
    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(
            Object.assign(new Error('Invalid file type. Only .xlsx and .xls files are allowed.'), { statusCode: 400 }),
            false,
        );
    }
};
const excelOnly = multer({ storage: diskStorage, fileFilter: excelFileFilter, limits });

module.exports = { diskUpload, memoryUpload, pdfOnly, excelOnly };
