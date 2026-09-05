/**
 * @file googlePeopleApi.js
 * @description Fetches all contacts from the Google Workspace directory
 * using the People API with a stored OAuth2 refresh token.
 *
 * The first-time OAuth flow:
 *   1. Admin visits GET /api/sync/oauth/url  → redirected to Google consent screen
 *   2. Admin grants "contacts.readonly" + "directory.readonly" scopes
 *   3. Google redirects to GET /api/sync/oauth/callback with ?code=...
 *   4. Backend exchanges code → access_token + refresh_token
 *   5. Refresh token stored in GOOGLE_REFRESH_TOKEN env variable
 *
 * Subsequent syncs use the stored refresh token automatically.
 */

'use strict';

const { google } = require('googleapis');

// ─── OAuth2 Client setup ──────────────────────────────────────────────────────

function createOAuthClient() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI, // e.g. http://localhost:5000/api/sync/oauth/callback
    );
}

/**
 * Returns the Google consent URL for the admin to visit.
 * @returns {string} URL
 */
function getOAuthUrl() {
    const oauth2Client = createOAuthClient();
    return oauth2Client.generateAuthUrl({
        access_type:  'offline',   // needed to get a refresh_token
        prompt:       'consent',   // force refresh_token every time (important!)
        scope: [
            'https://www.googleapis.com/auth/contacts.readonly',
            'https://www.googleapis.com/auth/directory.readonly',
        ],
    });
}

/**
 * Exchanges an auth code (from OAuth callback) for tokens.
 * Returns { access_token, refresh_token, expiry_date }.
 * IMPORTANT: Store the refresh_token securely in GOOGLE_REFRESH_TOKEN env var.
 *
 * @param {string} code - The code from the OAuth callback query param.
 * @returns {Promise<object>} Token object
 */
async function exchangeCodeForTokens(code) {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Creates an authenticated OAuth2 client using the stored refresh token.
 * @returns {google.auth.OAuth2}
 */
function getAuthenticatedClient() {
    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
}

// ─── Directory Fetch ──────────────────────────────────────────────────────────

/**
 * Fetches all people from the Google Workspace directory.
 * Uses the People API "listDirectoryPeople" endpoint with pagination.
 *
 * @returns {Promise<Array<{name: string, email: string}>>}
 */
async function fetchAllDirectoryContacts() {
    const auth   = getAuthenticatedClient();
    const people = google.people({ version: 'v1', auth });

    const contacts = [];
    let pageToken  = undefined;

    do {
        const res = await people.people.listDirectoryPeople({
            readMask:  'names,emailAddresses',
            sources:   ['DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
            pageSize:  1000,           // max allowed by the API
            pageToken,
        });

        const members = res.data.people || [];

        for (const person of members) {
            // Pick the primary (or first) email
            const emailObj = (person.emailAddresses || []).find(e => e.metadata?.primary) 
                          || (person.emailAddresses || [])[0];
            // Pick the display name
            const nameObj  = (person.names || []).find(n => n.metadata?.primary)
                          || (person.names || [])[0];

            if (emailObj?.value) {
                contacts.push({
                    name:  nameObj?.displayName || '',
                    email: emailObj.value.toLowerCase().trim(),
                });
            }
        }

        pageToken = res.data.nextPageToken;
    } while (pageToken);

    return contacts;
}

module.exports = {
    getOAuthUrl,
    exchangeCodeForTokens,
    fetchAllDirectoryContacts,
};
