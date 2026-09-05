/**
 * @file browserDirectoryScraper.js
 * @description Automated browser scraper for Google Contacts directory.
 * Launches a browser window, navigates to Google Contacts Directory,
 * scrolls to load all contacts, extracts { name, email }, and passes them
 * to the batch creation pipeline.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { processContactsList } = require('./batchAutoCreate');

/**
 * Finds the local Google Chrome executable on Windows if installed.
 */
function findChromeExecutable() {
    const candidatePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
    ];

    for (const p of candidatePaths) {
        if (p && fs.existsSync(p)) {
            return p;
        }
    }
    return undefined;
}

/**
 * Removes lingering Chrome Singleton lock files on Windows.
 */
function cleanProfileLockFiles(profileDir) {
    if (!fs.existsSync(profileDir)) return;
    const lockFiles = ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'lockfile'];
    for (const f of lockFiles) {
        const fullPath = path.join(profileDir, f);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            } catch (e) {
                // Ignore if locked by an active process
            }
        }
    }
}

/**
 * Automates opening Google Contacts, scrolling through directory contacts
 * using human-like smooth scrolling, pauses, and extraction.
 *
 * @param {string} createdByUserId - Admin user ID
 * @param {object} options - Optional settings
 * @returns {Promise<object>} Sync summary
 */
async function runAutomatedBrowserSync(createdByUserId, options = {}) {
    console.log('🚀 Starting Human-Like Google Contacts Browser Sync...');

    const chromePath = findChromeExecutable();
    const automationProfileDir = path.join(__dirname, '../../data/chrome-automation-profile');

    // Ensure data directory exists
    if (!fs.existsSync(automationProfileDir)) {
        fs.mkdirSync(automationProfileDir, { recursive: true });
    }

    cleanProfileLockFiles(automationProfileDir);

    const launchArgs = [
        '--start-maximized',
        '--new-window',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--disable-session-crashed-bubble',
        '--hide-crash-restore-bubble',
        '--disable-features=InfiniteSessionRestore',
        '--window-size=1280,850'
    ];

    const launchConfig = {
        headless: false,
        defaultViewport: null,
        userDataDir: automationProfileDir,
        args: launchArgs,
    };

    console.log(`🚀 Launching standalone Chromium browser window...`);
    
    let browser;
    try {
        browser = await puppeteer.launch(launchConfig);
    } catch (launchErr) {
        console.warn('⚠️ Could not open with persistent profile, launching clean Chromium window...', launchErr.message);
        delete launchConfig.userDataDir;
        browser = await puppeteer.launch(launchConfig);
    }

    try {
        const pages = await browser.pages();
        const page = pages.length > 0 ? pages[0] : await browser.newPage();
        await page.bringToFront();

        // Set realistic user-agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log('🌐 Navigating to Google Contacts Directory...');
        await page.goto('https://contacts.google.com/directory', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Resilient waiting for user to sign in and reach the Directory contacts table
        console.log('🔍 Waiting for contacts list to appear on screen in the opened browser window...');
        const loginStartTime = Date.now();

        while (Date.now() - loginStartTime < 300000) { // Up to 5 minutes
            const pageState = await page.evaluate(() => {
                const text = document.body.innerText || '';
                const hasEmails = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text);
                const hasRows = document.querySelectorAll('div[role="row"], tr, [data-email]').length >= 2;
                return { hasEmails, hasRows, url: window.location.href };
            }).catch(() => ({ hasEmails: false, hasRows: false, url: '' }));

            if (pageState.hasEmails || pageState.hasRows) {
                console.log('✅ Contacts list detected on screen! Starting extraction...');
                break;
            }

            // If user is logged in to contacts home but not on directory, help navigate
            if (pageState.url.includes('contacts.google.com') && !pageState.url.includes('/directory') && !pageState.url.includes('accounts.google.com')) {
                console.log('🌐 Directing browser to https://contacts.google.com/directory ...');
                await page.goto('https://contacts.google.com/directory', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
            }

            console.log('⏳ Please sign into your @gecskp.ac.in account in the opened window...');
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('⏳ Allowing directory table to fully hydrate...');
        await new Promise(r => setTimeout(r, 3000));

        // Click into the contacts list area so keyboard events target the list
        try {
            await page.click('div[role="row"], div[role="feed"], [data-email], c-wiz').catch(() => {});
        } catch (e) {}

        console.log('📜 Continuous scroll and live extraction of virtual directory list...');

        // Continuous extraction & human-like multi-container scrolling
        const extractedContacts = await page.evaluate(async () => {
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

            const contactsMap = new Map();

            const grabVisibleContacts = () => {
                const text = document.body.innerText || '';
                const lines = text.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

                    if (emailMatch) {
                        const email = emailMatch[0].toLowerCase().trim();
                        let name = '';

                        if (i > 0 && lines[i - 1] && !lines[i - 1].includes('@') && lines[i - 1].length < 60) {
                            name = lines[i - 1].trim();
                        } else if (line.replace(email, '').trim()) {
                            name = line.replace(email, '').trim();
                        }

                        if (!contactsMap.has(email)) {
                            contactsMap.set(email, name);
                        }
                    }
                }
            };

            // Find all scrollable containers on the page
            const getScrollContainers = () => {
                const list = [];
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    if (el.scrollHeight > el.clientHeight + 20) {
                        const style = window.getComputedStyle(el);
                        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
                            list.push(el);
                        }
                    }
                }
                if (list.length === 0) {
                    const main = document.querySelector('[role="main"]') || document.querySelector('c-wiz') || document.documentElement;
                    if (main) list.push(main);
                }
                return list;
            };

            // Grab initial view
            grabVisibleContacts();

            let prevAccumulatedCount = contactsMap.size;
            let noNewContactsStreak = 0;

            for (let step = 0; step < 500; step++) {
                const scrollDistance = randomBetween(500, 900);
                const containers = getScrollContainers();

                // Scroll all scroll containers
                for (const container of containers) {
                    container.scrollBy({ top: scrollDistance, behavior: 'smooth' });
                    container.scrollTop += scrollDistance;
                }
                window.scrollBy({ top: scrollDistance, behavior: 'smooth' });
                document.documentElement.scrollTop += scrollDistance;

                // Dispatch synthetic WheelEvent to trigger virtual list renderers
                try {
                    const targetEl = document.querySelector('div[role="row"]') || document.body;
                    targetEl.dispatchEvent(new WheelEvent('wheel', {
                        deltaY: scrollDistance,
                        bubbles: true,
                        cancelable: true
                    }));
                } catch (e) {}

                // Allow Google Contacts to fetch next page and render
                await sleep(randomBetween(500, 900));

                // Grab newly rendered virtual contacts
                grabVisibleContacts();

                const currentAccumulated = contactsMap.size;

                if (currentAccumulated === prevAccumulatedCount) {
                    noNewContactsStreak++;
                    // Give 15 attempts (~10 seconds) of no new contacts before stopping
                    if (noNewContactsStreak >= 15) {
                        console.log('Completed scanning directory. Total extracted:', currentAccumulated);
                        break;
                    }
                } else {
                    noNewContactsStreak = 0;
                }

                prevAccumulatedCount = currentAccumulated;
            }

            return Array.from(contactsMap.entries()).map(([email, name]) => ({ email, name }));
        });

        console.log(`✅ Extracted ${extractedContacts.length} contacts via browser.`);
        
        // Final gentle pause before closing
        await new Promise(r => setTimeout(r, 1000));
        await browser.close();

        if (extractedContacts.length === 0) {
            throw new Error('No contacts could be extracted. Please ensure the page displays your college directory list.');
        }

        // Process through SAMS batch creation pipeline
        const summary = await processContactsList(extractedContacts, createdByUserId);
        return summary;

    } catch (error) {
        if (browser) await browser.close().catch(() => {});
        throw error;
    }
}

module.exports = { runAutomatedBrowserSync };

