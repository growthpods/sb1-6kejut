/**
 * Simple test script for the Gemini API
 */
require('dotenv').config();
console.log('Starting simple Gemini API test...');

// Log environment variables
console.log('Environment variables:');
console.log('VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? 'Set (length: ' + process.env.VITE_GEMINI_API_KEY.length + ')' : 'Not set');

// Mock the import.meta.env for Vite compatibility
global.import = { meta: { env: { VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY } } };

// Check if @google/genai is installed
try {
  console.log('Checking if @google/genai is installed...');
  // Import the GoogleGenAI directly
  const { GoogleGenAI } = require('@google/genai');
  console.log('@google/genai is installed and imported successfully');
} catch (error) {
  console.error('Error importing @google/genai:', error.message);
  console.log('Installing @google/genai...');
  require('child_process').execSync('npm install @google/genai', { stdio: 'inherit' });
  console.log('@google/genai installed successfully');
}

// Import the GoogleGenAI again after ensuring it's installed
const { GoogleGenAI } = require('@google/genai');

async function testGeminiDirectly() {
  try {
    console.log('Testing Gemini API directly...');
    
    // Create a new GoogleGenAI instance
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
    }
    
    console.log('Creating GoogleGenAI instance...');
    const genAI = new GoogleGenAI({ apiKey });
    console.log('GoogleGenAI instance created successfully');
    
    // Create a Gemini model instance
    console.log('Creating Gemini model instance...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
    console.log('Gemini model instance created successfully');
    
    // Generate content
    console.log('Generating content...');
    const prompt = 'Write a short poem about programming.';
    
    try {
      console.log('Calling generateContent with prompt:', prompt);
      const result = await model.generateContent(prompt);
      console.log('Result received:', result);
      
      console.log('Getting response from result...');
      const response = await result.response;
      console.log('Response received:', response);
      
      console.log('Getting text from response...');
      const text = response.text();
      console.log('Text extracted successfully');
      
      console.log('Gemini API response:');
      console.log(text);
      
      console.log('✅ Gemini API test successful');
    } catch (genError) {
      console.error('Error during content generation:', genError);
      console.error('Error details:', JSON.stringify(genError, null, 2));
      throw genError;
    }
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testGeminiDirectly().catch(error => {
  console.error('Unexpected error:', error);
});
