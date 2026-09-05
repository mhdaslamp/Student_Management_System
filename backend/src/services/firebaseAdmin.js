/**
 * @file firebaseAdmin.js
 * @description Initializes Firebase Admin SDK and provides a utility to verify Firebase ID Tokens.
 */

'use strict';

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin if the env variable is present
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
        const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        if (getApps().length === 0) {
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully.');
        }
    } catch (err) {
        console.error('Failed to initialize Firebase Admin SDK:', err.message);
    }
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Google Sign-In will not work.');
}

/**
 * Verifies a Firebase ID token.
 * 
 * @param {string} idToken - The JWT token from the client.
 * @returns {Promise<object>} The decoded token payload.
 * @throws Will throw an error if the token is invalid or expired.
 */
async function verifyIdToken(idToken) {
    if (getApps().length === 0) {
        throw new Error('Firebase Admin SDK is not initialized.');
    }
    return await getAuth().verifyIdToken(idToken);
}

module.exports = {
    verifyIdToken
};
