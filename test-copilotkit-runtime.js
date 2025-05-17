// Simple test script for the CopilotKit runtime function
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testCopilotKitRuntime() {
  console.log('Testing CopilotKit runtime function...');
  
  try {
    // Test a simple message to the CopilotKit runtime
    const response = await axios.post('http://localhost:8888/.netlify/functions/copilotkit-runtime', {
      messages: [
        {
          role: 'user',
          content: 'I want to post a job for a Software Engineering Intern at ABC Company in Houston, TX.'
        }
      ],
      properties: {
        userId: process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000'
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.data) {
      if (typeof response.data === 'string') {
        console.log('Response data (first 200 chars):', response.data.substring(0, 200) + '...');
      } else {
        console.log('Response data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
      }
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing CopilotKit runtime:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Test the scrapeJobUrl tool
async function testScrapeJobUrl() {
  console.log('\nTesting scrapeJobUrl tool...');
  
  try {
    const response = await axios.post('http://localhost:8888/.netlify/functions/copilotkit-runtime', {
      messages: [
        {
          role: 'user',
          content: 'Can you analyze this job posting: https://www.indeed.com/viewjob?jk=12345'
        }
      ],
      properties: {
        userId: process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000'
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data (first 200 chars):', 
      typeof response.data === 'string' 
        ? response.data.substring(0, 200) + '...'
        : JSON.stringify(response.data, null, 2).substring(0, 200) + '...'
    );
  } catch (error) {
    console.error('Error testing scrapeJobUrl:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the tests
async function runTests() {
  await testCopilotKitRuntime();
  await testScrapeJobUrl();
}

runTests();
