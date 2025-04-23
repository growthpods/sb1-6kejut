// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Get API key from environment variable
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  // Initialize the Google GenAI client
  const ai = new GoogleGenAI({
    apiKey,
  });

  const config = {
    responseMimeType: 'text/plain',
  };
  
  const model = 'gemini-2.0-flash';
  
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: 'Software Developer Intern position at TechCorp. Looking for high school students with basic programming knowledge. Part-time, evenings and weekends. $15/hour.',
        },
      ],
    },
  ];

  console.log('Sending request to Gemini API...');
  
  try {
    // Check available methods on the ai object
    console.log('Available methods on ai object:', Object.getOwnPropertyNames(Object.getPrototypeOf(ai)));
    
    // Try different ways to access the model
    if (typeof ai.getGenerativeModel === 'function') {
      console.log('Using ai.getGenerativeModel()');
      const genModel = ai.getGenerativeModel({
        model,
        config,
      });
      
      const response = await genModel.generateContent({
        contents,
      });
      
      console.log('Response:', response.response.text());
    } else if (typeof ai.models !== 'undefined') {
      console.log('Using ai.models');
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });
      
      for await (const chunk of response) {
        console.log(chunk.text);
      }
    } else {
      console.error('Could not find a way to access the model');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
