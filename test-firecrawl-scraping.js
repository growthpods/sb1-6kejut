/**
 * Test script for the Firecrawl web scraping functionality in the job posting chat window
 * This script tests the ability to scrape job listings from URLs
 */
require('dotenv').config();

// Mock the import.meta.env for Vite compatibility
global.import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };

const { getFirecrawlService } = require('./src/lib/firecrawl');
const { getJobPostingService } = require('./src/lib/jobPostingService');

// Sample job URLs for testing
const sampleJobUrls = [
  {
    name: "Indeed Software Engineer Internship",
    url: "https://www.indeed.com/viewjob?jk=c7c980a277cc5cb5"
  },
  {
    name: "LinkedIn Summer Internship",
    url: "https://www.linkedin.com/jobs/view/3580192246"
  },
  {
    name: "GitHub Jobs Page",
    url: "https://github.com/about/careers"
  }
];

// Test the Firecrawl service directly
async function testFirecrawlService() {
  console.log('Testing Firecrawl service...');
  
  try {
    const firecrawl = getFirecrawlService();
    
    // Test a simple scrape of a public website
    const testUrl = "https://example.com";
    console.log(`Scraping test URL: ${testUrl}`);
    
    const scrapedData = await firecrawl.scrapeJobListing(testUrl);
    
    console.log('Scraped data:');
    console.log(JSON.stringify(scrapedData, null, 2).substring(0, 300) + '...');
    console.log('✅ Firecrawl service test successful');
  } catch (error) {
    console.error('❌ Firecrawl service test failed:', error);
  }
}

// Test the job posting service's ability to process job URLs
async function testJobUrlProcessing() {
  console.log('\nTesting job URL processing...');
  
  try {
    const jobPostingService = getJobPostingService();
    
    for (const sample of sampleJobUrls) {
      console.log(`\nProcessing sample job URL: ${sample.name} (${sample.url})`);
      
      try {
        const result = await jobPostingService.processJobUrl(sample.url);
        
        console.log('Extracted job data:');
        console.log(JSON.stringify({
          title: result.title,
          company: result.company,
          location: result.location,
          type: result.type,
          level: result.level,
          timeCommitment: result.timeCommitment,
          applicationUrl: result.applicationUrl,
          confidence: result.confidence
        }, null, 2));
        
        // Validate the results
        const validTitle = result.title && result.title.length > 0;
        const validCompany = result.company && result.company.length > 0;
        
        if (validTitle && validCompany) {
          console.log(`✅ Successfully extracted data from "${sample.name}"`);
        } else {
          console.log(`❌ Failed to extract complete data from "${sample.name}"`);
        }
      } catch (error) {
        console.error(`❌ Failed to process URL ${sample.url}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Job URL processing test failed:', error);
  }
}

// Test the URL validation and error handling
async function testUrlValidationAndErrorHandling() {
  console.log('\nTesting URL validation and error handling...');
  
  try {
    const jobPostingService = getJobPostingService();
    
    // Test with invalid URLs
    const invalidUrls = [
      "not-a-url",
      "http://nonexistentwebsite12345.com",
      "https://example.com/nonexistent-page"
    ];
    
    for (const url of invalidUrls) {
      console.log(`Testing invalid URL: ${url}`);
      
      try {
        await jobPostingService.processJobUrl(url);
        console.log(`❌ Expected error for invalid URL ${url}, but none was thrown`);
      } catch (error) {
        console.log(`✅ Correctly handled error for invalid URL ${url}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ URL validation test failed:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Firecrawl web scraping tests...\n');
  
  await testFirecrawlService();
  await testJobUrlProcessing();
  await testUrlValidationAndErrorHandling();
  
  console.log('\nAll tests completed.');
}

runTests();
