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
