/**
 * Test runner script to run all test scripts for the job posting functionality
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Check if the Gemini API key is available
const geminiApiKey = process.env.VITE_GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('Error: VITE_GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

// List of test scripts to run
const testScripts = [
  'test-gemini-chat.js',
  'test-firecrawl-scraping.js',
  'test-job-posting-workflow.js'
];

// Function to run a test script
function runTest(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Running test script: ${scriptPath}`);
    console.log(`${'='.repeat(80)}\n`);
    
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Test script ${scriptPath} completed successfully`);
        resolve();
      } else {
        console.error(`\n❌ Test script ${scriptPath} failed with code ${code}`);
        resolve(); // Still resolve to continue with other tests
      }
    });
    
    child.on('error', (error) => {
      console.error(`\n❌ Failed to run test script ${scriptPath}:`, error);
      resolve(); // Still resolve to continue with other tests
    });
  });
}

// Run all test scripts sequentially
async function runAllTests() {
  console.log('Starting all tests...\n');
  
  // Check if API keys are available
  if (!process.env.VITE_GEMINI_API_KEY) {
    console.warn('⚠️ Warning: VITE_GEMINI_API_KEY is not set in .env file. Some tests may fail.');
  }
  
  // Run each test script
  for (const script of testScripts) {
    await runTest(script);
  }
  
  console.log('\nAll test scripts completed.');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
