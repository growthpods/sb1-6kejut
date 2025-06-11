# sb1-6kejut
Repository created by Bolt to GitHub extension

## Job Ingestion Pipeline (Latest, Consolidated)

### Overview
This project now uses a single, consolidated Netlify function for all job ingestion, parsing, and upserting. All legacy and redundant scripts have been removed for clarity and maintainability.

### Main Pipeline
- **Function:** `netlify/functions/fetch-daily-jobs.js`
- **What it does:**
  1. **Fetches** jobs from RapidAPI (location: Texas).
  2. **Filters** for student-friendly jobs.
  3. **Parses/classifies** each job using AI (Google Gemini) for:
     - Education level (High School or College)
     - Time commitment (Evening, Weekend, Summer, etc.)
  4. **Upserts** the parsed jobs into Supabase.
  5. **Cleans up** jobs older than 2 months from the database.

### How to Run Manually
You can run the function locally for testing:
```sh
node netlify/functions/fetch-daily-jobs.js
```

### Scheduled Automation
- The function is scheduled to run daily via Netlify, as configured in `netlify.toml`.
- No manual intervention is needed for daily operation.

### No More Redundant Scripts
- All previous job fetch/classify scripts have been removed.
- The codebase is now clean and easy to maintain.

### Supporting Libraries
- AI parsing logic is in `src/lib/educationLevelParser.ts` and `src/lib/timeCommitmentParser.ts`.
- All job ingestion, parsing, and upserting is handled in one place.

---

For any further changes, add new logic to `fetch-daily-jobs.js` and supporting libraries only.
