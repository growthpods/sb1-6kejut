/**
 * Direct test script for the Gemini API based on the sample code provided
 */
require('dotenv').config();

// Import the GoogleGenAI package
const { GoogleGenAI } = require('@google/genai');

async function main() {
  console.log('Starting direct Gemini API test...');
  
  // Get API key from environment variables
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: VITE_GEMINI_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  console.log('API Key:', apiKey ? 'Set (length: ' + apiKey.length + ')' : 'Not set');
  
  // For compatibility with the sample code
  process.env.GEMINI_API_KEY = apiKey;
  
  try {
    // Initialize the Google GenAI client
    console.log('Initializing Google GenAI client...');
    const ai = new GoogleGenAI({
      apiKey,
    });
    
    // Configure the request
    const config = {
      responseMimeType: 'text/plain',
    };
    
    // Specify the model to use
    const model = 'gemini-2.5-flash-preview-04-17';
    console.log('Using model:', model);
    
    // Create the content for the request
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Write a short poem about programming.`,
          },
        ],
      },
    ];
    
    console.log('Sending request to Gemini API...');
    
    // Generate content using the streaming API
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    
    console.log('Response received, processing chunks:');
    
    // Process the response chunks
    let fullResponse = '';
    for await (const chunk of response) {
      console.log('Chunk received:', chunk.text);
      fullResponse += chunk.text;
    }
    
    console.log('\nFull response:');
    console.log(fullResponse);
    
    console.log('\n✅ Gemini API test completed successfully');
  } catch (error) {
    console.error('❌ Error during Gemini API test:', error);
    console.error('Error details:', error.stack);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
});
