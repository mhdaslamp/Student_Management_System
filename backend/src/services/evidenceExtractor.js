/**
 * @file evidenceExtractor.js
 * @description AI-powered evidence extraction service.
 * Uses Google Gemini to extract structured data from student-uploaded
 * certificates (PDF or image). Works as Step 2 of the activity pipeline.
 *
 * Pipeline:
 *   1. Read file from disk
 *   2. For PDFs: extract raw text via pdf-parse, then send text to Gemini
 *   3. For images (JPG/PNG): send the image bytes directly to Gemini Vision
 *   4. Parse the structured JSON response
 *   5. Return extracted fields for cross-verification in Step 3
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let pdfParse;
try {
    pdfParse = require('pdf-parse');
} catch {
    pdfParse = null;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── Prompt ───────────────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `
You are an AI assistant helping verify student activity certificates for a university.
Carefully analyze this certificate or document and extract the following fields as a single JSON object.
Return ONLY valid JSON, no markdown, no explanation.

Required fields:
{
  "studentName":   string or null,
  "eventName":     string or null,
  "organizer":     string or null,
  "eventDate":     string (YYYY-MM-DD) or null,
  "startDate":     string (YYYY-MM-DD) or null,
  "endDate":       string (YYYY-MM-DD) or null,
  "eventLevel":    "college" | "zonal" | "state" | "national" | "international" | null,
  "achievement":   "participation" | "first" | "second" | "third" | "completed" | "qualified" | null,
  "score":         string or null,
  "issuedBy":      string or null,
  "courseHours":   number or null,
  "rawSummary":    string (one sentence summary of what this certificate is for)
}

Rules:
- If a date appears without a year, try to infer the year from context.
- For eventLevel: interpret based on scope - if it mentions "national level", use "national", etc.
- For achievement: "1st prize" = "first", "participation certificate" = "participation", course completion = "completed".
- rawSummary should be a concise human-readable summary of the certificate.
- If you cannot determine a value, use null. Do not guess.
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a file's mimetype to a Gemini-compatible MIME type string.
 */
function toGeminiMime(mimetype) {
    const map = {
        'image/jpeg': 'image/jpeg',
        'image/jpg':  'image/jpeg',
        'image/png':  'image/png',
        'application/pdf': 'application/pdf',
    };
    return map[mimetype] || 'application/octet-stream';
}

/**
 * Safely parses Gemini's response — strips any markdown code fences if present.
 */
function parseGeminiJSON(raw) {
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    return JSON.parse(cleaned);
}

// ─── Main Extractor ───────────────────────────────────────────────────────────

/**
 * Extracts structured data from an activity evidence file using Gemini AI.
 *
 * @param {string} filePath - Relative path from backend root (e.g. 'uploads/evidence/xyz.pdf')
 * @param {string} mimetype - File MIME type (e.g. 'application/pdf', 'image/jpeg')
 * @returns {Promise<Object>} Extracted fields + confidence metadata
 */
async function extractEvidenceData(filePath, mimetype) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }

    let fileBuffer;
    
    if (filePath.startsWith('http')) {
        // Fetch from Cloudinary
        try {
            const response = await axios.get(filePath, { responseType: 'arraybuffer' });
            fileBuffer = Buffer.from(response.data);
        } catch (err) {
            throw new Error(`Failed to fetch evidence file from Cloudinary: ${err.message}`);
        }
    } else {
        // Fetch from local disk
        const absPath = path.join(__dirname, '../..', filePath);
        if (!fs.existsSync(absPath)) {
            throw new Error(`Evidence file not found on disk: ${absPath}`);
        }
        fileBuffer = fs.readFileSync(absPath);
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use gemini-1.5-flash for speed and cost efficiency
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    let result;

    if (mimetype === 'application/pdf' && pdfParse) {
        // ── PDF: extract text first, then send text to Gemini ──
        const pdfData   = await pdfParse(fileBuffer);
        const pdfText   = pdfData.text?.trim();

        if (!pdfText || pdfText.length < 20) {
            // Scanned PDF with no text — fall back to vision
            const imageData = {
                inlineData: {
                    data:     fileBuffer.toString('base64'),
                    mimeType: 'application/pdf',
                },
            };
            result = await model.generateContent([EXTRACTION_PROMPT, imageData]);
        } else {
            const prompt = `${EXTRACTION_PROMPT}\n\n--- Certificate Text ---\n${pdfText}`;
            result = await model.generateContent(prompt);
        }
    } else {
        // ── Image: send directly as vision input ──
        const imageData = {
            inlineData: {
                data:     fileBuffer.toString('base64'),
                mimeType: toGeminiMime(mimetype),
            },
        };
        result = await model.generateContent([EXTRACTION_PROMPT, imageData]);
    }

    const rawText = result.response.text();
    let extracted;

    try {
        extracted = parseGeminiJSON(rawText);
    } catch {
        // Return partial result if JSON parse fails
        return {
            success:   false,
            rawText,
            extracted: null,
            error:     'Gemini returned non-JSON response. Manual review required.',
        };
    }

    return {
        success:   true,
        extracted,
        rawText,
        error:     null,
    };
}

module.exports = { extractEvidenceData };
