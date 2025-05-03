/**
 * Google Gemini API service for accessing LLMs
 */
import { GoogleGenAI } from '@google/genai';

/**
 * Google Gemini API client
 */
export class GeminiClient {
  private ai: GoogleGenAI;
  private defaultModel: string = 'gemini-2.5-flash-preview-04-17';

  constructor(apiKey: string, model?: string) {
    this.ai = new GoogleGenAI({ apiKey });
    if (model) {
      this.defaultModel = model;
    }
  }

  /**
   * Send a completion request to Gemini API
   */
  async createCompletion(
    messages: { role: 'user' | 'model'; content: string }[],
    options: {
      temperature?: number;
      maxOutputTokens?: number;
    } = {}
  ): Promise<string> {
    console.log('Gemini: Creating completion with model:', this.defaultModel);
    
    try {
      // Convert our message format to Gemini format
      // For simplicity, we'll just use the last message
      const lastMessage = messages[messages.length - 1];
      
      const contents = [
        {
          role: lastMessage.role === 'model' ? 'model' : 'user',
          parts: [
            {
              text: lastMessage.content,
            },
          ],
        },
      ];
      
      console.log('Gemini: Request contents:', JSON.stringify(contents, null, 2));
      
      // Configure the request
      const config = {
        responseMimeType: 'text/plain',
      };
      
      // Generate content using the streaming API
      const response = await this.ai.models.generateContentStream({
        model: this.defaultModel,
        config,
        contents,
      });
      
      console.log('Gemini: Response stream received');
      
      // Collect all chunks of the response
      let fullResponse = '';
      for await (const chunk of response) {
        console.log('Gemini: Received chunk:', chunk.text);
        fullResponse += chunk.text;
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Helper method to create a system message (Note: Gemini doesn't have system messages, so we'll use user role)
   */
  createSystemMessage(content: string): { role: 'user'; content: string } {
    return { role: 'user', content: `System: ${content}` };
  }

  /**
   * Helper method to create a user message
   */
  createUserMessage(content: string): { role: 'user'; content: string } {
    return { role: 'user', content };
  }

  /**
   * Helper method to create an assistant message
   */
  createAssistantMessage(content: string): { role: 'model'; content: string } {
    return { role: 'model', content };
  }
}

// Singleton instance with environment variable
let geminiClient: GeminiClient | null = null;

/**
 * Get the Gemini client instance
 */
export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
    }
    geminiClient = new GeminiClient(apiKey);
  }
  return geminiClient;
}
