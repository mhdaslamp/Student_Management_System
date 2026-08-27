/**
 * @file emailParser.js
 * @description Pure function to parse gecskp.ac.in student email addresses.
 *
 * Supported formats:
 *   Regular student:       pkd23cs038@gecskp.ac.in
 *   Lateral entry student: lpkd24cs010@gecskp.ac.in
 */

'use strict';

const DOMAIN = 'gecskp.ac.in';

const VALID_DEPT_CODES = new Set(['CS', 'EC', 'EE', 'ME', 'CE', 'IT']);

const DEPT_NAMES = Object.freeze({
    CS: 'Computer Science & Engineering',
    EC: 'Electronics & Communication Engineering',
    EE: 'Electrical & Electronics Engineering',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering',
    IT: 'Information Technology',
});

// Lateral must be tested BEFORE regular (longer prefix)
// Strict B.Tech 2-letter branch codes: CS, EC, EE, IT, ME, CE
const LATERAL_REGEX = /^lpkd(\d{2})(cs|ec|ee|it|me|ce)(\d{2,3})@gecskp\.ac\.in$/i;
const REGULAR_REGEX = /^pkd(\d{2})(cs|ec|ee|it|me|ce)(\d{2,3})@gecskp\.ac\.in$/i;

function toFullYear(twoDigit) {
    const n = parseInt(twoDigit, 10);
    return String(n < 30 ? 2000 + n : 1900 + n);
}

/**
 * Parses a gecskp.ac.in student email address.
 * Returns null if the email does not match a student pattern.
 */
function parseStudentEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const normalized = email.toLowerCase().trim();
    if (!normalized.endsWith('@' + DOMAIN)) return null;

    let match, type, prefix;

    match = normalized.match(LATERAL_REGEX);
    if (match) {
        type = 'lateral';
        prefix = 'LPKD';
    } else {
        match = normalized.match(REGULAR_REGEX);
        if (match) {
            type = 'regular';
            prefix = 'PKD';
        }
    }

    if (!match) return null;

    const [, yearStr, deptStr, rollStr] = match;
    const dept = deptStr.toUpperCase();
    if (!VALID_DEPT_CODES.has(dept)) return null;

    const admissionYear = toFullYear(yearStr);
    const registerId    = prefix + yearStr.toUpperCase() + dept + rollStr;

    return {
        type,
        admissionYear,
        dept,
        deptName: DEPT_NAMES[dept],
        rollNo:   rollStr,
        registerId,
        email:    normalized,
    };
}

function isStudentEmail(email) {
    return parseStudentEmail(email) !== null;
}

function isStaffEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const normalized = email.toLowerCase().trim();
    return normalized.endsWith('@' + DOMAIN) && !isStudentEmail(email);
}

/**
 * Generates unified batch name. e.g. "CS 2023", "EC 2024", "ME 2025"
 * Lateral entry students share the exact same unified batch as regular students.
 */
function toBatchName(parsed) {
    return `${parsed.dept} ${parsed.admissionYear}`;
}

module.exports = {
    parseStudentEmail,
    isStudentEmail,
    isStaffEmail,
    toBatchName,
    VALID_DEPT_CODES,
    DEPT_NAMES,
    DOMAIN,
};
