/**
 * @file constants.js
 * @description Central constants file for the backend.
 * All magic strings, enums, and shared config values live here.
 * Import from this file instead of declaring inline.
 */

// ─── User Roles ───────────────────────────────────────────────────────────────

const ROLES = Object.freeze({
    ADMIN:           'admin',
    TEACHER:         'teacher',
    STUDENT:         'student',
    EXAM_CONTROLLER: 'exam_controller',
    HOD:             'hod',
    PRINCIPAL:       'principal',
});

/** Roles that can approve/reject student requests */
const APPROVER_ROLES = Object.freeze([
    ROLES.TEACHER,
    ROLES.HOD,
    ROLES.PRINCIPAL,
]);

/** Roles that have global/admin-level access */
const ADMIN_ROLES = Object.freeze([
    ROLES.ADMIN,
    ROLES.EXAM_CONTROLLER,
    ROLES.PRINCIPAL,
]);

/** Roles that can view batch data */
const BATCH_VIEWER_ROLES = Object.freeze([
    ROLES.TEACHER,
    ROLES.ADMIN,
    ROLES.EXAM_CONTROLLER,
    ROLES.HOD,
    ROLES.PRINCIPAL,
]);

// ─── Grade System ─────────────────────────────────────────────────────────────

/**
 * KTU Grade-Point mapping.
 * Centralised here so SGPA calculations are always consistent.
 */
const GRADE_POINTS = Object.freeze({
    'S':        10,
    'A+':        9,
    'A':         8.5,
    'B+':        8,
    'B':         7.5,
    'C+':        7,
    'C':         6.5,
    'D':         6,
    'P':         5.5,
    'PASS':      5.5,
    'F':         0,
    'FE':        0,
    'I':         0,
    'ABSENT':    0,
    'WITHHELD':  0,
});

/**
 * Grades that constitute a failure in any subject.
 * Used in pass/fail analysis, result download, and analysis endpoints.
 */
const FAILED_GRADES = Object.freeze(['F', 'FE', 'I', 'ABSENT', 'Absent', 'WITHHELD']);

// ─── Academic ─────────────────────────────────────────────────────────────────

/** Supported KTU curriculum schemes */
const SUPPORTED_SCHEMES = Object.freeze(['2019', '2024']);

/** Default scheme when none can be detected from a PDF */
const DEFAULT_SCHEME = '2019';

/** College name — used in PDF and Excel report headers */
const COLLEGE_NAME = 'Musaliar College of Engineering & Technology';

/** College location — used in PDF headers */
const COLLEGE_LOCATION = 'Palakkad, Kerala — 679325';

// ─── Request Management ────────────────────────────────────────────────────────

/**
 * Default approval flow per request type.
 * Keys match the `type` field on the Request model.
 */
const DEFAULT_REQUEST_FLOWS = Object.freeze({
    bonafide:       ['tutor', 'hod', 'principal'],
    duty_leave:     ['tutor', 'hod'],
    lab_permission: ['tutor', 'hod'],
    custom:         [],  // student provides their own flow
});

/** Human-readable labels for request types (used in PDF and frontend) */
const REQUEST_TYPE_LABELS = Object.freeze({
    bonafide:       'Bonafide Certificate',
    duty_leave:     'Duty Leave',
    lab_permission: 'Lab / Classroom Permission',
    custom:         'Custom Request',
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** JWT token expiry — 7 days (was 1 hour, extended for better UX) */
const JWT_EXPIRY = '7d';

/** bcrypt salt rounds */
const BCRYPT_SALT_ROUNDS = 10;

// ─── File Upload ──────────────────────────────────────────────────────────────

/** Maximum allowed upload file size (10 MB) */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Allowed MIME types for student Excel uploads */
const ALLOWED_EXCEL_MIMETYPES = Object.freeze([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
]);

/** Allowed MIME types for result PDF uploads */
const ALLOWED_PDF_MIMETYPES = Object.freeze([
    'application/pdf',
]);

/** All allowed upload MIME types combined */
const ALLOWED_UPLOAD_MIMETYPES = Object.freeze([
    ...ALLOWED_EXCEL_MIMETYPES,
    ...ALLOWED_PDF_MIMETYPES,
]);

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    ROLES,
    APPROVER_ROLES,
    ADMIN_ROLES,
    BATCH_VIEWER_ROLES,
    GRADE_POINTS,
    FAILED_GRADES,
    SUPPORTED_SCHEMES,
    DEFAULT_SCHEME,
    COLLEGE_NAME,
    COLLEGE_LOCATION,
    DEFAULT_REQUEST_FLOWS,
    REQUEST_TYPE_LABELS,
    JWT_EXPIRY,
    BCRYPT_SALT_ROUNDS,
    MAX_FILE_SIZE_BYTES,
    ALLOWED_EXCEL_MIMETYPES,
    ALLOWED_PDF_MIMETYPES,
    ALLOWED_UPLOAD_MIMETYPES,
};
