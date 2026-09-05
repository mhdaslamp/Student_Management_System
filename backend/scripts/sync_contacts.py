"""
Google Contacts Prefix Search Sync Script for SAMS
Searches Google Contacts Directory by batch prefix (pkd21, pkd22, pkd23, pkd24, pkd25, lpkd)
Scoped scrolling per prefix with immediate per-batch streaming and checkpoint recovery.
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
import csv
import signal

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

# Configure paths & endpoints
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:5000/api/sync/stream-chunk')
USER_DATA_DIR = os.path.join(os.environ.get('LOCALAPPDATA', os.path.dirname(__file__)), 'SAMS-Chrome-Profile')
DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')
os.makedirs(DATA_DIR, exist_ok=True)

STATE_FILE_PATH = os.path.join(DATA_DIR, 'sync_state.json')
CSV_BACKUP_PATH = os.path.join(DATA_DIR, 'gecskp_students_backup.csv')
JSON_BACKUP_PATH = os.path.join(DATA_DIR, 'gecskp_students_backup.json')

# Batch configurations (from 2023 onwards: 2023, 2024, 2025)
STUDENT_YEARS = ['23', '24', '25']
BRANCHES = ['cs', 'ec', 'ee', 'it', 'me', 'ce']

# Regular 0-prefix: isolates 2-letter branch rolls (pkd23cs001-pkd23cs065) avoiding cscl/other branches
REGULAR_PREFIXES = [f"pkd{y}{b}0" for y in STUDENT_YEARS for b in BRANCHES]
LATERAL_PREFIXES = [f"lpkd{y}{b}" for y in ['23', '24', '25'] for b in BRANCHES]

ALL_PREFIXES = REGULAR_PREFIXES + LATERAL_PREFIXES

PREFIXES_FILE_PATH = os.path.join(DATA_DIR, 'prefixes.json')
if os.path.exists(PREFIXES_FILE_PATH):
    try:
        with open(PREFIXES_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                # Append custom prefixes that are not already in ALL_PREFIXES
                for p in data:
                    if p not in ALL_PREFIXES:
                        ALL_PREFIXES.append(p)
    except Exception as e:
        print(f"[WARN] Could not read custom prefixes.json, using defaults: {e}")


def load_sync_state():
    """Loads the sync checkpoint state."""
    default_state = {
        "lastUpdated": None,
        "completed": {},   # prefix -> { count: int, timestamp: str }
        "failed": {}
    }
    if os.path.exists(STATE_FILE_PATH):
        try:
            with open(STATE_FILE_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data
        except Exception:
            return default_state
    return default_state

def save_sync_state(state):
    """Persists sync checkpoint state to JSON."""
    try:
        state["lastUpdated"] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        with open(STATE_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"[WARN] Could not save sync state: {e}")

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

def save_local_backup(all_contacts_map):
    try:
        with open(CSV_BACKUP_PATH, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Name', 'Email'])
            for email, name in sorted(all_contacts_map.items()):
                writer.writerow([name, email])
        with open(JSON_BACKUP_PATH, 'w', encoding='utf-8') as f:
            json.dump(all_contacts_map, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[WARN] Could not write backup files: {e}")

def stream_chunk_to_backend(prefix, contacts_dict):
    """Immediately streams a batch's contacts to the SAMS backend."""
    if not contacts_dict:
        print(f"[STREAM] No new contacts found for '{prefix}'.")
        return True

    payload = {
        "prefix": prefix,
        "contacts": [{"name": name, "email": email} for email, name in contacts_dict.items()]
    }

    try:
        res = requests.post(BACKEND_URL, json=payload, headers={"Content-Type": "application/json"}, timeout=45)
        if res.status_code == 200:
            sum_info = res.json().get('summary', {})
            print(f"[STREAM SUCCESS] '{prefix}': {len(contacts_dict)} sent | Added: {sum_info.get('studentsCreated', 0)} | Updated: {sum_info.get('studentsUpdated', 0)}")
            return True
        else:
            print(f"[STREAM ERROR] Backend error on '{prefix}' ({res.status_code}): {res.text}")
            return False
    except Exception as e:
        print(f"[STREAM ERROR] Failed to stream '{prefix}' to backend: {e}")
        return False

def main():
    print("=" * 60)
    print("[INFO] SAMS Google Contacts Resilient Prefix Sync Engine")
    print("=" * 60)

    # 1. Determine execution mode
    is_fresh = '--fresh' in sys.argv
    state = load_sync_state()

    if is_fresh:
        print("[MODE] Fresh Sync Requested: Resetting previous checkpoints.")
        state = {"lastUpdated": None, "completed": {}, "failed": {}}
        save_sync_state(state)
    else:
        completed_count = len(state.get("completed", {}))
        print(f"[MODE] Resuming Balance: {completed_count}/{len(ALL_PREFIXES)} prefixes already completed.")

    # Load cumulative contacts map from JSON backup if available
    all_contacts_map = {}
    if os.path.exists(JSON_BACKUP_PATH):
        try:
            with open(JSON_BACKUP_PATH, 'r', encoding='utf-8') as f:
                all_contacts_map = json.load(f)
        except Exception:
            all_contacts_map = {}

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

    # Graceful shutdown handler
    def handle_interrupt(signum, frame):
        print("\n[WARN] Interrupted! Safely saving state and closing driver...")
        save_sync_state(state)
        save_local_backup(all_contacts_map)
        try:
            driver.quit()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_interrupt)

    try:
        # Step 1: Open Google Contacts Directory
        driver.get("https://contacts.google.com/directory")
        print("[INFO] Checking Google login status...")
        print("[TIP] If prompted, please sign in with your @gecskp.ac.in account.")

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

        def extract_contacts_from_results():
            """Extracts matching @gecskp.ac.in contacts from current view."""
            found = {}
            try:
                text = driver.find_element(By.TAG_NAME, "body").text
                lines = text.split("\n")
                for i, line in enumerate(lines):
                    line = line.strip()
                    m = re.search(r'([a-zA-Z0-9._%+-]+@gecskp\.ac\.in)', line, re.IGNORECASE)
                    if m:
                        email = m.group(1).lower()
                        # Exclude unintended programs like cscl or mtech
                        if 'cscl' in email or 'mtech' in email or 'vlsi' in email:
                            continue

                        name = ""
                        if i > 0 and "@" not in lines[i-1] and len(lines[i-1]) < 60:
                            name = lines[i-1].strip()
                        elif line.replace(email, '').strip():
                            name = line.replace(email, '').strip()

                        found[email] = name
            except Exception:
                pass
            return found

        def human_type_batch(query):
            """Simulates natural human typing into the search bar."""
            try:
                inputs = driver.find_elements(By.CSS_SELECTOR, 'input[aria-label*="Search"], input[type="text"], input[role="combobox"]')
                if inputs:
                    box = inputs[0]
                    box.click()
                    time.sleep(random.uniform(0.2, 0.4))
                    
                    box.send_keys(Keys.CONTROL, 'a')
                    time.sleep(random.uniform(0.1, 0.2))
                    box.send_keys(Keys.BACKSPACE)
                    time.sleep(random.uniform(0.15, 0.3))

                    for ch in query:
                        box.send_keys(ch)
                        time.sleep(random.uniform(0.08, 0.18))

                    time.sleep(random.uniform(0.3, 0.6))
                    box.send_keys(Keys.ENTER)
                    return True
            except Exception:
                pass
            
            # Fallback direct search URL
            try:
                driver.get(f"https://contacts.google.com/search/{query}")
                return True
            except Exception:
                pass
            return False

        # Step 2: Iterate through prefixes
        print("\n[INFO] Starting scoped prefix search with per-batch streaming...\n")

        total_prefixes = len(ALL_PREFIXES)
        for idx, prefix in enumerate(ALL_PREFIXES):
            # Check if this prefix is already completed (in balance mode)
            if not is_fresh and prefix in state.get("completed", {}):
                prev_count = state["completed"][prefix].get("count", 0)
                print(f"[SKIP] ({idx+1}/{total_prefixes}) '{prefix}' already synced ({prev_count} students).")
                continue

            try:
                print(f"[SEARCH] ({idx+1}/{total_prefixes}) Scanning batch: '{prefix}' ...")
                human_type_batch(prefix)
                
                # Wait for search results container
                time.sleep(random.uniform(1.8, 2.8))

                # Scoped scrolls inside search results pane (3-5 scrolls max)
                prefix_contacts = {}
                scroll_steps = random.randint(3, 5)
                for s_idx in range(scroll_steps):
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
                    time.sleep(random.uniform(0.4, 0.7))
                    new_found = extract_contacts_from_results()
                    prefix_contacts.update(new_found)

                # Filter contacts specifically relevant to this prefix pattern
                clean_batch_contacts = {}
                prefix_core = prefix.lower()
                for em, nm in prefix_contacts.items():
                    if em.startswith(prefix_core):
                        clean_batch_contacts[em] = nm
                        all_contacts_map[em] = nm

                print(f"[FOUND] '{prefix}': Extracted {len(clean_batch_contacts)} students.")

                # Immediately stream this batch chunk to the SAMS backend (Zero data loss on interrupt!)
                stream_ok = stream_chunk_to_backend(prefix, clean_batch_contacts)

                # Update Checkpoint State
                if stream_ok:
                    state.setdefault("completed", {})[prefix] = {
                        "count": len(clean_batch_contacts),
                        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                    }
                    if prefix in state.get("failed", {}):
                        del state["failed"][prefix]
                else:
                    state.setdefault("failed", {})[prefix] = "Stream error"

                save_sync_state(state)
                save_local_backup(all_contacts_map)

                # Short human cooldown between queries
                time.sleep(random.uniform(1.2, 2.2))

            except Exception as q_err:
                print(f"[ERROR] Batch '{prefix}' encountered issue: {q_err}. Saving state and continuing...")
                state.setdefault("failed", {})[prefix] = str(q_err)
                save_sync_state(state)
                time.sleep(2)

        print("\n" + "=" * 60)
        print(f"[COMPLETED] Total unique student contacts synchronized: {len(all_contacts_map)}")
        print("=" * 60)

    except Exception as e:
        print(f"[CRITICAL ERROR] during sync: {e}")
    finally:
        save_sync_state(state)
        save_local_backup(all_contacts_map)
        print("[INFO] Closing browser in 3 seconds...")
        time.sleep(3)
        try:
            driver.quit()
        except Exception:
            pass

if __name__ == "__main__":
    main()

