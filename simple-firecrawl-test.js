/**
 * Simple test script for the Firecrawl service
 */
require('dotenv').config();
console.log('Starting simple Firecrawl test...');

// Mock the import.meta.env for Vite compatibility
global.import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };

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

// Import the Firecrawl service
const { getFirecrawlService } = require('./src/lib/firecrawl');

async function testFirecrawlDirectly() {
  try {
    console.log('Testing Firecrawl service directly...');
    
    // Get the Firecrawl service
    console.log('Getting Firecrawl service...');
    const firecrawl = getFirecrawlService();
    console.log('Firecrawl service obtained successfully');
    
    // Test scraping a job listing
    console.log('Scraping a test URL...');
    const testUrl = 'https://example.com/job';
    
    try {
      const scrapedData = await firecrawl.scrapeJobListing(testUrl);
      
      console.log('Scraped data:');
      console.log(JSON.stringify(scrapedData, null, 2));
      
      console.log('✅ Firecrawl test successful');
    } catch (scrapeError) {
      console.error('Error during scraping:', scrapeError);
      console.error('Error details:', JSON.stringify(scrapeError, null, 2));
      throw scrapeError;
    }
  } catch (error) {
    console.error('❌ Firecrawl test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testFirecrawlDirectly().catch(error => {
  console.error('Unexpected error:', error);
});
