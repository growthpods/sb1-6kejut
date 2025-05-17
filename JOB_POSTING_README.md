# Job Posting Page Documentation

This document provides information about the job posting page implementation using CopilotKit and Google Gemini.

## Overview

The job posting page allows employers to create job listings with AI assistance. It uses:

- **CopilotKit**: For the chat interface and tools integration
- **Google Gemini**: As the LLM backend (model: gemini-2.0-flash)
- **Firecrawl**: For scraping job posting URLs
- **Supabase**: For storing job data

## Key Files

- `src/pages/PostJobPage.tsx`: The React component for the job posting page
- `netlify/functions/copilotkit-runtime.js`: The Netlify function that handles CopilotKit requests
- `src/App.tsx`: Contains the CopilotKit provider setup
- `test-copilotkit-runtime.js`: Test script for the CopilotKit runtime

## Features

1. **AI-Assisted Job Posting**: Guides employers through creating a complete job listing
2. **URL Scraping**: Can extract job details from existing job posting URLs
3. **Email Verification**: Collects employer email for verification within the chat flow
4. **Structured Data Collection**: Ensures all required fields are collected
5. **Database Integration**: Saves job postings to Supabase

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Navigate to `/post-job` to access the job posting page

## Testing

### Testing the CopilotKit Runtime

Run the test script to verify the CopilotKit runtime function:

```
npm run test:copilotkit
```

This script tests:
- Basic message handling
- The scrapeJobUrl tool

### Manual Testing

1. **Email Collection**: Verify that the chat asks for email verification before posting
2. **Chat Interface**: Test the chat interface with various inputs:
   - Simple job descriptions
   - URLs to existing job postings
   - Incomplete information to test follow-up questions
3. **Job Submission**: Complete the job posting process and verify the job is saved to the database

## Environment Variables

The following environment variables are required:

- `GEMINI_API_KEY`: Google Gemini API key
- `FIRECRAWL_API_KEY`: Firecrawl API key
- `SUPABASE_URL`: Supabase URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations)

## Troubleshooting

### Common Issues

1. **Stream Handling**: If the chat interface doesn't display responses, check the Netlify function logs for stream handling issues.

2. **Firecrawl API**: If URL scraping fails, verify:
   - The FIRECRAWL_API_KEY is set correctly
   - The response format handling in the scrapeJobUrl tool

3. **Authentication**: If user authentication isn't working:
   - Check that the CopilotKit provider in App.tsx is correctly passing the user ID
   - Verify the user ID is being received in the Netlify function

### Debugging

- Use the browser console to check for frontend errors
- Check the Netlify function logs for backend errors
- Run the test script to isolate issues with the CopilotKit runtime

## Future Improvements

1. Add more robust error handling in the Netlify function
2. Implement unit tests for the CopilotKit integration
3. Add analytics for job posting performance
4. Enhance the job posting workflow with more AI-powered features
5. Add email notifications for job applications
