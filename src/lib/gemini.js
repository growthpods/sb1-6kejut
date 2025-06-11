/**
 * Google Gemini API service for accessing LLMs
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Google Gemini API client
 */
export class GeminiClient {
    constructor(apiKey, model) {
        this.ai = new GoogleGenAI({ apiKey });
        this.defaultModel = model || 'gemini-1.5-flash-latest'; // Changed to stable fast model
    }
    /**
     * Send a completion request to Gemini API
     */
    async createCompletion(messages, options = {}) {
        console.log('Gemini: Creating completion with model:', this.defaultModel);
        try {
            // Convert our message format to Gemini format
            // For simplicity, we'll just use the last message
            const lastMessage = messages[messages.length - 1];
            let text = lastMessage.content;
            if (typeof text === 'object' && text !== null) {
                text = JSON.stringify(text, null, 2);
            } else if (text === null || text === undefined) {
                text = '';
            }
            const contents = [
                {
                    role: lastMessage.role === 'model' ? 'model' : 'user',
                    parts: [
                        {
                            text: text.substring(0, 30000),
                        },
                    ],
                },
            ];
            console.log('Gemini: Request contents:', JSON.stringify(contents, null, 2));
            // Configure the request
            const config = {
                responseMimeType: 'text/plain',
            };
            // Generate content using the non-streaming API
            const result = await this.ai.models.generateContent({
                model: this.defaultModel,
                config,
                contents,
            });
            if (result.response && typeof result.response.text === 'function') {
                return result.response.text();
            } else if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                console.error('Unexpected Gemini API response format:', JSON.stringify(result, null, 2));
                throw new Error('Unexpected Gemini API response format');
            }
        }
        catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
    /**
     * Helper method to create a system message (Note: Gemini doesn't have system messages, so we'll use user role)
     */
    createSystemMessage(content) {
        return { role: 'user', content: `System: ${content}` };
    }
    /**
     * Helper method to create a user message
     */
    createUserMessage(content) {
        return { role: 'user', content };
    }
    /**
     * Helper method to create an assistant message
     */
    createAssistantMessage(content) {
        return { role: 'model', content };
    }
}
// Singleton instance with environment variable
let geminiClient = null;
/**
 * Get the Gemini client instance
 */
export function getGeminiClient() {
    if (!geminiClient) {
        let apiKey;
        // Check for Vite environment (client-side)
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        }
        // Fallback to Node.js environment (server-side/scripts)
        if (!apiKey && typeof process !== 'undefined' && process.env) {
            apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        }
        if (!apiKey) {
            throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY (for client-side) or GEMINI_API_KEY (for server-side/scripts) in your .env file.');
        }
        geminiClient = new GeminiClient(apiKey);
    }
    return geminiClient;
}
