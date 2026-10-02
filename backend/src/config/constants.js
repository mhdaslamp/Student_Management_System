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
    ROLES.PRINCIPAL,
]);

/** Roles that can view batch data */
const BATCH_VIEWER_ROLES = Object.freeze([
    ROLES.TEACHER,
    ROLES.ADMIN,
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

// ─── Activity Points (KTU 2024 Scheme) ───────────────────────────────────────

/**
 * Semesters for the activity points system.
 */
const SEMESTERS = Object.freeze(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']);

/**
 * Activity workflow statuses.
 * DRAFT       → saved but not submitted
 * SUBMITTED   → submitted by student, awaiting SFA review
 * PROCESSING  → AI/OCR extraction running (Step 2)
 * REVIEW_REQUIRED → extraction needs student correction
 * PENDING_VERIFICATION → awaiting SFA/Tutor sign-off
 * VERIFIED    → approved, points confirmed
 * REJECTED    → rejected by SFA
 */
const ACTIVITY_STATUSES = Object.freeze({
    DRAFT:                'DRAFT',
    SUBMITTED:            'SUBMITTED',
    PROCESSING:           'PROCESSING',
    REVIEW_REQUIRED:      'REVIEW_REQUIRED',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    VERIFIED:             'VERIFIED',
    REJECTED:             'REJECTED',
});

/**
 * Event levels — used for level-based point activities (sports, tech fest, etc.)
 * Maps to KTU's Level 1–5 terminology.
 */
const ACTIVITY_LEVELS = Object.freeze([
    { id: 'college',       label: 'College Event',       ktuLevel: 1 },
    { id: 'zonal',         label: 'Zonal Event',         ktuLevel: 2 },
    { id: 'state',         label: 'State Event',         ktuLevel: 3 },
    { id: 'national',      label: 'National Event',      ktuLevel: 4 },
    { id: 'international', label: 'International Event', ktuLevel: 5 },
]);

/**
 * Achievement sub-types for competition/event activities.
 * Determines whether participation or winning points apply.
 */
const ACTIVITY_ACHIEVEMENT_TYPES = Object.freeze([
    { id: 'participation', label: 'Participation' },
    { id: 'first',         label: '1st Prize / Winner' },
    { id: 'second',        label: '2nd Prize' },
    { id: 'third',         label: '3rd Prize' },
    { id: 'completed',     label: 'Completed / Certified' },
    { id: 'qualified',     label: 'Qualified / Valid Score' },
]);

/**
 * All KTU Activity Types (2024 Scheme) — rules 1.1 to 3.17.
 *
 * Metadata flags drive adaptive form field visibility:
 *   hasLevel       → show "Event Level" dropdown (college/zonal/state/national/international)
 *   hasAchievement → show "Achievement / Result" dropdown (participation/1st/2nd/3rd)
 *   hasScore       → show "Score / Band / Rank" text field
 *   hasStage       → show "Stage / Phase" dropdown (specific options per activity)
 *   hasDuration    → show "Start Date + End Date" (duration-based)
 *   isDateRange    → default to date range picker instead of single date
 */
const ACTIVITY_TYPES = Object.freeze([
    // ─── GROUP I ──────────────────────────────────────────────────────────────
    {
        id: '1.1', group: 'I',
        label: 'Sports / Games / Arts — Participation',
        hasLevel: true, hasAchievement: false,
    },
    {
        id: '1.2', group: 'I',
        label: 'Sports / Games / Arts — Winner (Single Event)',
        hasLevel: true, hasAchievement: true,
    },
    {
        id: '1.3', group: 'I',
        label: 'Sports / Games / Arts — Winner (Group Event)',
        hasLevel: true, hasAchievement: true,
    },
    {
        id: '1.4', group: 'I',
        label: 'College Magazine Publication',
    },
    {
        id: '1.5', group: 'I',
        label: 'Four-Wheeler Driving Licence',
    },
    {
        id: '1.6', group: 'I',
        label: 'Community Service / Allied Activities (2 Days)',
    },
    {
        id: '1.7', group: 'I',
        label: 'Community Service / Allied Activities (Up to 1 Week)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '1.8', group: 'I',
        label: 'Blood Donation',
    },
    {
        id: '1.9', group: 'I',
        label: 'THRIVE Project (min 5 days/semester)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '1.10', group: 'I',
        label: 'Tree Planting',
    },
    {
        id: '1.11', group: 'I',
        label: 'NSS — 2-Year Volunteership',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '1.12', group: 'I',
        label: 'NSS — University Leadership Camp (100 hrs)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '1.13', group: 'I',
        label: 'NSS — State Level NSS Festival Winner',
        hasAchievement: true,
    },
    {
        id: '1.14', group: 'I',
        label: 'NSS / NCC — Special Service Certificate (State/NCC Directorate)',
    },
    {
        id: '1.15', group: 'I',
        label: 'NSS / NCC — State or National Award Recipient',
        hasLevel: false, hasStage: true,
        stageOptions: [
            { id: 'state', label: 'State Award (15 pts)' },
            { id: 'national', label: 'National Award (25 pts)' },
        ],
    },
    {
        id: '1.16', group: 'I',
        label: 'NSS — Approved National Camp / NIC / NYF / Pre.RDC',
    },
    {
        id: '1.17', group: 'I',
        label: 'NSS / NCC — 10-Day Volunteer Service (50 hrs, State / NCC Programme)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '1.18', group: 'I',
        label: 'NCC — Republic Day / Independence Day Camp or International Event',
    },
    {
        id: '1.19', group: 'I',
        label: 'NCC Certificate',
        hasStage: true,
        stageOptions: [
            { id: 'b_cert', label: 'NCC "B" Certificate (20 pts)' },
            { id: 'c_cert', label: 'NCC "C" Certificate (30 pts)' },
            { id: 'one_year', label: '1-Year NCC + Minimum Parade Attendance (10 pts)' },
        ],
    },
    {
        id: '1.20', group: 'I',
        label: 'Emergency Response / First Aid / CPR / Fire Safety Training',
    },
    {
        id: '1.21', group: 'I',
        label: 'Basic Swimming (Proficiency Certified)',
    },

    // ─── GROUP II ─────────────────────────────────────────────────────────────
    {
        id: '2.1', group: 'II',
        label: 'Tech Fest — Participation (KTU Organized / Approved)',
        hasLevel: true, hasAchievement: false,
    },
    {
        id: '2.2', group: 'II',
        label: 'Tech Fest — Winner (KTU Organized / Approved)',
        hasLevel: true, hasAchievement: true,
    },
    {
        id: '2.3', group: 'II',
        label: 'Professional Society Technical Event — Participation (IEEE / IET / ASME / SAE etc.)',
        hasLevel: true, hasAchievement: false,
    },
    {
        id: '2.4', group: 'II',
        label: 'Professional Society Technical Event — Winner (IEEE / IET / ASME / SAE etc.)',
        hasLevel: true, hasAchievement: true,
    },
    {
        id: '2.5', group: 'II',
        label: 'Conference / Seminar / Webinar / Workshop / STTP (IIT / NIT / NIRF Top 100)',
    },
    {
        id: '2.6', group: 'II',
        label: 'Poster Presentation — Participation (KTU / IIT / NIT events)',
    },
    {
        id: '2.7', group: 'II',
        label: 'Paper Presentation — Participation (IIT / NIT / KTU Approved events)',
    },
    {
        id: '2.8', group: 'II',
        label: 'Paper Presentation — Winner (IIT / NIT / KTU Approved events)',
        hasAchievement: true,
    },
    {
        id: '2.9', group: 'II',
        label: 'Paper Presentation — Participation (KTU Affiliated Institutions)',
    },
    {
        id: '2.10', group: 'II',
        label: 'Paper Presentation — Winner (KTU Affiliated Institutions)',
        hasAchievement: true,
    },
    {
        id: '2.11', group: 'II',
        label: 'Professional Society Membership / Leadership (IEEE / IET / ASME / ACM etc.)',
        hasStage: true,
        stageOptions: [
            { id: 'member', label: 'Member (5 pts/yr)' },
            { id: 'exec', label: 'Executive Committee Member (10 pts/yr)' },
            { id: 'chair', label: 'Secretary / Chapter Lead / Chair (15 pts/yr)' },
            { id: 'coordinator', label: 'Event Coordinator (5 pts/event)' },
        ],
    },
    {
        id: '2.12', group: 'II',
        label: 'College Union Activity',
        hasStage: true,
        stageOptions: [
            { id: 'office_bearer', label: 'College Union Office Bearer (20 pts)' },
            { id: 'exec', label: 'College Union Executive Committee (15 pts)' },
            { id: 'univ_bearer', label: 'University Union Office Bearer (30 pts)' },
            { id: 'univ_member', label: 'University Union Member (25 pts)' },
        ],
    },
    {
        id: '2.13', group: 'II',
        label: 'Department Student Association Activity',
        hasStage: true,
        stageOptions: [
            { id: 'exec', label: 'Executive / Office Bearer (5 pts/yr)' },
            { id: 'coordinator', label: 'Event Coordinator (5 pts/event)' },
        ],
    },
    {
        id: '2.14', group: 'II',
        label: 'Class Representative',
    },
    {
        id: '2.15', group: 'II',
        label: 'Industrial Visit Coordinator (min 6 days)',
    },
    {
        id: '2.16', group: 'II',
        label: 'Placement Cell (min 1 Academic Year)',
        hasStage: true,
        stageOptions: [
            { id: 'exec', label: 'Executive Committee Member (5 pts)' },
            { id: 'coordinator', label: 'Coordinator / Convenor (10 pts)' },
        ],
    },
    {
        id: '2.17', group: 'II',
        label: 'IEDC Cell (min 1 Academic Year)',
        hasStage: true,
        stageOptions: [
            { id: 'exec', label: 'Executive / Office Bearer (5 pts/yr)' },
            { id: 'coordinator', label: 'Event Coordinator (5 pts/event)' },
        ],
    },
    {
        id: '2.18', group: 'II',
        label: 'YIP — Student Coordinator (Young Innovators Programme)',
    },
    {
        id: '2.19', group: 'II',
        label: 'STRIDE — Participation / Membership / Leadership (K-DISC)',
        hasStage: true,
        stageOptions: [
            { id: 'volunteer', label: 'Certified Volunteer (5 pts)' },
            { id: 'member', label: 'STRIDE Member (5 pts)' },
            { id: 'leadership', label: 'Leadership Team Role (10 pts)' },
            { id: 'l1_project', label: 'High Impact Project — L1 (10 pts)' },
            { id: 'l2_project', label: 'High Impact Project — L2 (15 pts)' },
            { id: 'l5_project', label: 'High Impact Project — L5 (20 pts)' },
        ],
    },
    {
        id: '2.20', group: 'II',
        label: 'College Magazine Editorial Board',
    },
    {
        id: '2.21', group: 'II',
        label: 'Hobby Club Activity (Photography / Film / Music / Dance / Coding / Debate etc.)',
    },
    {
        id: '2.22', group: 'II',
        label: 'ICFOSS / FOSS Club Activity',
        hasStage: true,
        stageOptions: [
            { id: 'club_member', label: 'FOSS Club Member (participated in ≥2 activities) — 5 pts' },
            { id: 'lead', label: 'FOSS Club Lead / Coordinator / Ambassador — 10 pts' },
            { id: 'workshop', label: 'ICFOSS Workshop / Bootcamp (min 2 days) — 5 pts' },
            { id: 'hackathon', label: 'ICFOSS Hackathon / FOSS Event — 5 pts' },
            { id: 'opensource', label: 'Open-Source Contribution (validated by ICFOSS) — 10 pts' },
            { id: 'internship', label: 'FOSS Project / Internship at ICFOSS (min 15 days) — 10 pts' },
        ],
    },
    {
        id: '2.23', group: 'II',
        label: 'Short-Term Internship / Clinical Exposure Training (min 2 weeks)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '2.24', group: 'II',
        label: 'English Proficiency Test (TOEFL / IELTS / PTE / BEC)',
        hasScore: true,
        scoreLabel: 'Score / Band (e.g. IELTS 7.5, TOEFL 105)',
    },
    {
        id: '2.25', group: 'II',
        label: 'Aptitude / Graduate Proficiency Test (GRE / GATE / CAT / GMAT)',
        hasScore: true,
        scoreLabel: 'Score / Percentile / AIR (e.g. GATE AIR 3200, GRE 320)',
    },

    // ─── GROUP III ────────────────────────────────────────────────────────────
    {
        id: '3.1', group: 'III',
        label: 'Industrial Visit / Industrial Training Report (min 4 industries)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '3.2', group: 'III',
        label: 'Best Mini Project / Best Project / Best Seminar',
    },
    {
        id: '3.3', group: 'III',
        label: 'Long-Term Internship (min 3.5 months)',
        isDateRange: true, hasDuration: true,
    },
    {
        id: '3.4', group: 'III',
        label: 'LEAP — IIT Madras Incubation Cell Skill Development',
        hasStage: true,
        stageOptions: [
            { id: 'bootcamp', label: 'Bootcamp (LPB01 & LPB02) — 10 pts' },
            { id: 'course', label: 'LEAP Course (LP1XX/LP2XX/LP3XX) — 15 pts/course' },
            { id: 'project', label: 'LEAP Project / Prototype — 20 pts' },
        ],
    },
    {
        id: '3.5', group: 'III',
        label: 'YIP — Young Innovators Programme Achievement (K-DISC)',
        hasStage: true,
        stageOptions: [
            { id: 'idea', label: 'Idea Submitted & Accepted — 5 pts' },
            { id: 'district_shortlisted', label: 'Preliminary Winner (Shortlisted for District) — 10 pts' },
            { id: 'district_winner', label: 'District Level Winner / Finalist — 20 pts' },
            { id: 'state_winner', label: 'State Level Winner — 35 pts' },
        ],
    },
    {
        id: '3.6', group: 'III',
        label: 'STRIDE Achievement (K-DISC)',
        hasStage: true,
        stageOptions: [
            { id: 'phase1', label: 'Idea Accepted (Phase 1 Completed) — 5 pts' },
            { id: 'phase2', label: 'Top 100+ Teams (Phase 2) — 10 pts' },
            { id: 'phase3', label: 'Top 30+ Teams (State-Level Finalists) — 20 pts' },
            { id: 'winner', label: 'State Level Winner — 35 pts' },
        ],
    },
    {
        id: '3.7', group: 'III',
        label: 'GDC AI Workforce Internship Programme',
        hasStage: true,
        stageOptions: [
            { id: 'ai_test', label: 'AI Grading Test Completed — 5 pts' },
            { id: 'learning_track', label: 'Learning Track Completed — 15 pts' },
            { id: 'fellowship_coursework', label: 'Fellowship Track Coursework Completed — 25 pts' },
            { id: 'fellow', label: '6-Month Internship Completed (GDC Fellow) — 35 pts' },
        ],
    },
    {
        id: '3.8', group: 'III',
        label: 'ICFOSS FOSS Solution / Innovation (Certified by ICFOSS)',
    },
    {
        id: '3.9', group: 'III',
        label: 'Startup Company (Legally Registered — MSME / DPIIT / ROC / KSUM)',
    },
    {
        id: '3.10', group: 'III',
        label: 'Patent',
        hasStage: true,
        stageOptions: [
            { id: 'filed', label: 'Patent Filed (IPO/WIPO Application) — 20 pts' },
            { id: 'published', label: 'Patent Published (Patent Journal) — 30 pts' },
            { id: 'granted', label: 'Patent Granted / Approved — 40 pts' },
            { id: 'licensed', label: 'Patent Licensed to Industry — 40 pts' },
        ],
    },
    {
        id: '3.11', group: 'III',
        label: 'Prototype Development & Testing / Industry Adoption of Innovation',
        hasStage: true,
        stageOptions: [
            { id: 'prototype', label: 'Prototype Development & Testing (Validated by Innovation Cell) — 40 pts' },
            { id: 'industry_adopted', label: 'Innovative Technology Adopted by Industry — 40 pts' },
        ],
    },
    {
        id: '3.12', group: 'III',
        label: 'Venture Capital / Angel Funding Received',
    },
    {
        id: '3.13', group: 'III',
        label: 'Societal Innovation (IEDC / Local Bodies / Government Agency Certified)',
    },
    {
        id: '3.14', group: 'III',
        label: 'Research Publication in Reputed Journal (SCI / SCIE / Scopus)',
        hasStage: true,
        stageOptions: [
            { id: 'q1_q2', label: 'SCI/SCIE/Scopus Q1–Q2 Journal — 40 pts' },
            { id: 'q3_q4', label: 'SCI/SCIE/Scopus Q3–Q4 Journal — 25 pts' },
        ],
    },
    {
        id: '3.15', group: 'III',
        label: 'National Hackathon (SIH / KAVACH / MoE / AICTE etc.)',
        hasAchievement: true,
    },
    {
        id: '3.16', group: 'III',
        label: 'International Hackathon (NASA / Microsoft Imagine Cup / Google etc.)',
        hasAchievement: true,
    },
    {
        id: '3.17', group: 'III',
        label: 'University-Approved Skilling Course / Certificate (SWAYAM / NPTEL / Spoken Tutorial etc.)',
        hasDuration: true, isDateRange: true,
        scoreLabel: 'Total course hours (e.g. 40 hours)',
        hasScore: true,
    },
    {
        id: 'other', group: 'III',
        label: 'Other Custom Activity',
    },
]);

/** Maps group ID to human-readable label */
const ACTIVITY_GROUP_LABELS = Object.freeze({
    'I':   'Group I — NSS, NCC, Sports, Arts & Community Activities',
    'II':  'Group II — Technical Events, Academic & Professional Activities',
    'III': 'Group III — Internships, Projects, Innovation & Research',
});

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
    // Activity Points
    SEMESTERS,
    ACTIVITY_STATUSES,
    ACTIVITY_LEVELS,
    ACTIVITY_ACHIEVEMENT_TYPES,
    ACTIVITY_TYPES,
    ACTIVITY_GROUP_LABELS,
};
