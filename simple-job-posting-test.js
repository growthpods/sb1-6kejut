/**
 * Simple test script for the job posting service
 */
require('dotenv').config();
console.log('Starting simple job posting service test...');

// Log environment variables
console.log('Environment variables:');
console.log('VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? 'Set (length: ' + process.env.VITE_GEMINI_API_KEY.length + ')' : 'Not set');
console.log('VITE_OPENROUTER_API_KEY:', process.env.VITE_OPENROUTER_API_KEY ? 'Set (length: ' + process.env.VITE_OPENROUTER_API_KEY.length + ')' : 'Not set');

// Mock the import.meta.env for Vite compatibility
global.import = { 
  meta: { 
    env: { 
      VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
      VITE_OPENROUTER_API_KEY: process.env.VITE_OPENROUTER_API_KEY
    } 
  } 
};

// Mock the window.mcpRequest function for testing
global.window = {
  mcpRequest: async (params) => {
    console.log('Mock MCP request called with params:', params);
    return `# Mock Scraped Content

This is mock content that would be returned by the Firecrawl MCP server.

## Job Details

- Title: Software Engineer
- Company: Example Corp
- Location: San Francisco, CA
- Type: Full-Time
- Level: Entry Level

## Description

This is a mock job description for testing purposes.

## Requirements

- JavaScript
- React
- Node.js
`;
  }
};

// Create a mock for the GoogleGenAI module
const mockGeminiResponse = JSON.stringify({
  title: "Software Engineer",
  company: "Example Corp",
  location: "San Francisco, CA",
  description: "This is a mock job description for testing purposes.",
  requirements: ["JavaScript", "React", "Node.js"],
  type: "Full-Time",
  level: "Entry Level",
  timeCommitment: "Summer",
  applicationUrl: "https://example.com/apply",
  confidence: 90,
  missingFields: []
});

// Override the require function to return our mock for @google/genai
const originalRequire = require;
require = function(modulePath) {
  if (modulePath === '@google/genai') {
    console.log('Mocking @google/genai module');
    return {
      GoogleGenAI: class MockGoogleGenAI {
        constructor(options) {
          console.log('MockGoogleGenAI constructor called with options:', options);
        }
        
        getGenerativeModel(options) {
          console.log('getGenerativeModel called with options:', options);
          return {
            generateContent: async (prompt) => {
              console.log('generateContent called with prompt:', prompt);
              return {
                response: {
                  text: () => mockGeminiResponse
                }
              };
            },
            generateContentStream: async (options) => {
              console.log('generateContentStream called with options:', options);
              return {
                [Symbol.asyncIterator]: async function* () {
                  yield { text: mockGeminiResponse };
                }
              };
            }
          };
        }
      }
    };
  }
  return originalRequire(modulePath);
};

// Import the job posting service
const { getJobPostingService } = require('./src/lib/jobPostingService');

async function testJobPostingService() {
  try {
    console.log('Testing job posting service...');
    
    // Get the job posting service
    console.log('Getting job posting service...');
    const jobPostingService = getJobPostingService();
    console.log('Job posting service obtained successfully');
    
    // Test processing a job description
    console.log('Processing a test job description...');
    const testDescription = `
      Software Engineer Internship at TechCorp
      Location: San Francisco, CA
      
      About the Role:
      We're looking for a talented Software Engineering Intern to join our team for the summer. This is a great opportunity for a high school student interested in computer science to gain real-world experience.
      
      Responsibilities:
      - Assist in developing and maintaining web applications
      - Write clean, maintainable code
      - Collaborate with senior engineers on projects
      - Debug issues and implement fixes
      
      Requirements:
      - Currently enrolled in high school
      - Basic knowledge of programming (JavaScript, Python, or similar)
      - Eager to learn and grow
      - Available to work 20 hours per week during summer
      
      This is a paid internship with flexible hours during the summer break.
    `;
    
    try {
      const result = await jobPostingService.processJobDescription(testDescription);
      
      console.log('Processed job data:');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('✅ Job posting service test successful');
    } catch (processError) {
      console.error('Error during job description processing:', processError);
      console.error('Error details:', JSON.stringify(processError, null, 2));
      throw processError;
    }
  } catch (error) {
    console.error('❌ Job posting service test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testJobPostingService().catch(error => {
  console.error('Unexpected error:', error);
});
