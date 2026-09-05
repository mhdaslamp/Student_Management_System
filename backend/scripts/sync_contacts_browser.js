/**
 * @file sync_contacts_browser.js
 * @description Standalone CLI script to run automated browser sync.
 * Usage: npm run sync:contacts
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const { runAutomatedBrowserSync } = require('../src/services/browserDirectoryScraper');

async function main() {
    try {
        console.log('📡 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ No admin user found in database.');
            process.exit(1);
        }

        console.log(`👤 Running sync on behalf of Admin: ${adminUser.name} (${adminUser.email})`);
        const summary = await runAutomatedBrowserSync(adminUser._id, { headless: false });

        console.log('\n=============================================');
        console.log('🎉 SYNC COMPLETE SUMMARY');
        console.log('=============================================');
        console.log(`Total Contacts Processed: ${summary.totalContacts}`);
        console.log(`Students Found:          ${summary.studentsFound}`);
        console.log(`Students Created:        ${summary.studentsCreated}`);
        console.log(`Students Updated:        ${summary.studentsUpdated}`);
        console.log(`Batches Created:         ${summary.batchesCreated}`);
        console.log(`Batches Updated:         ${summary.batchesUpdated}`);
        console.log('=============================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error running browser sync:', err);
        process.exit(1);
    }
}

main();
