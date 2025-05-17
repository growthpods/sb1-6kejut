# Technical Context

This file documents the technologies used, development setup, technical constraints, and dependencies.

## Technologies Used

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- Lucide React for icons

### Backend
- Supabase for authentication, database, and storage (via MCP server)
- PostgreSQL database (via Supabase MCP server)

### APIs
- Google Gemini API for AI-powered job posting assistance
- Firecrawl for web scraping job listings
- RapidAPI Internships API for fetching internship listings

### Deployment
- Netlify for frontend hosting and scheduled serverless functions (Netlify Functions).
- Supabase for backend services (database, auth, storage).

## Development Setup
- Node.js and npm for package management
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Vite for development server and building

## Technical Constraints
- Supabase RLS (Row Level Security) for data access control
- Browser compatibility (modern browsers only)
- Mobile responsiveness requirements
- API rate limits (especially for Google Gemini API)

## Dependencies
- React and React DOM
- React Router
- TailwindCSS
- Lucide React
- Supabase JS client
- @google/genai for Google Gemini API integration
- dotenv for environment variable management
- mime for content type handling
- @copilotkit/react-core
- @copilotkit/react-ui
- @copilotkit/runtime
- @google/generative-ai (for CopilotKit's GoogleGenerativeAIAdapter)

## API Integration Details

### Google Gemini API
- Official package: @google/genai
- API endpoint: https://generativelanguage.googleapis.com/v1beta
- Model: gemini-2.0-flash
- Authentication: API key
- Request format: JSON with contents array containing parts with text
- Response format: Streaming API with text chunks
- Rate limits: Standard Google API rate limits apply
- System prompts with strict guardrails to ensure the LLM stays focused on job posting tasks only

### Firecrawl API (via MCP Server)
- **Mechanism:** Used for scraping job listings from employer-provided URLs.
- **Process:**
    - The `FirecrawlService` (`src/lib/firecrawl.ts`) initiates a request to a Firecrawl MCP server (`github.com/mendableai/firecrawl-mcp-server`).
    - The MCP server scrapes the target URL and returns its content, typically as markdown.
    - This raw scraped content is then processed by the Google Gemini LLM (via `JobPostingService`) to extract structured job details.
- **Role:** Provides the initial raw content from web pages, which is then intelligently parsed by an LLM.
- **Usage:** Integrated into the "Post a Job" feature when an employer provides a URL.

### RapidAPI Internships API
- **Usage:** Automated daily fetching of internship listings.
- **Mechanism:** A Netlify Scheduled Function (`netlify/functions/fetch-daily-jobs.js`) executes daily at 8:00 AM UTC.
- **API Endpoint:** `https://internships-api.p.rapidapi.com/active-jb-7d`
- **Authentication:** API key via RapidAPI (stored in environment variables).
- **Process:**
    - The Netlify Function first triggers a deletion of jobs older than 2 months from the Supabase database (where `source = 'RapidAPI'`) using the `supabase-js` client library.
    - It then queries the RapidAPI using `location_filter: 'Texas'`. The `title_filter` is `'"high school" (intern OR internship OR "summer job")"'` and `description_filter` is `'"high school" (student OR college OR intern)"'` to make "high school" a mandatory term. Pagination is implemented using the `offset` parameter. (User has also requested a dynamic logic: specific user city in TX > Houston fallback > Texas default, which is a future consideration for implementation).
    - Fetched data is filtered again for student-friendliness.
    - Data is mapped to the internal schema and inserted/updated in the Supabase `jobs` table using the `supabase-js` client library's `upsert` method with `onConflict` and `ignoreDuplicates: true`.
- **Source Tracking:** Jobs are stored with `source='RapidAPI'`.
- **Note:** The `scripts/fetchRapidApiInternshipsMCP.js` script (which now also uses `supabase-js` directly) provides the foundational logic for this Netlify function and can be used for manual data fetches.

## LLM Guardrails Implementation
- System prompts with clear role definition
- Strict guidelines for staying on topic
- Explicit instructions to avoid non-job-related topics
- Specific formatting requirements for responses
- Context about the platform's purpose and audience
- Separate system prompts for different functions:
  - Job posting chat interface
  - Job data extraction
  - Job data updates extraction
- Explicit rejection responses for off-topic queries
- Strict two-task limitation (job description crafting and job link parsing only)
- Standardized rejection message for off-topic queries

### CopilotKit (with Google Gemini for PostJobPage)
- **Packages:** `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`, `@google/generative-ai`.
- **Frontend:**
    - `src/App.tsx` is wrapped with `<CopilotKit runtimeUrl="/.netlify/functions/copilotkit-runtime" properties={{ userId: user?.id }}>` to pass authenticated user ID.
    - `src/pages/PostJobPage.tsx` uses the `<CopilotChat />` component for its UI.
    - System prompt for job posting is passed via the `instructions` prop to `<CopilotChat />`.
- **Backend (Netlify Function: `netlify/functions/copilotkit-runtime.js`):**
    - Implements the CopilotKit runtime using `CopilotRuntime` (configured with actions and `GoogleGenerativeAIAdapter`) and the `copilotRuntimeNodeHttpEndpoint` helper.
    - Adapts Netlify's `event` object to a Node.js `IncomingMessage`-like object (`mockReq`).
    - The mock Node.js `ServerResponse` object (`mockRes`) is an instance of `PassThrough` stream, with added properties/methods for status/header capture, to better integrate with `copilotRuntimeNodeHttpEndpoint` and Netlify's streaming response capabilities.
    - Uses `GoogleGenerativeAIAdapter` with the `gemini-2.0-flash` model, configured with `GEMINI_API_KEY` environment variable.
    - Function timeout set to 60 seconds in `netlify.toml`.
    - **Tools Planned/Implemented:**
        - `scrapeJobUrl` (Firecrawl): Updated to make direct POST API calls to Firecrawl (`https://api.firecrawl.dev/v1/scrape`) using `axios` and `FIRECRAWL_API_KEY`. Payload `{ url, formats: ["markdown"], pageOptions: { onlyMainContent: true } }` is used to request markdown.
        - `submitJobPosting` (Supabase): Logic to insert job data into Supabase. Uses `userId` passed from frontend via `properties` as `employer_id`.
- **Styling:** CopilotKit default styles imported in `src/main.tsx`.

## Job Posting Workflow Implementation
- Conversational interface for job data collection
- Web scraping integration (Firecrawl + Gemini LLM) for existing job postings from URLs
- Direct text input processing by Gemini LLM for job descriptions
- Structured data extraction from job descriptions
- Contact information collection (email/phone) when no application URL is available
- Data validation before submission
- Database storage for job postings
- Confirmation step before finalizing
- Redirection mechanism for off-topic queries

## Version Control
- GitHub repository: https://github.com/growthpods/sb1-6kejut.git
- Main branch for production code
- Git for version control

## Additional Data Sourcing Methods

### File-Based Markdown Parsing (Alternative/Legacy)
- **Mechanism:** A script (`scripts/scrapeJobs.ts`) processes a locally stored markdown file (`temp_scraped_markdown.md`).
- **Process:**
    - Assumes an external (unspecified) process scrapes a job site (e.g., Indeed) and saves the output to `temp_scraped_markdown.md`.
    - The script then uses custom regex and string manipulation (`parseIndeedMarkdown` function) to parse this file.
    - Data is inserted directly into Supabase (not via MCP).
- **Role:** Provides a way to batch-import jobs if they are pre-scraped into a specific markdown format. Less flexible than API/LLM-based methods.
