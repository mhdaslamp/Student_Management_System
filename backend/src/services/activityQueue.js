/**
 * @file activityQueue.js
 * @description Step 4 — Background async processor for the activity pipeline.
 *
 * After a student submits, the HTTP response is sent immediately.
 * This module then runs the AI pipeline in the background:
 *   Step 2: Extract text/data from the evidence file (Gemini AI)
 *   Step 3: Cross-verify extracted data vs submitted data
 *   Update: Save results + set final status on the Activity document
 *
 * Uses a simple fire-and-forget approach (no Redis required).
 * Can be upgraded to bull/BullMQ later for production scale.
 */

'use strict';

const Activity = require('../../models/Activity');
const { extractEvidenceData } = require('./evidenceExtractor');
const { verifyActivity }      = require('./activityVerifier');
const { ACTIVITY_STATUSES }   = require('../config/constants');

/**
 * Runs the full AI pipeline for a submitted activity.
 * Should be called fire-and-forget after the HTTP response is sent.
 *
 * @param {string} activityId - MongoDB ObjectId of the activity
 */
async function processActivityAsync(activityId) {
    let activity;

    try {
        activity = await Activity.findById(activityId);
        if (!activity) {
            console.warn(`[Queue] Activity ${activityId} not found — skipping.`);
            return;
        }

        // Mark as processing so UI can show a spinner
        activity.status = ACTIVITY_STATUSES.PROCESSING;
        await activity.save();

        console.log(`[Queue] Processing activity ${activityId} (${activity.ktuRuleId})`);

        // ── Step 2: AI Evidence Extraction ──────────────────────────────────
        let extractionResult = null;
        try {
            if (!activity.evidence?.filePath) throw new Error('No evidence file path.');
            extractionResult = await extractEvidenceData(
                activity.evidence.filePath,
                activity.evidence.mimetype || 'application/pdf',
            );
            activity.extractedData = extractionResult;
            console.log(`[Queue] Extraction done for ${activityId}. Success: ${extractionResult.success}`);
        } catch (extractErr) {
            console.error(`[Queue] Extraction failed for ${activityId}:`, extractErr.message);
            activity.extractedData = { success: false, error: extractErr.message, extracted: null };
        }

        // ── Step 3: Cross-Verification ───────────────────────────────────────
        let verificationResult = null;
        try {
            verificationResult = verifyActivity(activity, extractionResult);
            activity.ktuRule = {
                ...(activity.ktuRule || {}),
                verification: verificationResult,
            };
            console.log(`[Queue] Verification done for ${activityId}. Confidence: ${verificationResult.confidence}%`);
        } catch (verifyErr) {
            console.error(`[Queue] Verification failed for ${activityId}:`, verifyErr.message);
        }

        // ── Update status based on verification outcome ──────────────────────
        if (verificationResult?.recommendation) {
            activity.status = ACTIVITY_STATUSES[verificationResult.recommendation]
                ?? ACTIVITY_STATUSES.REVIEW_REQUIRED;
        } else {
            activity.status = ACTIVITY_STATUSES.REVIEW_REQUIRED;
        }

        await activity.save();
        console.log(`[Queue] Activity ${activityId} processed. Final status: ${activity.status}`);

    } catch (err) {
        console.error(`[Queue] Fatal error processing activity ${activityId}:`, err);

        // Fallback — put back to submitted so it doesn't get stuck in PROCESSING
        try {
            if (activity) {
                activity.status = ACTIVITY_STATUSES.REVIEW_REQUIRED;
                await activity.save();
            }
        } catch (saveErr) {
            console.error(`[Queue] Could not reset status for ${activityId}:`, saveErr.message);
        }
    }
}

module.exports = { processActivityAsync };
