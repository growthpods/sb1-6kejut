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
- Netlify for frontend hosting
- Supabase for backend services

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

### Firecrawl API
- Used for scraping job listings from external websites
- Provides structured data extraction from web pages
- Used in the job posting workflow to extract job details from URLs

### RapidAPI Internships API
- Used for fetching internship listings from external sources
- API endpoint: https://internships-api.p.rapidapi.com/active-jb-7d
- Authentication: API key via RapidAPI
- Weekly scheduled job to fetch and store internships
- Filters for Houston, TX and high school internships
- Stores internship data in the jobs table with source='RapidAPI'

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

## Job Posting Workflow Implementation
- Conversational interface for job data collection
- Web scraping integration for existing job postings
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
