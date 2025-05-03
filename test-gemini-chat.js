/**
 * Test script for the Gemini LLM integration in the job posting chat window
 * This script tests the ability to process job descriptions and extract structured data
 */
require('dotenv').config();

// Mock the import.meta.env for Vite compatibility
global.import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };

const { getGeminiClient } = require('./src/lib/gemini');
const { getJobPostingService } = require('./src/lib/jobPostingService');

// Sample job descriptions for testing
const sampleJobDescriptions = [
  {
    name: "Software Engineer Internship",
    description: `
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
    `
  },
  {
    name: "Retail Associate - Weekend Hours",
    description: `
      Weekend Retail Associate - BookHaven
      Location: Chicago, IL
      
      Job Description:
      BookHaven is seeking friendly, customer-oriented high school students for weekend retail associate positions. Perfect for students looking to earn money while maintaining their school schedule.
      
      Duties:
      - Assist customers in finding books and merchandise
      - Process sales transactions and handle cash
      - Maintain store appearance and restock shelves
      - Help with inventory management
      
      Qualifications:
      - High school student, 16 years or older
      - Available to work weekends (Saturday and Sunday)
      - Customer service skills
      - Basic math skills
      
      Hours: 10-15 hours per weekend
      Pay: $15/hour
      
      Apply online at www.bookhaven.com/careers
    `
  }
];

// Test the Gemini client directly
async function testGeminiClient() {
  console.log('Testing Gemini client...');
  
  try {
    const gemini = getGeminiClient();
    
    // Test a simple completion
    const prompt = "What are the key components of a good job description?";
    console.log(`Sending prompt to Gemini: "${prompt}"`);
    
    const response = await gemini.createCompletion([
      gemini.createSystemMessage("You are a job posting expert. Provide concise, helpful information about job descriptions."),
      gemini.createUserMessage(prompt)
    ]);
    
    console.log('Gemini response:');
    console.log(response.substring(0, 300) + '...');
    console.log('✅ Gemini client test successful');
  } catch (error) {
    console.error('❌ Gemini client test failed:', error);
  }
}

// Test the job posting service's ability to process job descriptions
async function testJobDescriptionProcessing() {
  console.log('\nTesting job description processing...');
  
  try {
    const jobPostingService = getJobPostingService();
    
    for (const sample of sampleJobDescriptions) {
      console.log(`\nProcessing sample job: ${sample.name}`);
      
      const result = await jobPostingService.processJobDescription(sample.description);
      
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
      const validLocation = result.location && result.location.length > 0;
      
      if (validTitle && validLocation) {
        console.log(`✅ Successfully extracted data from "${sample.name}"`);
      } else {
        console.log(`❌ Failed to extract complete data from "${sample.name}"`);
      }
    }
  } catch (error) {
    console.error('❌ Job description processing test failed:', error);
  }
}

// Test the chat response generation
async function testChatResponseGeneration() {
  console.log('\nTesting chat response generation...');
  
  try {
    const jobPostingService = getJobPostingService();
    
    // Simulate a chat conversation
    const chatHistory = [
      { sender: 'bot', text: "Hello! I'm your AI-powered job posting assistant. You can paste a job description, share a link to a job posting, or just tell me about the job you want to post." },
      { sender: 'user', text: "I want to post a job for a part-time cashier at my store." }
    ];
    
    const jobData = {};
    const userMessage = "The job is for high school students, 15 hours per week, evenings and weekends.";
    
    console.log('Simulating chat conversation:');
    chatHistory.forEach(msg => console.log(`${msg.sender}: ${msg.text}`));
    console.log(`user: ${userMessage}`);
    
    const { response, updatedJobData } = await jobPostingService.generateChatResponse(
      userMessage,
      chatHistory,
      jobData
    );
    
    console.log('Bot response:');
    console.log(response.substring(0, 300) + (response.length > 300 ? '...' : ''));
    
    console.log('Updated job data:');
    console.log(JSON.stringify(updatedJobData, null, 2));
    
    if (response && response.length > 0) {
      console.log('✅ Chat response generation test successful');
    } else {
      console.log('❌ Chat response generation test failed: Empty response');
    }
  } catch (error) {
    console.error('❌ Chat response generation test failed:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Gemini LLM integration tests...\n');
  
  await testGeminiClient();
  await testJobDescriptionProcessing();
  await testChatResponseGeneration();
  
  console.log('\nAll tests completed.');
}

runTests();
