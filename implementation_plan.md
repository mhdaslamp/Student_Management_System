# Auto Batch Processing — Updated Implementation Plan

## Confirmed Answers to Open Questions

| # | Question | Answer |
|---|---|---|
| 1 | Google Workspace Admin access? | ❌ No admin — but **People API works with any domain member account** |
| 2 | Firebase project? | ✅ New one to be set up |
| 3 | Email prefixes? | `pkd` (regular) + `lpkd` (lateral entry) |
| 4 | Department codes? | CS, EC, EE, ME, CE, IT |
| 5 | Existing students? | Sync/update them |
| 6 | Student login? | ✅ Via Google |

**Also confirmed:** Staff, HOD, and Principal also have college email IDs — so **all roles will use Firebase Google Sign-In**. No more password-based login for anyone except the system admin.

---

## Critical Design Decision — API Selection

> [!IMPORTANT]
> **Admin SDK is off the table.** The `Admin SDK Directory API` requires Super Admin credentials. Without that, we use the **Google People API** instead.

### Why People API works perfectly here

When any `@gecskp.ac.in` Google account holder opens Google Contacts, they can see ~4,000 directory contacts. This is powered by the **Google People API** endpoint `people.listDirectoryPeople`. It works with any domain member's **OAuth2 token** — no admin needed.

The API returns: full name, email addresses, phone numbers, and more — exactly what we need.

**This means:** One admin/teacher with a `@gecskp.ac.in` account connects their Google account once via OAuth in the admin panel, and our system can fetch the entire directory.

---

## Email Parsing Rules

The parser must handle two student types:

```
Regular student:
  pkd23cs038@gecskp.ac.in
  Regex: /^pkd(\d{2})([a-z]{2,3})(\d{3})@gecskp\.ac\.in$/i
  → { type: 'regular', year: '2023', dept: 'CS', roll: '038' }
  → registerId: 'PKD23CS038'

Lateral entry student:
  lpkd24cs010@gecskp.ac.in
  Regex: /^lpkd(\d{2})([a-z]{2,3})(\d{3})@gecskp\.ac\.in$/i
  → { type: 'lateral', year: '2024', dept: 'CS', roll: '010' }
  → registerId: 'LPKD24CS010'
```

Staff/HOD/Principal emails will NOT match either regex and will be treated as staff accounts.

---

## Unified Auth Strategy

**Everyone uses Google Sign-In. No passwords.** The backend determines the role from the email.

```
User clicks "Continue with Google"
         ↓
Firebase popup (restricted to @gecskp.ac.in domain only)
         ↓
Backend receives Firebase ID Token
         ↓
     ┌───────────────────────────────┐
     │ Is email in staff User table? │
     └───────────────────────────────┘
       YES                     NO
        ↓                       ↓
   Existing role          Parse email
   (admin/teacher/        with regex
    hod/principal)              ↓
        ↓               pkd/lpkd pattern?
   Return JWT               YES     NO
   with their role           ↓       ↓
                       role:       REJECT
                       student     (not a
                       Return JWT   domain
                                    member)
```

> [!NOTE]
> The system admin (`admin` role) is the only account that can optionally keep password login as a fallback since they may not have a `@gecskp.ac.in` address.

---

## Phase 0 — Building the Student Database (Priority #1)

This is the first thing to build. Everything else depends on having students in the DB.

### How it works

1. A staff member with a `@gecskp.ac.in` account visits the Admin panel.
2. They click **"Connect Google Directory"**.
3. They go through a standard Google OAuth2 consent screen asking for `contacts.readonly` + `directory.readonly` scope.
4. The backend receives and securely stores their **refresh token** (encrypted in DB or `.env`).
5. From that point, the backend can call People API at any time without anyone being logged in.
6. Admin clicks **"Sync Now"** — backend fetches all directory contacts, parses emails, creates batches and student records.

### New Files

#### [NEW] `backend/src/services/googlePeopleApi.js`
- Handles OAuth2 token exchange and refresh.
- Calls `people.listDirectoryPeople` with pagination to get all contacts.
- Filters to only `@gecskp.ac.in` emails.
- Returns a flat list of `{ name, email }` objects.

#### [NEW] `backend/src/services/emailParser.js`
- Pure function, easy to unit test.
- Input: `"pkd23cs038@gecskp.ac.in"` or `"lpkd24cs010@gecskp.ac.in"`
- Output: `{ type, year, dept, roll, registerId, admissionYear }` or `null`
- Handles both `pkd` and `lpkd` prefixes.
- Maps 2-letter dept codes to full names.

#### [NEW] `backend/src/services/batchAutoCreate.js`
- Takes the parsed list from `emailParser.js`.
- Groups by `admissionYear` + `dept`.
- For each group, upserts a `Batch` document.
- For each student, upserts a `User` document (matched by `registerId`).
- Returns a detailed sync summary: `{ batchesCreated, batchesUpdated, studentsCreated, studentsUpdated, skipped }`.

#### [MODIFY] `backend/models/User.js`
```js
// New fields:
googleId: { type: String, sparse: true, unique: true } // Firebase UID
syncedFromDirectory: { type: Boolean, default: false }
studentType: { type: String, enum: ['regular', 'lateral'], default: 'regular' }
// password → no longer required for students
password: { type: String, required: function() { return this.role === 'admin'; } }
```

#### [MODIFY] `backend/models/Batch.js`
```js
// New fields:
admissionYear: { type: String } // "2023"
lastSyncedAt:  { type: Date }
```

#### [NEW] `backend/controllers/sync.js`
- `triggerSync(req, res)` — Runs the full sync pipeline, returns summary.
- `getSyncStatus(req, res)` — Returns last sync time + counts.
- `getOAuthUrl(req, res)` — Generates the Google OAuth2 consent URL.
- `handleOAuthCallback(req, res)` — Exchanges auth code for tokens, stores refresh token.

#### [NEW] `backend/routes/sync.js`
```
GET  /api/sync/oauth/url       → Returns Google consent URL (admin only)
GET  /api/sync/oauth/callback  → Handles OAuth callback
POST /api/sync/directory       → Triggers sync (admin only)
GET  /api/sync/status          → Returns sync status
```

---

## Phase 1 — Firebase Auth (All Roles via Google)

#### [NEW] `backend/src/services/firebaseAdmin.js`
- Initializes `firebase-admin` with the Firebase service account.
- Exports `verifyIdToken(idToken)`.

#### [MODIFY] `backend/controllers/auth.js`
- Add `exports.googleLogin`:
  - Accepts a Firebase ID Token from the frontend.
  - Verifies it with `firebaseAdmin.verifyIdToken()`.
  - Checks if the email domain is `@gecskp.ac.in`.
  - Looks up the user in MongoDB by `email` or `googleId`.
  - If student email (pkd/lpkd pattern) and user exists from sync → returns JWT.
  - If staff email and user exists in DB → returns JWT.
  - If user not found → returns 403 ("Account not provisioned — contact admin").

#### [MODIFY] `backend/middleware/auth.js`
- No change needed if we issue our own JWT after Google login.
- All subsequent API calls use the same JWT auth as today — **zero breaking change**.

#### [NEW] `backend/routes/auth.js` addition
```
POST /api/auth/google   → Accepts Firebase ID Token, returns our JWT
```

---

## Phase 2 — Frontend: Firebase Google Sign-In

#### [NEW] `frontend/src/config/firebase.js`
```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Config from environment variables
export const auth = getAuth(initializeApp(firebaseConfig));
```

#### [MODIFY] `frontend/src/context/AuthContext.jsx`
- Add `loginWithGoogle()`.
- Uses `signInWithPopup(auth, new GoogleAuthProvider())`.
- `GoogleAuthProvider.setCustomParameters({ hd: 'gecskp.ac.in' })` — restricts popup to college domain.
- Sends Firebase ID Token to `POST /api/auth/google`.
- Stores returned JWT exactly as today.

#### [MODIFY] `frontend/src/pages/Login.jsx`
- Add "Continue with Google" button.
- Style: Google brand button with the Google icon.
- Works for all roles (students AND staff).
- Existing password form can be kept as a **fallback for admin only** or removed entirely.

#### [NEW] `frontend/src/pages/admin/SyncPanel.jsx`
- "Connect Google Directory" button → Opens OAuth consent flow.
- "Sync Now" button → `POST /api/sync/directory`.
- Shows sync status: last synced, total students, breakdown by dept + year.

---

## Phase 3 — Result Name Enrichment (Low Effort, High Value)

#### [MODIFY] `backend/utils/resultProcessor.js`
- After parsing a PDF result, for every row that has a `registerId` but no `studentName`:
  - Query `User.findOne({ registerId: row.registerId })`.
  - If found, set `row.studentName = user.name`.
- This is transparent — works automatically once students are in the DB.

---

## Implementation Order & Dependencies

```
Phase 0 (DB Build) ──► Phase 1 (Auth) ──► Phase 2 (Frontend) ──► Phase 3 (Enrichment)
    ↑
START HERE
```

| Phase | What | Blocks what |
|---|---|---|
| 0a | `emailParser.js` (pure function) | Everything |
| 0b | `googlePeopleApi.js` + OAuth flow | Sync |
| 0c | Model updates (User + Batch) | All writes |
| 0d | `batchAutoCreate.js` | Sync endpoint |
| 0e | `sync` controller + routes | Admin UI |
| 1 | Firebase auth backend | Student login |
| 2 | Frontend Google Sign-In | All users |
| 3 | Result enrichment | Name auto-fill |

---

## New Dependencies

| Package | Side | Purpose |
|---|---|---|
| `googleapis` | Backend | People API + OAuth2 |
| `firebase-admin` | Backend | Verify Firebase ID Tokens |
| `firebase` | Frontend | Google Sign-In popup |

---

## Security Notes

> [!CAUTION]
> The Google OAuth2 **refresh token** (stored after the admin connects their account) must be encrypted at rest or stored in an environment variable — never in plain text in the database.

> [!CAUTION]
> The Firebase service account key must be base64-encoded and stored as `FIREBASE_SERVICE_ACCOUNT` environment variable — never committed to Git.

> [!WARNING]
> The `POST /api/sync/directory` endpoint must be guarded with `auth('admin')` — only the system admin can trigger syncs.

---

## What We Build First

**Start with `emailParser.js`** — it is a pure, testable function with no external dependencies. Once that works correctly for both `pkd` and `lpkd`, we wire it into the OAuth-based sync pipeline.
