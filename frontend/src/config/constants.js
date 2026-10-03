/**
 * @file constants.js
 * @description Frontend shared constants.
 * Import from here instead of writing magic strings inline in components.
 */

// ─── User Roles ────────────────────────────────────────────────────────────────
// Must mirror the backend ROLES object (backend/src/config/constants.js)

export const ROLES = Object.freeze({
    ADMIN:     'admin',
    TEACHER:   'teacher',
    STUDENT:   'student',
    HOD:       'hod',
    PRINCIPAL: 'principal',
});

/** Roles that share the Teacher dashboard */
export const TEACHER_DASHBOARD_ROLES = Object.freeze([
    ROLES.TEACHER,
    ROLES.HOD,
    ROLES.PRINCIPAL,
]);

// ─── Route Paths ───────────────────────────────────────────────────────────────

/** Maps a user role to its root dashboard path */
export const ROLE_DASHBOARD_PATHS = Object.freeze({
    [ROLES.ADMIN]:     '/admin',
    [ROLES.TEACHER]:   '/teacher',
    [ROLES.STUDENT]:   '/student',
    [ROLES.HOD]:       '/teacher',
    [ROLES.PRINCIPAL]: '/teacher',
});

// ─── Request Types ─────────────────────────────────────────────────────────────

/** Human-readable labels for request types (must match backend REQUEST_TYPE_LABELS) */
export const REQUEST_TYPE_LABELS = Object.freeze({
    bonafide:       'Bonafide Certificate',
    duty_leave:     'Duty Leave',
    lab_permission: 'Lab / Classroom Permission',
    custom:         'Custom Request',
});

// ─── Academic ─────────────────────────────────────────────────────────────────

export const SUPPORTED_SCHEMES = Object.freeze(['2024', '2019']);

/** Departments — used in EC dashboard and analysis pickers */
export const DEPARTMENTS = Object.freeze([
    'IT', 'CS', 'EC', 'EE', 'CE', 'ME',
]);

// ─── UI ────────────────────────────────────────────────────────────────────────

/** Toast display durations in milliseconds */
export const TOAST_DURATION = Object.freeze({
    SUCCESS: 3000,
    ERROR:   5000,
    INFO:    3000,
});

/** App name displayed in sidebars / page titles */
export const APP_NAME = 'EduCore';

// ─── Activity Points (KTU 2024 Scheme) ────────────────────────────────────────

export const SEMESTERS = Object.freeze(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']);

export const ACTIVITY_STATUSES = Object.freeze({
    DRAFT:                'DRAFT',
    SUBMITTED:            'SUBMITTED',
    PROCESSING:           'PROCESSING',
    REVIEW_REQUIRED:      'REVIEW_REQUIRED',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    VERIFIED:             'VERIFIED',
    REJECTED:             'REJECTED',
});

export const ACTIVITY_STATUS_LABELS = Object.freeze({
    DRAFT:                { label: 'Draft',               color: 'bg-gray-100 text-gray-600' },
    SUBMITTED:            { label: 'Submitted',           color: 'bg-blue-100 text-blue-700' },
    PROCESSING:           { label: 'Processing',          color: 'bg-yellow-100 text-yellow-700' },
    REVIEW_REQUIRED:      { label: 'Review Required',     color: 'bg-orange-100 text-orange-700' },
    PENDING_VERIFICATION: { label: 'Pending Verification',color: 'bg-purple-100 text-purple-700' },
    VERIFIED:             { label: 'Verified',            color: 'bg-green-100 text-green-700' },
    REJECTED:             { label: 'Rejected',            color: 'bg-red-100 text-red-700' },
});

export const ACTIVITY_LEVELS = Object.freeze([
    { id: 'college',       label: 'College Event' },
    { id: 'zonal',         label: 'Zonal Event' },
    { id: 'state',         label: 'State Event' },
    { id: 'national',      label: 'National Event' },
    { id: 'international', label: 'International Event' },
]);

export const ACTIVITY_ACHIEVEMENT_TYPES = Object.freeze([
    { id: 'participation', label: 'Participation' },
    { id: 'first',         label: '1st Prize / Winner' },
    { id: 'second',        label: '2nd Prize' },
    { id: 'third',         label: '3rd Prize' },
    { id: 'completed',     label: 'Completed / Certified' },
    { id: 'qualified',     label: 'Qualified / Valid Score' },
]);

export const ACTIVITY_GROUP_LABELS = Object.freeze({
    'I':   'Group I — NSS, NCC, Sports, Arts & Community',
    'II':  'Group II — Technical Events, Academic & Professional',
    'III': 'Group III — Internships, Projects, Innovation & Research',
});

// All 42 KTU activity types (rules 1.1 – 3.17)
// Metadata flags drive adaptive form field visibility.
export const ACTIVITY_TYPES = Object.freeze([
    { id: '1.1',  group: 'I',   category: 'Sports, Games & Arts', subLabel: 'Participation', label: 'Sports / Games / Arts — Participation', hasLevel: true },
    { id: '1.2',  group: 'I',   category: 'Sports, Games & Arts', subLabel: 'Winner (Single Event)', label: 'Sports / Games / Arts — Winner (Single Event)', hasLevel: true, hasAchievement: true },
    { id: '1.3',  group: 'I',   category: 'Sports, Games & Arts', subLabel: 'Winner (Group Event)', label: 'Sports / Games / Arts — Winner (Group Event)', hasLevel: true, hasAchievement: true },
    { id: '1.4',  group: 'I',   category: 'Publications & Media', subLabel: 'College Magazine Publication', label: 'College Magazine Publication' },
    { id: '1.5',  group: 'I',   category: 'Skills & Certifications', subLabel: 'Four-Wheeler Driving Licence', label: 'Four-Wheeler Driving Licence' },
    { id: '1.6',  group: 'I',   category: 'Community Service', subLabel: 'Allied Activities (2 Days)', label: 'Community Service / Allied Activities (2 Days)' },
    { id: '1.7',  group: 'I',   category: 'Community Service', subLabel: 'Allied Activities (Up to 1 Week)', label: 'Community Service / Allied Activities (Up to 1 Week)', isDateRange: true, hasDuration: true },
    { id: '1.8',  group: 'I',   category: 'Community Service', subLabel: 'Blood Donation', label: 'Blood Donation' },
    { id: '1.9',  group: 'I',   category: 'Community Service', subLabel: 'THRIVE Project (min 5 days)', label: 'THRIVE Project (min 5 days/semester)', isDateRange: true, hasDuration: true },
    { id: '1.10', group: 'I',   category: 'Community Service', subLabel: 'Tree Planting', label: 'Tree Planting' },
    { id: '1.11', group: 'I',   category: 'NSS & NCC', subLabel: 'NSS — 2-Year Volunteership', label: 'NSS — 2-Year Volunteership', isDateRange: true, hasDuration: true },
    { id: '1.12', group: 'I',   category: 'NSS & NCC', subLabel: 'NSS — University Leadership Camp (100 hrs)', label: 'NSS — University Leadership Camp (100 hrs)', isDateRange: true, hasDuration: true },
    { id: '1.13', group: 'I',   category: 'NSS & NCC', subLabel: 'NSS — State Level Festival Winner', label: 'NSS — State Level NSS Festival Winner', hasAchievement: true },
    { id: '1.14', group: 'I',   category: 'NSS & NCC', subLabel: 'Special Service Certificate', label: 'NSS / NCC — Special Service Certificate (State/NCC Directorate)' },
    { id: '1.15', group: 'I',   category: 'NSS & NCC', subLabel: 'State or National Award Recipient', label: 'NSS / NCC — State or National Award Recipient', hasStage: true, stageOptions: [{ id: 'state', label: 'State Award (15 pts)' }, { id: 'national', label: 'National Award (25 pts)' }] },
    { id: '1.16', group: 'I',   category: 'NSS & NCC', subLabel: 'NSS — Approved National Camp / NIC / NYF / Pre.RDC', label: 'NSS — Approved National Camp / NIC / NYF / Pre.RDC' },
    { id: '1.17', group: 'I',   category: 'NSS & NCC', subLabel: '10-Day Volunteer Service (50 hrs)', label: 'NSS / NCC — 10-Day Volunteer Service (50 hrs)', isDateRange: true, hasDuration: true },
    { id: '1.18', group: 'I',   category: 'NSS & NCC', subLabel: 'NCC — RD / ID Camp or International Event', label: 'NCC — Republic Day / Independence Day Camp or International Event' },
    { id: '1.19', group: 'I',   category: 'NSS & NCC', subLabel: 'NCC Certificate', label: 'NCC Certificate', hasStage: true, stageOptions: [{ id: 'b_cert', label: 'NCC "B" Certificate (20 pts)' }, { id: 'c_cert', label: 'NCC "C" Certificate (30 pts)' }, { id: 'one_year', label: '1-Year NCC + Minimum Parade Attendance (10 pts)' }] },
    { id: '1.20', group: 'I',   category: 'Skills & Certifications', subLabel: 'First Aid / CPR / Fire Safety Training', label: 'Emergency Response / First Aid / CPR / Fire Safety Training' },
    { id: '1.21', group: 'I',   category: 'Skills & Certifications', subLabel: 'Basic Swimming (Proficiency)', label: 'Basic Swimming (Proficiency Certified)' },
    { id: '2.1',  group: 'II',  category: 'Events & Fests', subLabel: 'Tech Fest — Participation', label: 'Tech Fest — Participation (KTU Organized / Approved)', hasLevel: true },
    { id: '2.2',  group: 'II',  category: 'Events & Fests', subLabel: 'Tech Fest — Winner', label: 'Tech Fest — Winner (KTU Organized / Approved)', hasLevel: true, hasAchievement: true },
    { id: '2.3',  group: 'II',  category: 'Events & Fests', subLabel: 'Prof. Society Tech Event — Participation', label: 'Professional Society Technical Event — Participation (IEEE / IET / ASME etc.)', hasLevel: true },
    { id: '2.4',  group: 'II',  category: 'Events & Fests', subLabel: 'Prof. Society Tech Event — Winner', label: 'Professional Society Technical Event — Winner (IEEE / IET / ASME etc.)', hasLevel: true, hasAchievement: true },
    { id: '2.5',  group: 'II',  category: 'Events & Fests', subLabel: 'Conference / Seminar / Workshop', label: 'Conference / Seminar / Webinar / Workshop / STTP (IIT / NIT / NIRF Top 100)' },
    { id: '2.6',  group: 'II',  category: 'Presentations', subLabel: 'Poster Presentation — Participation', label: 'Poster Presentation — Participation (KTU / IIT / NIT events)' },
    { id: '2.7',  group: 'II',  category: 'Presentations', subLabel: 'Paper Presentation — Participation', label: 'Paper Presentation — Participation (IIT / NIT / KTU Approved events)' },
    { id: '2.8',  group: 'II',  category: 'Presentations', subLabel: 'Paper Presentation — Winner', label: 'Paper Presentation — Winner (IIT / NIT / KTU Approved events)', hasAchievement: true },
    { id: '2.9',  group: 'II',  category: 'Presentations', subLabel: 'Paper Presentation — Participation (Affiliated)', label: 'Paper Presentation — Participation (KTU Affiliated Institutions)' },
    { id: '2.10', group: 'II',  category: 'Presentations', subLabel: 'Paper Presentation — Winner (Affiliated)', label: 'Paper Presentation — Winner (KTU Affiliated Institutions)', hasAchievement: true },
    { id: '2.11', group: 'II',  category: 'Leadership & Management', subLabel: 'Prof. Society Membership / Leadership', label: 'Professional Society Membership / Leadership (IEEE / IET / ASME / ACM etc.)', hasStage: true, stageOptions: [{ id: 'member', label: 'Member (5 pts/yr)' }, { id: 'exec', label: 'Executive Committee Member (10 pts/yr)' }, { id: 'chair', label: 'Secretary / Chapter Lead / Chair (15 pts/yr)' }, { id: 'coordinator', label: 'Event Coordinator (5 pts/event)' }] },
    { id: '2.12', group: 'II',  category: 'Leadership & Management', subLabel: 'College Union Activity', label: 'College Union Activity', hasStage: true, stageOptions: [{ id: 'office_bearer', label: 'College Union Office Bearer (20 pts)' }, { id: 'exec', label: 'College Union Executive Committee (15 pts)' }, { id: 'univ_bearer', label: 'University Union Office Bearer (30 pts)' }, { id: 'univ_member', label: 'University Union Member (25 pts)' }] },
    { id: '2.13', group: 'II',  category: 'Leadership & Management', subLabel: 'Dept. Student Association Activity', label: 'Department Student Association Activity', hasStage: true, stageOptions: [{ id: 'exec', label: 'Executive / Office Bearer (5 pts/yr)' }, { id: 'coordinator', label: 'Event Coordinator (5 pts/event)' }] },
    { id: '2.14', group: 'II',  category: 'Leadership & Management', subLabel: 'Class Representative', label: 'Class Representative' },
    { id: '2.15', group: 'II',  category: 'Leadership & Management', subLabel: 'Industrial Visit Coordinator', label: 'Industrial Visit Coordinator (min 6 days)' },
    { id: '2.16', group: 'II',  category: 'Leadership & Management', subLabel: 'Placement Cell Volunteer / Lead', label: 'Placement Cell (min 1 Academic Year)', hasStage: true, stageOptions: [{ id: 'exec', label: 'Executive Committee Member (5 pts)' }, { id: 'coordinator', label: 'Coordinator / Convenor (10 pts)' }] },
    { id: '2.17', group: 'II',  category: 'Innovation & Clubs', subLabel: 'IEDC Cell Volunteer / Lead', label: 'IEDC Cell (min 1 Academic Year)', hasStage: true, stageOptions: [{ id: 'exec', label: 'Executive / Office Bearer (5 pts/yr)' }, { id: 'coordinator', label: 'Event Coordinator (5 pts/event)' }] },
    { id: '2.18', group: 'II',  category: 'Innovation & Clubs', subLabel: 'YIP Student Coordinator', label: 'YIP — Student Coordinator (Young Innovators Programme)' },
    { id: '2.19', group: 'II',  category: 'Innovation & Clubs', subLabel: 'STRIDE Membership / Leadership', label: 'STRIDE — Participation / Membership / Leadership (K-DISC)', hasStage: true, stageOptions: [{ id: 'volunteer', label: 'Certified Volunteer (5 pts)' }, { id: 'member', label: 'STRIDE Member (5 pts)' }, { id: 'leadership', label: 'Leadership Team Role (10 pts)' }, { id: 'l1_project', label: 'High Impact Project — L1 (10 pts)' }, { id: 'l2_project', label: 'High Impact Project — L2 (15 pts)' }, { id: 'l5_project', label: 'High Impact Project — L5 (20 pts)' }] },
    { id: '2.20', group: 'II',  category: 'Publications & Media', subLabel: 'College Magazine Editorial Board', label: 'College Magazine Editorial Board' },
    { id: '2.21', group: 'II',  category: 'Innovation & Clubs', subLabel: 'Hobby Club Activity (Photo/Film/Tech etc)', label: 'Hobby Club Activity (Photography / Film / Music / Dance / Coding / Debate etc.)' },
    { id: '2.22', group: 'II',  category: 'Innovation & Clubs', subLabel: 'ICFOSS / FOSS Club Activity', label: 'ICFOSS / FOSS Club Activity', hasStage: true, stageOptions: [{ id: 'club_member', label: 'FOSS Club Member (≥2 activities) — 5 pts' }, { id: 'lead', label: 'FOSS Club Lead / Coordinator — 10 pts' }, { id: 'workshop', label: 'ICFOSS Workshop / Bootcamp (min 2 days) — 5 pts' }, { id: 'hackathon', label: 'ICFOSS Hackathon / FOSS Event — 5 pts' }, { id: 'opensource', label: 'Open-Source Contribution (validated by ICFOSS) — 10 pts' }, { id: 'internship', label: 'FOSS Project / Internship at ICFOSS (min 15 days) — 10 pts' }] },
    { id: '2.23', group: 'II',  category: 'Internships', subLabel: 'Short-Term Internship (min 2 weeks)', label: 'Short-Term Internship / Clinical Exposure (min 2 weeks)', isDateRange: true, hasDuration: true },
    { id: '2.24', group: 'II',  category: 'Skills & Certifications', subLabel: 'English Proficiency Test (IELTS/TOEFL)', label: 'English Proficiency Test (TOEFL / IELTS / PTE / BEC)', hasScore: true, scoreLabel: 'Score / Band (e.g. IELTS 7.5, TOEFL 105)' },
    { id: '2.25', group: 'II',  category: 'Skills & Certifications', subLabel: 'Aptitude Test (GATE/GRE/CAT)', label: 'Aptitude / Graduate Proficiency Test (GRE / GATE / CAT / GMAT)', hasScore: true, scoreLabel: 'Score / Percentile / AIR (e.g. GATE AIR 3200, GRE 320)' },
    { id: '3.1',  group: 'III', category: 'Internships', subLabel: 'Industrial Visit / Training Report', label: 'Industrial Visit / Training Report (min 4 industries)', isDateRange: true, hasDuration: true },
    { id: '3.2',  group: 'III', category: 'Projects & Research', subLabel: 'Best Mini Project / Project / Seminar', label: 'Best Mini Project / Best Project / Best Seminar' },
    { id: '3.3',  group: 'III', category: 'Internships', subLabel: 'Long-Term Internship (min 3.5 months)', label: 'Long-Term Internship (min 3.5 months)', isDateRange: true, hasDuration: true },
    { id: '3.4',  group: 'III', category: 'Innovation & Startups', subLabel: 'LEAP Incubation Cell', label: 'LEAP — IIT Madras Incubation Cell Skill Development', hasStage: true, stageOptions: [{ id: 'bootcamp', label: 'Bootcamp (LPB01 & LPB02) — 10 pts' }, { id: 'course', label: 'LEAP Course — 15 pts/course' }, { id: 'project', label: 'LEAP Project / Prototype — 20 pts' }] },
    { id: '3.5',  group: 'III', category: 'Innovation & Startups', subLabel: 'YIP Achievement', label: 'YIP — Young Innovators Programme Achievement (K-DISC)', hasStage: true, stageOptions: [{ id: 'idea', label: 'Idea Submitted & Accepted — 5 pts' }, { id: 'district_shortlisted', label: 'Shortlisted for District Round — 10 pts' }, { id: 'district_winner', label: 'District Level Winner / Finalist — 20 pts' }, { id: 'state_winner', label: 'State Level Winner — 35 pts' }] },
    { id: '3.6',  group: 'III', category: 'Innovation & Startups', subLabel: 'STRIDE Achievement', label: 'STRIDE Achievement (K-DISC)', hasStage: true, stageOptions: [{ id: 'phase1', label: 'Idea Accepted (Phase 1) — 5 pts' }, { id: 'phase2', label: 'Top 100+ Teams (Phase 2) — 10 pts' }, { id: 'phase3', label: 'Top 30+ Teams (State Finalists) — 20 pts' }, { id: 'winner', label: 'State Level Winner — 35 pts' }] },
    { id: '3.7',  group: 'III', category: 'Innovation & Startups', subLabel: 'GDC AI Workforce', label: 'GDC AI Workforce Internship Programme', hasStage: true, stageOptions: [{ id: 'ai_test', label: 'AI Grading Test Completed — 5 pts' }, { id: 'learning_track', label: 'Learning Track Completed — 15 pts' }, { id: 'fellowship_coursework', label: 'Fellowship Track Coursework — 25 pts' }, { id: 'fellow', label: '6-Month Internship (GDC Fellow) — 35 pts' }] },
    { id: '3.8',  group: 'III', category: 'Innovation & Startups', subLabel: 'ICFOSS FOSS Solution / Innovation', label: 'ICFOSS FOSS Solution / Innovation (Certified by ICFOSS)' },
    { id: '3.9',  group: 'III', category: 'Innovation & Startups', subLabel: 'Startup Company', label: 'Startup Company (Legally Registered — MSME / DPIIT / ROC / KSUM)' },
    { id: '3.10', group: 'III', category: 'Innovation & Startups', subLabel: 'Patent', label: 'Patent', hasStage: true, stageOptions: [{ id: 'filed', label: 'Patent Filed (IPO/WIPO) — 20 pts' }, { id: 'published', label: 'Patent Published — 30 pts' }, { id: 'granted', label: 'Patent Granted — 40 pts' }, { id: 'licensed', label: 'Patent Licensed — 40 pts' }] },
    { id: '3.11', group: 'III', category: 'Innovation & Startups', subLabel: 'Prototype Development & Testing', label: 'Prototype Development & Testing / Industry Adoption', hasStage: true, stageOptions: [{ id: 'prototype', label: 'Prototype Development & Testing — 40 pts' }, { id: 'industry_adopted', label: 'Innovative Technology Adopted by Industry — 40 pts' }] },
    { id: '3.12', group: 'III', category: 'Innovation & Startups', subLabel: 'Venture Capital / Angel Funding Received', label: 'Venture Capital / Angel Funding Received' },
    { id: '3.13', group: 'III', category: 'Innovation & Startups', subLabel: 'Societal Innovation', label: 'Societal Innovation (IEDC / Local Bodies / Govt Agency Certified)' },
    { id: '3.14', group: 'III', category: 'Projects & Research', subLabel: 'Research Publication (SCI/Scopus)', label: 'Research Publication in Reputed Journal (SCI / SCIE / Scopus)', hasStage: true, stageOptions: [{ id: 'q1_q2', label: 'Q1–Q2 Journal — 40 pts' }, { id: 'q3_q4', label: 'Q3–Q4 Journal — 25 pts' }] },
    { id: '3.15', group: 'III', category: 'Events & Fests', subLabel: 'National Hackathon', label: 'National Hackathon (SIH / KAVACH / MoE / AICTE etc.)', hasAchievement: true },
    { id: '3.16', group: 'III', category: 'Events & Fests', subLabel: 'International Hackathon', label: 'International Hackathon (NASA / Microsoft Imagine Cup / Google etc.)', hasAchievement: true },
    { id: '3.17', group: 'III', category: 'Skills & Certifications', subLabel: 'Approved Skilling Course (NPTEL)', label: 'University-Approved Skilling Course / Certificate (SWAYAM / NPTEL etc.)', isDateRange: true, hasDuration: true, hasScore: true, scoreLabel: 'Total course hours (e.g. 40 hours)' },
    { id: 'other', group: 'III', category: 'Other', subLabel: 'Custom / Other Activity', label: 'Other Custom Activity' },
]);
