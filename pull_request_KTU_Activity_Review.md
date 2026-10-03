# Pull Request: Teacher Dashboard Overhaul & Seamless AI Verification

## Commit Message
```text
feat: revamp teacher dashboard, upgrade AI extraction to gemini-3.5-flash, and add seamless UI polling

- Implemented a 3-level drill-down UI for the Teacher Activity Dashboard (Batches -> Students -> Review Panel).
- Integrated KTU Slab Points calculation logic (capping slabs at 40 points each).
- Built a side-by-side Activity Review Panel with integrated Cloudinary evidence previews for both PDFs and images.
- Upgraded the AI Evidence Extractor model to `gemini-3.5-flash` to bypass free-tier rate limits and significantly improve OCR and reasoning capabilities.
- Implemented a seamless auto-polling mechanism on the frontend to dynamically render AI extraction results without manual page refreshes or blocking alert dialogues.
- Fixed mobile layout constraints in the Review Panel to allow natural vertical scrolling.
- Updated activity cards and details grids to render the actual student-provided data (activityName, organizer, duration, semester) instead of hardcoded rule placeholders.
```

---

## Pull Request Description

### 🚀 What's Changed
This pull request brings a massive UX overhaul to the **Teacher Activity Verification Dashboard** and significantly improves the robustness of the **AI Evidence Extraction Pipeline**. Teachers can now verify student KTU activities through a seamless, responsive, and automated side-by-side interface.

### ✨ Key Features & Improvements
* **3-Level Drill-Down UI:** 
  * Replaced the cluttered single-page view with a structured flow: `Batch Select` -> `Student Points Summary` -> `Activity Review`.
  * Instantly view a student's KTU slab breakdown (Slab 1, 2, and 3 capped at 40 points) right from the list.
* **Side-by-Side Review Panel:** 
  * The selected activity opens in a sleek split-pane view. The student's uploaded Cloudinary evidence (PDF or Image) renders on the left, while the review tools and AI data render on the right.
  * *Mobile-Responsive:* The rigid desktop constraints have been updated so that the panel stacks and scrolls perfectly on mobile devices.
* **Intelligent AI Upgrades:**
  * Upgraded the backend extraction service from the deprecated `gemini-1.5` models to **`gemini-3.5-flash`**. This provides near-instant, highly accurate extractions while successfully bypassing the strict free-tier rate limits associated with Pro models.
  * Replaced the intrusive browser `alert()` dialogues with a seamless background polling hook (`useEffect`). Clicking "Run AI Analysis" now displays a sleek loading state and automatically updates the UI with the purple extraction results the exact second the backend queue finishes.
* **Data Presentation Fixes:**
  * Fixed an issue where activities were defaulting to "Activity - Rule X.Y". The UI now properly targets the database's `activityName`, `organizer`, `semester`, and `duration` (startDate/endDate) to display the student's actual form inputs.

### 🐛 Bug Fixes
* Fixed the `SS1` double 'S' typo in the semester display.
* Fixed the mobile layout where the bottom half of the review panel was hidden due to `overflow-hidden` height constraints.
* Removed deprecated API version calls to Google Generative AI which were throwing 404 errors.

### 📸 UI Previews
* **List View:** Sorts pending activities to the top, filterable by status.
* **Review View:** Clear 2-column grid showing Student Form Data vs AI Extracted Data. Buttons dynamically hide once an item is officially `VERIFIED`.
