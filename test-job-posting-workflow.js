/**
 * End-to-end test script for the job posting workflow
 * This script simulates the entire process from entering a job description/URL to submitting to the database
 */
require('dotenv').config();

// Mock the import.meta.env for Vite compatibility
global.import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };

const { getJobPostingService } = require('./src/lib/jobPostingService');
const { supabase } = require('./src/lib/supabase');

// Sample job data for testing
const sampleJobData = {
  description: `
    Summer Internship - Web Developer
    TechStart Inc. - San Francisco, CA
    
    About the Role:
    TechStart is looking for a motivated high school student to join our web development team for a summer internship. This is a great opportunity to gain real-world experience in a fast-paced tech environment.
    
    Responsibilities:
    - Assist in developing and maintaining web applications
    - Work with HTML, CSS, and JavaScript
    - Collaborate with senior developers
    - Test and debug code
    
    Requirements:
    - Currently enrolled in high school
    - Basic knowledge of HTML, CSS, and JavaScript
    - Eager to learn and grow
    - Available full-time during summer months
    
    This is a paid internship ($18/hour) with flexible hours during the summer break.
    
    To apply, please visit: https://techstart.example.com/careers/summer-intern
  `,
  url: "https://example.com/job-posting"
};

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

// Simulate the job posting workflow with a job description
async function testJobPostingWithDescription() {
  console.log('Testing job posting workflow with job description...');
  
  try {
    const jobPostingService = getJobPostingService();
    
    // Step 1: Process the job description
    console.log('Step 1: Processing job description...');
    const jobAnalysis = await jobPostingService.processJobDescription(sampleJobData.description);
    
    console.log('Extracted job data:');
    console.log(JSON.stringify({
      title: jobAnalysis.title,
      company: jobAnalysis.company,
      location: jobAnalysis.location,
      type: jobAnalysis.type,
      level: jobAnalysis.level,
      timeCommitment: jobAnalysis.timeCommitment,
      applicationUrl: jobAnalysis.applicationUrl
    }, null, 2));
    
    // Step 2: Simulate chat conversation to fill in missing fields
    console.log('\nStep 2: Simulating chat conversation for missing fields...');
    
    let jobData = { ...jobAnalysis };
    const missingFields = getMissingRequiredFields(jobData);
    
    if (missingFields.length > 0) {
      console.log(`Missing fields: ${missingFields.join(', ')}`);
      
      // Simulate filling in missing fields through chat
      for (const field of missingFields) {
        console.log(`Filling in missing field: ${field}`);
        
        // Simulate user input for each missing field
        const userInput = getSimulatedUserInput(field);
        console.log(`User input: ${userInput}`);
        
        // Update job data with simulated user input
        jobData[field] = userInput;
      }
    } else {
      console.log('No missing fields, all required data extracted successfully');
    }
    
    console.log('\nComplete job data after conversation:');
    console.log(JSON.stringify(jobData, null, 2));
    
    // Step 3: Simulate job submission to database (without actually inserting)
    console.log('\nStep 3: Simulating job submission to database...');
    
    // Prepare data for Supabase (using snake_case for column names)
    const dataToInsert = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
      type: jobData.type,
      level: jobData.level,
      time_commitment: jobData.timeCommitment,
      application_url: jobData.applicationUrl,
      external_link: jobData.externalLink || null,
      employer_id: mockUser.id,
      requirements: jobData.requirements || [],
      posted_at: new Date().toISOString(),
      applicants: 0
    };
    
    console.log('Data prepared for database insertion:');
    console.log(JSON.stringify(dataToInsert, null, 2));
    
    // Don't actually insert into the database for this test
    // const { error } = await supabase.from('jobs').insert(dataToInsert);
    
    console.log('✅ Job posting workflow with description test completed successfully');
  } catch (error) {
    console.error('❌ Job posting workflow with description test failed:', error);
  }
}

// Simulate the job posting workflow with a job URL
async function testJobPostingWithUrl() {
  console.log('\nTesting job posting workflow with job URL...');
  
  try {
    const jobPostingService = getJobPostingService();
    
    // Step 1: Process the job URL
    console.log('Step 1: Processing job URL...');
    
    // Use a mock result instead of actually scraping to avoid external dependencies
    const mockJobAnalysis = {
      title: "Web Developer Intern",
      company: "TechStart Inc.",
      location: "San Francisco, CA",
      description: "Summer internship opportunity for high school students interested in web development.",
      requirements: ["HTML/CSS knowledge", "JavaScript basics", "Eagerness to learn"],
      type: "Part-Time",
      level: "Entry Level",
      timeCommitment: "Summer",
      applicationUrl: "https://techstart.example.com/careers/summer-intern",
      externalLink: sampleJobData.url,
      confidence: 85,
      missingFields: []
    };
    
    console.log('Extracted job data from URL:');
    console.log(JSON.stringify({
      title: mockJobAnalysis.title,
      company: mockJobAnalysis.company,
      location: mockJobAnalysis.location,
      type: mockJobAnalysis.type,
      level: mockJobAnalysis.level,
      timeCommitment: mockJobAnalysis.timeCommitment,
      applicationUrl: mockJobAnalysis.applicationUrl
    }, null, 2));
    
    // Step 2: Simulate chat conversation to fill in missing fields
    console.log('\nStep 2: Simulating chat conversation for missing fields...');
    
    let jobData = { ...mockJobAnalysis };
    const missingFields = getMissingRequiredFields(jobData);
    
    if (missingFields.length > 0) {
      console.log(`Missing fields: ${missingFields.join(', ')}`);
      
      // Simulate filling in missing fields through chat
      for (const field of missingFields) {
        console.log(`Filling in missing field: ${field}`);
        
        // Simulate user input for each missing field
        const userInput = getSimulatedUserInput(field);
        console.log(`User input: ${userInput}`);
        
        // Update job data with simulated user input
        jobData[field] = userInput;
      }
    } else {
      console.log('No missing fields, all required data extracted successfully');
    }
    
    console.log('\nComplete job data after conversation:');
    console.log(JSON.stringify(jobData, null, 2));
    
    // Step 3: Simulate job submission to database (without actually inserting)
    console.log('\nStep 3: Simulating job submission to database...');
    
    // Prepare data for Supabase (using snake_case for column names)
    const dataToInsert = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
      type: jobData.type,
      level: jobData.level,
      time_commitment: jobData.timeCommitment,
      application_url: jobData.applicationUrl,
      external_link: jobData.externalLink || null,
      employer_id: mockUser.id,
      requirements: jobData.requirements || [],
      posted_at: new Date().toISOString(),
      applicants: 0
    };
    
    console.log('Data prepared for database insertion:');
    console.log(JSON.stringify(dataToInsert, null, 2));
    
    // Don't actually insert into the database for this test
    // const { error } = await supabase.from('jobs').insert(dataToInsert);
    
    console.log('✅ Job posting workflow with URL test completed successfully');
  } catch (error) {
    console.error('❌ Job posting workflow with URL test failed:', error);
  }
}

// Helper function to get missing required fields
function getMissingRequiredFields(data) {
  const requiredFields = [
    'title', 'company', 'location', 'description', 
    'type', 'level', 'timeCommitment', 'applicationUrl'
  ];
  
  return requiredFields.filter(field => !data[field]);
}

// Helper function to get simulated user input for missing fields
function getSimulatedUserInput(field) {
  const mockInputs = {
    title: "Summer Web Developer Intern",
    company: "TechStart Inc.",
    location: "San Francisco, CA",
    description: "Summer internship for high school students interested in web development.",
    type: "Part-Time",
    level: "Entry Level",
    timeCommitment: "Summer",
    applicationUrl: "https://techstart.example.com/careers/apply"
  };
  
  return mockInputs[field] || `Mock value for ${field}`;
}

// Run all tests
async function runTests() {
  console.log('Starting end-to-end job posting workflow tests...\n');
  
  await testJobPostingWithDescription();
  await testJobPostingWithUrl();
  
  console.log('\nAll tests completed.');
}

runTests();
