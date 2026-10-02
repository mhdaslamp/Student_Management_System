/**
 * @file activityVerifier.js
 * @description Step 3 of the activity pipeline.
 * Cross-checks AI-extracted evidence data against student-submitted form data.
 * Produces a verification report with confidence score and flags for human review.
 */

'use strict';

// ─── Config ───────────────────────────────────────────────────────────────────

/** Fields to compare and their severity if mismatched */
const FIELD_CHECKS = [
    { field: 'organizer',   extractedKey: 'organizer',   severity: 'medium', fuzzy: true  },
    { field: 'eventLevel',  extractedKey: 'eventLevel',  severity: 'high',   fuzzy: false },
    { field: 'eventName',   extractedKey: 'eventName',   severity: 'low',    fuzzy: true  },
];

/** Date fields to verify */
const DATE_FIELD_CHECKS = [
    { formKey: 'activityDate', extractedKey: 'eventDate' },
    { formKey: 'startDate',    extractedKey: 'startDate' },
    { formKey: 'endDate',      extractedKey: 'endDate'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize a string for fuzzy comparison — lowercase, strip punctuation */
function normalize(str) {
    if (!str) return '';
    return String(str).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

/** Returns true if two strings are "close enough" (substring match) */
function fuzzyMatch(a, b) {
    const na = normalize(a);
    const nb = normalize(b);
    if (!na || !nb) return true; // skip if either is empty/null
    return na.includes(nb) || nb.includes(na) || na === nb;
}

/** Normalize a date value to YYYY-MM-DD string */
function normalizeDate(val) {
    if (!val) return null;
    try {
        return new Date(val).toISOString().split('T')[0];
    } catch {
        return null;
    }
}

/** Check if two date strings are within N days of each other */
function datesCloseEnough(a, b, toleranceDays = 2) {
    const da = new Date(a);
    const db = new Date(b);
    if (isNaN(da.getTime()) || isNaN(db.getTime())) return false;
    return Math.abs(da - db) <= toleranceDays * 86400000;
}

// ─── Main Verifier ────────────────────────────────────────────────────────────

/**
 * Cross-checks extracted evidence data against student-submitted form data.
 *
 * @param {Object} activity   - The activity mongoose document
 * @param {Object} extracted  - Output from evidenceExtractor.extractEvidenceData()
 * @returns {Object} Verification report
 */
function verifyActivity(activity, extracted) {
    const flags  = [];
    let   score  = 100; // start at 100, deduct for mismatches

    if (!extracted || !extracted.success || !extracted.extracted) {
        return {
            passed:     false,
            confidence: 0,
            flags: [{
                field:     'evidence',
                submitted: null,
                extracted: null,
                severity:  'critical',
                message:   'Could not extract text from evidence. Manual review required.',
            }],
            aiSummary:    extracted?.extracted?.rawSummary || null,
            recommendation: 'REVIEW_REQUIRED',
        };
    }

    const ext = extracted.extracted;

    // ── 1. Check standard string fields ─────────────────────────────────────
    for (const check of FIELD_CHECKS) {
        const submitted  = activity[check.field];
        const extractedV = ext[check.extractedKey];

        if (!extractedV) continue; // AI couldn't find it — skip

        const match = check.fuzzy
            ? fuzzyMatch(submitted, extractedV)
            : normalize(submitted) === normalize(extractedV);

        if (!match) {
            const deduction = check.severity === 'high' ? 25 : check.severity === 'medium' ? 15 : 5;
            score -= deduction;
            flags.push({
                field:     check.field,
                submitted,
                extracted: extractedV,
                severity:  check.severity,
                message:   `Mismatch in "${check.field}": submitted "${submitted}", evidence says "${extractedV}"`,
            });
        }
    }

    // ── 2. Check dates ───────────────────────────────────────────────────────
    for (const dc of DATE_FIELD_CHECKS) {
        const submitted  = normalizeDate(activity[dc.formKey]);
        const extractedV = normalizeDate(ext[dc.extractedKey]);

        if (!submitted || !extractedV) continue;

        if (!datesCloseEnough(submitted, extractedV)) {
            score -= 20;
            flags.push({
                field:     dc.formKey,
                submitted,
                extracted: extractedV,
                severity:  'medium',
                message:   `Date mismatch in "${dc.formKey}": submitted "${submitted}", evidence says "${extractedV}"`,
            });
        }
    }

    // ── 3. Check event level if extracted ───────────────────────────────────
    if (ext.eventLevel && activity.eventLevel) {
        if (ext.eventLevel !== activity.eventLevel) {
            score -= 30;
            flags.push({
                field:     'eventLevel',
                submitted:  activity.eventLevel,
                extracted:  ext.eventLevel,
                severity:   'high',
                message:    `Event level mismatch: student claimed "${activity.eventLevel}", evidence suggests "${ext.eventLevel}"`,
            });
        }
    }

    const confidence = Math.max(0, Math.min(100, score));
    const highFlags  = flags.filter(f => f.severity === 'high' || f.severity === 'critical');

    let recommendation;
    if (confidence >= 80 && highFlags.length === 0) {
        recommendation = 'PENDING_VERIFICATION'; // clean — fast-track to teacher
    } else {
        recommendation = 'REVIEW_REQUIRED'; // needs closer look
    }

    return {
        passed:         flags.length === 0,
        confidence,
        flags,
        aiSummary:      ext.rawSummary || null,
        recommendation,
    };
}

module.exports = { verifyActivity };
