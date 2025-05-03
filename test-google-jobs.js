/**
 * Test script for Google Jobs API integration
 * 
 * This script tests the Google Jobs API integration by listing and searching for jobs.
 * It can be used to verify that the Google Jobs API is configured correctly.
 */

import dotenv from 'dotenv';
import { getGoogleJobsService } from './src/lib/googleJobs.js';

// Load environment variables
dotenv.config();

// Test Google Jobs API
async function testGoogleJobs() {
  try {
    console.log('Testing Google Jobs API integration...');
    
    // Get Google Jobs service
    const googleJobsService = getGoogleJobsService();
    
    // Test listing jobs
    console.log('\n--- Testing listJobs ---');
    const listResult = await googleJobsService.listJobs({ pageSize: 5 });
    console.log(`Found ${listResult.jobs.length} jobs`);
    console.log('First job:', JSON.stringify(listResult.jobs[0], null, 2));
    
    // Test searching jobs
    console.log('\n--- Testing searchJobs ---');
    const searchResult = await googleJobsService.searchJobs('internship', { 
      location: 'Houston, TX',
      pageSize: 5 
    });
    console.log(`Found ${searchResult.jobs.length} jobs matching 'internship' in Houston, TX`);
    if (searchResult.jobs.length > 0) {
      console.log('First search result:', JSON.stringify(searchResult.jobs[0], null, 2));
    }
    
    console.log('\nGoogle Jobs API integration test completed successfully');
  } catch (error) {
    console.error('Error testing Google Jobs API:', error);
  }
}

// Run the test
testGoogleJobs();
