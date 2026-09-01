/**
 * formatters.js
 * Shared frontend utility functions for formatting data for display.
 */

/**
 * Formats a raw result title string into a compact, human-readable label.
 * e.g. "B.Tech S4 Regular Exam April 2026 (2024 Scheme)" → "B.Tech S4 (R) April 2026"
 * @param {string} rawTitle
 * @returns {string}
 */
export function formatResultTitle(rawTitle) {
    if (!rawTitle) return '';

    let type = '';
    const typeMatch = rawTitle.match(/\((R|S|R,\s*S|R,S)\)/i);
    if (typeMatch) type = '(' + typeMatch[1].replace(/\s/g, '').toUpperCase() + ')';
    else if (rawTitle.match(/Supplementary/i)) type = '(S)';
    else if (rawTitle.match(/Regular/i)) type = '(R)';

    let date = '';
    const dateMatch = rawTitle.match(/(?:Exam|Examination|Exam\.)\s+([a-zA-Z]+\s+\d{4})/i);
    if (dateMatch) date = dateMatch[1].charAt(0).toUpperCase() + dateMatch[1].slice(1).toLowerCase();

    let semester = '';
    const semMatch = rawTitle.match(/\b(S[1-8])\b/i);
    if (semMatch) semester = semMatch[1].toUpperCase();

    if (semester || type || date) {
        return `B.Tech ${semester} ${type} ${date}`.replace(/\s+/g, ' ').trim();
    }
    return rawTitle;
}
