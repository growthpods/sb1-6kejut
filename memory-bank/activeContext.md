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
- Testing and refining the RapidAPI Internships integration
- Setting up automated scheduling for the weekly internship fetch job
- Updating all Supabase operations to use the MCP server instead of direct API calls

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

## Next Steps
- Debug the chat interface to properly display responses from the Gemini API
- Implement error handling for API failures
- Add unit tests for the Gemini API integration
- Test the guardrails to ensure they're effective
- Ensure the job posting workflow correctly collects contact information
- Update all Supabase operations to use the MCP server instead of direct API calls
- Test the RapidAPI Internships integration with real API calls
- Set up automated scheduling for the weekly internship fetch job
- Monitor and refine the filtering logic for Houston high school internships
- Update the UI to display the source of job listings

## Active Decisions
- Updated the route for FindJobsPage to /find-jobs to be more explicit
- Updated the header link to point to /find-jobs instead of /jobs
- Using Google Gemini API instead of OpenRouter for better performance and reliability
- Using the official @google/genai package for API integration
- Using the streaming API for better response handling
- Using the gemini-2.0-flash model for optimal performance
- Adding strict guardrails to system prompts to ensure the LLM stays focused on job posting tasks only
- Collecting email or phone when no application URL is available
- Implementing a strict two-task limitation (job description crafting and job link parsing only)
- Using GitHub repository at https://github.com/growthpods/sb1-6kejut.git for version control
- Using RapidAPI Internships API to fetch Houston high school internships
- Storing API-sourced jobs with source='RapidAPI' to distinguish from manually posted jobs
- Implementing weekly scheduled job for fetching internships instead of real-time API calls
- Adding career_site_url field to store company career site URLs from RapidAPI
- Using Supabase MCP server for all Supabase operations instead of direct API calls
