# Active Context

This file tracks the current work focus.

## Current Focus
- Debugging the chat interface to properly display responses from the Gemini API
- Implementing error handling for API failures
- Adding unit tests for the Gemini API integration
- Enhancing the job posting workflow with more AI-powered features
- Implementing analytics for job posting performance
- Adding email notifications for job applications
- Testing the guardrails to ensure they're effective
- Ensuring the job posting workflow correctly collects contact information
- Testing and refining the RapidAPI Internships integration (script updated for Houston, manual run performed).
- Implemented automated daily job fetching using Netlify Scheduled Functions.
- Refactored Netlify function and related local script to use `supabase-js` client directly for database operations instead of MCP.

## Recent Changes
- Replaced OpenRouter API with Google Gemini API for job posting functionality
- Updated the API endpoint to use the correct Gemini model (gemini-2.0-flash)
- Implemented the official @google/genai package for API integration
- Created and executed a test script that successfully interacts with the Gemini API
- Updated the Gemini client to use the streaming API for better response handling
- Added strict guardrails to system prompts to ensure the LLM stays focused on job posting tasks only
- Enhanced system prompts with clear guidelines and restrictions
- Updated the job posting workflow to collect email or phone when no application URL is available
- Added detailed workflow instructions to the system prompt
- Strengthened guardrails to strictly limit LLM to job posting tasks only
- Added explicit rejection responses for off-topic queries
- Implemented a strict two-task limitation (job description crafting and job link parsing only)
- Integrated RapidAPI Internships API for fetching Houston high school internships
- Created database migration to add source and career_site_url columns
- Developed script to fetch, filter, and store internships from RapidAPI
- Added npm scripts for running the migration and fetching internships
- Decided to use Supabase MCP server for all Supabase operations instead of direct API calls
- Created new script (fetchRapidApiInternshipsMCP.js) to use Supabase MCP server for storing RapidAPI internship results
- Added npm script (fetch:rapidapi:mcp) to run the new MCP-based script
- Investigated and documented the different job scraping/fetching mechanisms in `systemPatterns.md` and `techContext.md`.
- Updated `.env` with the new RapidAPI key.
- Manually ran the `fetchRapidApiInternshipsMCP.js` script (0 new Houston jobs fetched in the last run).
- Executed SQL to delete old RapidAPI jobs (older than 2 months) via Supabase MCP.
- Modified `scripts/fetchRapidApiInternshipsMCP.js` to filter for "Houston, TX, USA" and include deletion logic for old jobs.
- Created Netlify Scheduled Function `netlify/functions/fetch-daily-jobs.js` to automate daily job fetching from RapidAPI for Houston, TX, including deletion of old jobs and insertion of new ones (via simulated MCP calls in the function template).
- Configured `netlify.toml` to schedule the `fetch-daily-jobs` function daily at 8:00 AM UTC.
- Updated `scripts/fetchRapidApiInternshipsMCP.js` and `netlify/functions/fetch-daily-jobs.js` to use `location_filter: 'Houston'` and implement pagination with `offset` for fetching RapidAPI jobs, based on provided API documentation.
- Refactored `netlify/functions/fetch-daily-jobs.js` and `scripts/fetchRapidApiInternshipsMCP.js` to use `supabase-js` client directly for database interactions (deletions and upserts) instead of relying on MCP calls for these operations.
- Updated `systemPatterns.md` and `techContext.md` to reflect the Netlify scheduled function, updated RapidAPI fetching logic (including pagination), and direct `supabase-js` usage for database operations in this workflow.
- Updated `JobCard.tsx` to display a badge for jobs sourced from 'RapidAPI', then subsequently removed all source display from `JobCard.tsx` per user request.
- Refactored `JobDetailsPage.tsx` to correctly map Supabase data to the `Job` type (camelCase properties), use these in the JSX, and then removed the source display from this page as well per user request.
- Updated the `Job` type definition in `src/types/index.ts` to include 'RapidAPI' as a valid source and add the `careerSiteUrl?: string;` property (this type update remains relevant even if source isn't displayed).
- Ran `scripts/fetchRapidApiInternshipsMCP.js` with `location_filter: 'Houston'` as per user request; the script executed, but no new internships were added to the database (count remained at 20).
- Updated `SUPABASE_SERVICE_ROLE_KEY` in `.env` file with the value provided by the user.
- Re-ran `scripts/fetchRapidApiInternshipsMCP.js` with `location_filter: 'Houston'` and updated Supabase credentials; script initially failed to insert due to missing unique constraint for ON CONFLICT.
- Created and applied migration `20250516192600_add_unique_constraint_jobs_title_company_location.sql` to add a UNIQUE constraint on (title, company, location) in the `jobs` table.
- Successfully re-ran `scripts/fetchRapidApiInternshipsMCP.js` with `location_filter: 'Houston'`; 49 jobs were fetched and upserted. The total count of RapidAPI-sourced jobs is now 67.
- Updated `scripts/fetchRapidApiInternshipsMCP.js` and `netlify/functions/fetch-daily-jobs.js` to use `location_filter: 'Texas'` as the default, per user request for broader fetching.
- Further updated both scripts to make "high school" a mandatory term in `title_filter` and `description_filter` in conjunction with other student-related terms, while keeping `location_filter: 'Texas'`.
- Ran `scripts/fetchRapidApiInternshipsMCP.js` with the new 'Texas' and mandatory "high school" filters; 33 jobs were fetched and upserted, bringing the total RapidAPI job count to 85.
- Attempted to test PostJobPage chat via browser automation; user's typed messages do not appear in the chat interface. Added temporary console logs to `handleSendMessage` to investigate.
- Confirmed via browser test (no console logs appeared) that `handleSendMessage` likely isn't processing input due to `userInput` state not being updated by the `browser_action type` tool before the `click` action. Removed temporary console logs.
- Installed CopilotKit packages (`@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`) and `@google/generative-ai`.
- Created Netlify function `netlify/functions/copilotkit-runtime.js` with `GoogleGenerativeAIAdapter` and initial structure for `scrapeJobUrl` (Firecrawl) and `submitJobPosting` (Supabase) tools.
- Configured 60s timeout for `copilotkit-runtime` function in `netlify.toml`.
- Added CopilotKit styles to `src/main.tsx`.
- Wrapped `src/App.tsx` with `<CopilotKit runtimeUrl="/.netlify/functions/copilotkit-runtime">`.
- Rewrote `src/pages/PostJobPage.tsx` to use `<CopilotChat />` component and defined a detailed system prompt.
- Added `GEMINI_API_KEY` to `.env` file (copied from `VITE_GEMINI_API_KEY`).
- Added `FIRECRAWL_API_KEY` to `.env` file.
- Updated `scrapeJobUrl` tool in `netlify/functions/copilotkit-runtime.js` to make direct API calls to Firecrawl (`https://api.firecrawl.dev/v0/scrape`) using the API key, requesting markdown.

## Next Steps
- Implement secure `employer_id` handling in `submitJobPosting` tool (e.g., via properties from frontend).
- Verify and refine stream handling in Netlify function for `CopilotChat`.
- Test the new `PostJobPage` with CopilotKit integration, including tool usage.
- Debug PostJobPage chat interface to ensure user messages are correctly processed, displayed, and sent.
- Implement error handling for API failures.
- Add unit tests for the Gemini API integration.
- Test the guardrails to ensure they're effective.
- Ensure the job posting workflow correctly collects contact information.
- Finalize and test the `supabase-js` database calls within the Netlify function `fetch-daily-jobs.js`.
- Monitor the daily Netlify scheduled function for successful execution and job fetching for Texas.
- Clarify and potentially implement dynamic location filtering for RapidAPI fetches (e.g., specific user city in Texas > Houston fallback > Texas default).
- Review other parts of the application for consistency in Supabase interaction (MCP vs. direct `supabase-js`).

## Active Decisions
- Updated the route for FindJobsPage to /find-jobs to be more explicit.
- Updated the header link to point to /find-jobs instead of /jobs.
- Using Google Gemini API instead of OpenRouter for better performance and reliability.
- Using the official @google/genai package for API integration.
- Using the streaming API for better response handling.
- Using the gemini-2.0-flash model for optimal performance.
- Adding strict guardrails to system prompts to ensure the LLM stays focused on job posting tasks only.
- Collecting email or phone when no application URL is available.
- Implementing a strict two-task limitation (job description crafting and job link parsing only).
- Using GitHub repository at https://github.com/growthpods/sb1-6kejut.git for version control.
- The `location_filter` for RapidAPI Internships API in `scripts/fetchRapidApiInternshipsMCP.js` and `netlify/functions/fetch-daily-jobs.js` is set to 'Texas'.
- The `title_filter` is `'"high school" (intern OR internship OR "summer job")"` and `description_filter` is `'"high school" (student OR college OR intern)"` in both scripts to make "high school" a mandatory term.
- CopilotKit integration will use `gemini-2.0-flash`.
- Firecrawl tool in CopilotKit backend now attempts direct API calls.
- `employer_id` for job submissions via CopilotKit tool needs a secure passing mechanism from frontend context.
- User has requested a more dynamic location filtering logic: specific user city in Texas (if known) > 'Houston' (as a fallback if specific city not applicable/found) > 'Texas' (general default). This needs further clarification for script implementation.
- Storing API-sourced jobs with `source='RapidAPI'` to distinguish from manually posted jobs.
- Implementing a data retention policy: delete RapidAPI-sourced jobs older than 2 months.
- Adding `career_site_url` field to store company career site URLs from RapidAPI (type updated, UI display removed).
- Using `supabase-js` client directly within the Netlify Scheduled Function (`fetch-daily-jobs.js`) and its corresponding local script (`scripts/fetchRapidApiInternshipsMCP.js`) for database operations, instead of MCP for this specific workflow. Other Supabase interactions in the project may still use MCP as per prior decisions.
- Decided not to display job source information on the frontend (`JobCard.tsx`, `JobDetailsPage.tsx`).
