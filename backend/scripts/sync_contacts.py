"""
Google Contacts Prefix Search Sync Script for SAMS
Searches Google Contacts Directory by batch prefix (pkd21, pkd22, pkd23, pkd24, pkd25, lpkd)
to load all student batches instantly without hitting infinite scroll rate limits.
"""

import sys
import os
import time
import re
import json
import random
import requests
import io
import shutil

# Force UTF-8 on Windows
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Configure backend target URL
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:5000/api/sync/paste')
USER_DATA_DIR = os.path.join(os.environ.get('LOCALAPPDATA', os.path.dirname(__file__)), 'SAMS-Chrome-Profile')

# Focus 100% on B.Tech student batches (2023, 2024, 2025) using '0' prefix (pkd23cs0, etc.)
STUDENT_YEARS = ['23', '24', '25']
BRANCHES = ['cs', 'ec', 'ee', 'it', 'me', 'ce']

STUDENT_PREFIXES = (
    [f"pkd{y}{b}0" for y in STUDENT_YEARS for b in BRANCHES] +
    [f"lpkd{y}{b}" for y in STUDENT_YEARS for b in BRANCHES]
)

PREFIXES = STUDENT_PREFIXES

def clean_lock_files(profile_dir):
    """Removes leftover Chrome Singleton lock files."""
    if not os.path.exists(profile_dir):
        os.makedirs(profile_dir, exist_ok=True)
        return
    for f in ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'lockfile']:
        p = os.path.join(profile_dir, f)
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass

def get_driver(options):
    try:
        return webdriver.Chrome(options=options)
    except Exception as e:
        print(f"[WARN] Initial driver start error: {e}. Resetting automation profile...")
        shutil.rmtree(USER_DATA_DIR, ignore_errors=True)
        os.makedirs(USER_DATA_DIR, exist_ok=True)
        return webdriver.Chrome(options=options)

import csv

CSV_BACKUP_PATH = os.path.join(os.path.dirname(__file__), '../data/gecskp_students_backup.csv')
JSON_BACKUP_PATH = os.path.join(os.path.dirname(__file__), '../data/gecskp_students_backup.json')

def save_local_backup(contacts_map):
    try:
        os.makedirs(os.path.dirname(CSV_BACKUP_PATH), exist_ok=True)
        with open(CSV_BACKUP_PATH, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Name', 'Email'])
            for email, name in sorted(contacts_map.items()):
                writer.writerow([name, email])
        with open(JSON_BACKUP_PATH, 'w', encoding='utf-8') as f:
            json.dump(contacts_map, f, indent=2, ensure_ascii=False)
        print(f"[BACKUP] Saved local CSV backup to: {CSV_BACKUP_PATH}")
    except Exception as e:
        print(f"[WARN] Could not write CSV backup: {e}")

def main():
    print("=" * 60)
    print("[INFO] SAMS Google Contacts Fast Prefix-Search Sync")
    print("=" * 60)

    # 0. Check if offline cached mode is requested
    contacts_map = {}
    if '--offline' in sys.argv or '--cached' in sys.argv:
        if os.path.exists(JSON_BACKUP_PATH):
            with open(JSON_BACKUP_PATH, 'r', encoding='utf-8') as f:
                contacts_map = json.load(f)
            print(f"[OFFLINE] Loaded {len(contacts_map)} contacts from cached file: {JSON_BACKUP_PATH}")
        elif os.path.exists(CSV_BACKUP_PATH):
            with open(CSV_BACKUP_PATH, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader, None) # skip header
                for row in reader:
                    if len(row) >= 2:
                        contacts_map[row[1].strip().lower()] = row[0].strip()
            print(f"[OFFLINE] Loaded {len(contacts_map)} contacts from CSV file: {CSV_BACKUP_PATH}")

    if not contacts_map:
        clean_lock_files(USER_DATA_DIR)

        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_argument("--disable-session-crashed-bubble")
        chrome_options.add_argument("--hide-crash-restore-bubble")
        chrome_options.add_argument("--log-level=3")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        print("[INFO] Launching native Google Chrome window...")
        driver = get_driver(chrome_options)

        try:
            # 1. Open Google Contacts Directory
            driver.get("https://contacts.google.com/directory")
            print("[INFO] Checking Google login status...")
            print("[TIP] If prompted, please sign in with your @gecskp.ac.in account in the opened window.")

            # Wait until user is authenticated
            auth_detected = False
            start_wait = time.time()

            while time.time() - start_wait < 300:
                current_url = driver.current_url
                if "contacts.google.com" in current_url and "accounts.google.com" not in current_url:
                    auth_detected = True
                    print("[OK] Authenticated successfully on Google Contacts!")
                    break
                time.sleep(2)

            if not auth_detected:
                print("[ERROR] Timed out waiting for Google sign-in.")
                return

            time.sleep(2)

            def grab_visible_contacts():
                try:
                    text = driver.find_element(By.TAG_NAME, "body").text
                    lines = text.split("\n")
                    for i, line in enumerate(lines):
                        line = line.strip()
                        m = re.search(r'([a-zA-Z0-9._%+-]+@gecskp\.ac\.in)', line, re.IGNORECASE)
                        if m:
                            email = m.group(1).lower()
                            # Exclude Computational Linguistics (cscl) or M.Tech programs
                            if 'cscl' in email or 'mtech' in email or 'vlsi' in email:
                                continue

                            name = ""
                            if i > 0 and "@" not in lines[i-1] and len(lines[i-1]) < 60:
                                name = lines[i-1].strip()
                            elif line.replace(email, '').strip():
                                name = line.replace(email, '').strip()

                            if email not in contacts_map:
                                contacts_map[email] = name
                except Exception:
                    pass

            # 2. Iterate through each batch prefix query with bulletproof stability
            # 2. Iterate through each batch prefix query using Organic Human Typing
            print("[INFO] Starting organic human batch prefix search...")

            def human_type_batch(query):
                try:
                    inputs = driver.find_elements(By.CSS_SELECTOR, 'input[aria-label*="Search"], input[type="text"], input[role="combobox"]')
                    if inputs:
                        box = inputs[0]
                        box.click()
                        time.sleep(random.uniform(0.25, 0.55))
                        
                        # Natural select-all and backspace
                        box.send_keys(Keys.CONTROL, 'a')
                        time.sleep(random.uniform(0.12, 0.25))
                        box.send_keys(Keys.BACKSPACE)
                        time.sleep(random.uniform(0.15, 0.35))

                        # Human character-by-character typing with natural jitter
                        for ch in query:
                            box.send_keys(ch)
                            # Slightly longer pause on numbers
                            if ch.isdigit():
                                time.sleep(random.uniform(0.14, 0.28))
                            else:
                                time.sleep(random.uniform(0.09, 0.21))

                        # Natural hesitation before hitting Enter
                        time.sleep(random.uniform(0.35, 0.75))
                        box.send_keys(Keys.ENTER)
                        return True
                except Exception:
                    pass
                
                # Fallback to direct search URL if DOM input lost
                try:
                    driver.get(f"https://contacts.google.com/search/{query}")
                    return True
                except Exception:
                    pass
                return False

            next_break_target = random.randint(4, 7)
            queries_since_break = 0

            for idx, prefix in enumerate(PREFIXES):
                try:
                    print(f"[SEARCH] ({idx+1}/{len(PREFIXES)}) Querying batch: '{prefix}' ...")
                    
                    human_type_batch(prefix)
                    
                    # Organic human visual reading pause (varies per query)
                    time.sleep(random.uniform(1.9, 3.3))

                    # Smooth human kinetic scrolls on the result list
                    scroll_steps = random.randint(3, 5)
                    for _ in range(scroll_steps):
                        scroll_chunk = random.randint(380, 520)
                        driver.execute_script(f"""
                            const all = document.querySelectorAll('*');
                            for (const el of all) {{
                                if (el.scrollHeight > el.clientHeight + 20) {{
                                    const s = window.getComputedStyle(el);
                                    if (s.overflowY === 'auto' || s.overflowY === 'scroll') {{
                                        el.scrollTop += {scroll_chunk};
                                    }}
                                }}
                            }}
                            window.scrollBy(0, {scroll_chunk});
                        """)
                        time.sleep(random.uniform(0.45, 0.85))
                        grab_visible_contacts()

                    print(f"[PROGRESS] Total unique students captured so far: {len(contacts_map)}")

                    # Natural human pause before moving to the next class
                    time.sleep(random.uniform(1.4, 2.9))

                    # Organic randomized micro-breaks (e.g. every 4-7 queries, take a 3.5s - 6.5s rest)
                    queries_since_break += 1
                    if queries_since_break >= next_break_target and (idx + 1) < len(PREFIXES):
                        break_dur = random.uniform(3.8, 6.2)
                        print(f"[COOLDOWN] Taking an organic {break_dur:.1f}s human reading pause...")
                        time.sleep(break_dur)
                        queries_since_break = 0
                        next_break_target = random.randint(4, 7)

                except Exception as q_err:
                    print(f"[WARN] Hiccup on prefix '{prefix}': {q_err}. Continuing...")
                    time.sleep(random.uniform(1.5, 2.5))

            # Also grab initial directory view
            try:
                driver.get("https://contacts.google.com/directory")
                time.sleep(2.5)
                grab_visible_contacts()
            except Exception:
                pass

            print("=" * 60)
            print(f"[OK] Total unique college contacts extracted: {len(contacts_map)}")
            print("=" * 60)

            # Automatically save local backup CSV and JSON files!
            save_local_backup(contacts_map)

        except Exception as e:
            print(f"[ERROR] during sync: {e}")
        finally:
            print("[INFO] Closing browser in 3 seconds...")
            time.sleep(3)
            driver.quit()

    if len(contacts_map) == 0:
        print("[WARN] No contacts found to send.")
        return

    # Prepare payload for SAMS backend
    lines_payload = [f"{name} {email}" for email, name in contacts_map.items()]
    raw_text = "\n".join(lines_payload)

    print(f"[INFO] Sending {len(contacts_map)} contacts to SAMS backend ({BACKEND_URL})...")
    res = requests.post(
        BACKEND_URL,
        json={"text": raw_text},
        headers={"Content-Type": "application/json"},
        timeout=180
    )

    if res.status_code == 200:
        data = res.json()
        sum_info = data.get('summary', {})
        print("=" * 60)
        print("[SUCCESS] SAMS SYNC COMPLETED SUCCESSFULLY!")
        print(f"   Students Added:    {sum_info.get('studentsCreated', 0)}")
        print(f"   Students Updated:  {sum_info.get('studentsUpdated', 0)}")
        print(f"   Batches Created:   {sum_info.get('batchesCreated', 0)}")
        print(f"   Batches Updated:   {sum_info.get('batchesUpdated', 0)}")
        print("=" * 60)
    else:
        print(f"[ERROR] SAMS API responded with error ({res.status_code}): {res.text}")

if __name__ == "__main__":
    main()
