# Active Context

This file tracks the current work focus. Please update with recent changes, next steps, and active decisions.

## Current Focus
- Implementing the job posting page with AI assistance
- Integrating Google Gemini API for LLM capabilities
- Developing the chat interface for job posting
- Adding guardrails to ensure the LLM stays focused on job posting tasks

## Recent Changes
- Replaced OpenRouter API with Google Gemini API for job posting functionality
- Updated the API endpoint to use the correct Gemini model (gemini-2.0-flash)
- Implemented the official @google/genai package for API integration
- Created and executed a test script that successfully interacts with the Gemini API
- Updated the Gemini client to use the streaming API for better response handling
- Added strict guardrails to system prompts to ensure the LLM stays focused on job posting tasks
- Enhanced system prompts with clear guidelines and restrictions

## Next Steps
- Debug the chat interface to properly display responses from the Gemini API
- Add more detailed logging to track the request/response flow
- Implement error handling for API failures
- Add unit tests for the Gemini API integration
- Test the guardrails to ensure they're effective

## Active Decisions
- Using Google Gemini API instead of OpenRouter for better performance and reliability
- Using the official @google/genai package for API integration
- Using the streaming API for better response handling
- Using the gemini-2.0-flash model for optimal performance
- Adding strict guardrails to system prompts to ensure the LLM stays focused on job posting tasks
