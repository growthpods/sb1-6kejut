# System Patterns

This file documents the system architecture, key technical decisions, design patterns in use, and component relationships.

## System Architecture

### Frontend Architecture
- React component-based architecture
- Context API for state management
- Custom hooks for reusable logic
- Page-based routing with React Router

### Backend Architecture
- Supabase for authentication, database, and storage (via MCP server)
- PostgreSQL database with RLS (Row Level Security) (via Supabase MCP server)
- Serverless functions for backend logic

### AI Integration Architecture
- Client-side API integration with Google Gemini
- Service-based pattern for AI functionality
- Asynchronous communication with AI services
- Streaming API for real-time response handling
- Stateful chat interface for job posting
- Guardrails system for LLM behavior control
- Workflow-driven conversation management
- Task-specific system prompts

## Key Technical Decisions

### Frontend Framework
- React with TypeScript for type safety and better developer experience
- Vite for faster development and building
- TailwindCSS for utility-first styling

### Backend Services
- Supabase for authentication, database, and storage (via MCP server)
- PostgreSQL for relational data storage (via Supabase MCP server)
- RLS for data access control

### AI Integration
- Google Gemini API for AI-powered job posting assistance
- Official @google/genai package for API integration
- Streaming API for better user experience
- Direct API integration without server-side proxy
- System prompts with strict guardrails to ensure the LLM stays focused on job posting tasks only
- Workflow-driven conversation to collect all required information
- Strict two-task limitation (job description crafting and job link parsing only)

## Design Patterns in Use

### Frontend Patterns
- Component Composition for UI building blocks
- Container/Presentational pattern for separation of concerns
- Custom Hooks for reusable logic
- Context API for state management
- Render Props for component sharing

### Backend Patterns
- Repository pattern for data access
- Service pattern for business logic
- Middleware pattern for request/response handling

### AI Integration Patterns
- Service pattern for AI functionality
- Adapter pattern for API integration
- Strategy pattern for different AI models
- Observer pattern for chat state management
- Streaming pattern for real-time data processing
- Guardrails pattern for LLM behavior control
- Workflow pattern for conversation management
- Task-specific system prompts pattern

## CopilotKit Integration Architecture (New for PostJobPage)
- **Frontend:**
    - `CopilotKit` provider wraps the application (`src/App.tsx`) and receives `properties={{ userId: user?.id }}` to pass authenticated user ID to the backend.
    - `CopilotChat` component (`@copilotkit/react-ui`) replaces the custom chat UI in `PostJobPage.tsx`.
    - System prompt for job posting is configured via `CopilotChat`'s `instructions` prop.
- **Backend (Netlify Function - `copilotkit-runtime.js`):**
    - Uses `CopilotRuntime` (configured with actions and `GoogleGenerativeAIAdapter`) and the `copilotRuntimeNodeHttpEndpoint` helper from `@copilotkit/runtime` to process chat requests.
    - Adapts Netlify's `event` object to a Node.js `IncomingMessage`-like object (`mockReq`).
    - Uses a `PassThrough` stream to create a Node.js `ServerResponse`-like object (`mockRes`) that captures the output from the CopilotKit handler and streams it back in the Netlify function's response.
    - Employs `GoogleGenerativeAIAdapter` to connect to Google Gemini (model `gemini-2.0-flash`).
    - Exposes an HTTP endpoint (`/.netlify/functions/copilotkit-runtime`) for the frontend `CopilotChat`.
    - Configured with a 60-second timeout in `netlify.toml`.
    - **Tools/Actions (defined within `CopilotRuntime`):**
        - `scrapeJobUrl`: Uses `axios` to make a direct POST API call to Firecrawl (`https://api.firecrawl.dev/v1/scrape`) using `FIRECRAWL_API_KEY`. The payload is `{ url, formats: ["markdown"], pageOptions: { onlyMainContent: true } }` to request markdown content.
        - `submitJobPosting`: Saves finalized job data to Supabase. Uses `userId` passed from frontend via `properties` (available to the actions generator) as `employer_id`.

## Component Relationships

### Frontend Components
- App (root component)
  - Header (navigation)
  - Pages (content)
    - HomePage
    - FindJobsPage
    - JobDetailsPage
    - PostJobPage (AI-powered)
    - FindTalentPage
    - DashboardPage
  - Footer (site information)

### AI Integration Components
- JobPostingService (service for job posting)
  - GeminiClient (API client for Google Gemini)
  - FirecrawlService (service for web scraping)
- PostJobPage (UI component for job posting)
  - Chat interface for job posting
  - Job data collection and submission

## LLM Guardrails Architecture
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

## Job Posting Workflow
- Help employers compose a complete job description through conversation
- Parse information from existing job posting links
- Collect all required information through conversation
- Collect email or phone when no application URL is available
- Ensure there's a way for students to apply (applicationUrl, email, or phone)
- Summarize collected information and ask for confirmation
- Store job posting data in the database
- Redirect off-topic queries back to job posting tasks

## External Job Data Integration & Scraping

This section outlines the different methods used to source job data from external platforms.

### 1. Automated Daily Job Fetching (RapidAPI Internships via Netlify Scheduled Function)
- **Source:** RapidAPI Internships API (`https://internships-api.p.rapidapi.com/active-jb-7d`).
- **Automation:** A Netlify Scheduled Function (`netlify/functions/fetch-daily-jobs.js`) runs daily at 8:00 AM UTC (targets 2 AM CST).
- **Process within the Netlify Function:**
    - **Data Retention:** Deletes jobs from the Supabase database where `source = 'RapidAPI'` and `posted_at` is older than 2 months. This is done using the `supabase-js` client library directly within the function.
    - **Fetching:** Queries the RapidAPI using `axios`. It uses `location_filter: 'Texas'`. The `title_filter` is `'"high school" (intern OR internship OR "summer job")"'` and `description_filter` is `'"high school" (student OR college OR intern)"'` to make "high school" a mandatory term along with other student-centric terms. Pagination is implemented using the `offset` parameter. (User has also requested a dynamic logic: specific user city in TX > Houston fallback > Texas default, which is a future consideration for implementation).
    - **Filtering:** Performs additional client-side filtering for student-friendliness (though the API filters are now more targeted).
    - **Mapping:** Maps the fetched data to the internal database schema.
    - **Insertion:** Inserts new/updated jobs into the Supabase database using the `supabase-js` client library's `upsert` method with `onConflict` and `ignoreDuplicates: true` to handle duplicates based on title, company, and location.
- **Key Characteristics:** Automated, scheduled daily, targets a specific location (Houston, TX), includes data retention, and uses Netlify Functions for serverless execution with direct Supabase interaction via `supabase-js`. The `scripts/fetchRapidApiInternshipsMCP.js` script (now also using `supabase-js` directly) serves as the basis for this function's logic and can be used for manual runs.

### 2. URL Scraping with Firecrawl & AI Analysis (Job Posting Feature)
- **Source:** Employer-provided URLs to existing job postings.
- **Process:**
    - Managed by `JobPostingService` (`src/lib/jobPostingService.ts`) and `FirecrawlService` (`src/lib/firecrawl.ts`).
    - `FirecrawlService` calls a Firecrawl MCP server (`github.com/mendableai/firecrawl-mcp-server`) to scrape the content of the provided URL.
    - The scraped content (markdown) is then passed to the Google Gemini LLM by `JobPostingService` for analysis, structuring, and extraction of job details.
- **Key Characteristics:** Dynamic scraping of individual URLs, followed by LLM-based data extraction and structuring.

### 3. File-Based Markdown Parsing (Alternative/Legacy Workflow)
- **Source:** An external, unspecified process scrapes job sites (e.g., Indeed) and saves the raw HTML/markdown content to a temporary local file (`temp_scraped_markdown.md`).
- **Process:**
    - The `scripts/scrapeJobs.ts` script reads this local markdown file.
    - It uses a custom parser (`parseIndeedMarkdown`) with string manipulation and regular expressions to extract job details. This parser is tailored to the expected format of the markdown (e.g., from Indeed).
    - The extracted data is then inserted directly into the Supabase database using the Supabase client (not via MCP).
    - The temporary markdown file is deleted after processing.
- **Key Characteristics:** Relies on an external scraping step to produce a local file, then uses custom parsing logic. Less flexible than AI-based parsing.

### General Considerations for Sourced Jobs
- **Source Tracking:** Jobs sourced externally (e.g., via RapidAPI) are marked with a `source` field in the database (e.g., `source: 'RapidAPI'`).
- **Duplicate Detection:** Mechanisms are in place or intended (e.g., `onConflict` in Supabase upserts for `scripts/scrapeJobs.ts`, or planned checks for RapidAPI script) to avoid re-adding existing internships.
- **Data Mapping:** All externally sourced data is mapped to the internal `jobs` table schema.
- **Time Commitment Detection:** Logic exists in some scripts (e.g., `fetchRapidApiInternshipsMCP.js`) to infer time commitment (Evening, Weekend, Summer) based on job titles and descriptions.
