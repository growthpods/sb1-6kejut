/**
 * OpenRouter API service for accessing LLMs like Google Gemini
 */

// Define the OpenRouter API types
interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenRouterCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

/**
 * OpenRouter API client for accessing various LLMs
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private defaultModel: string = 'google/gemini-2.5-pro'; // Use Gemini 2.5 Pro

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    if (model) {
      this.defaultModel = model;
    }
  }

  /**
   * Send a completion request to OpenRouter
   */
  async createCompletion(
    messages: OpenRouterMessage[],
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<string> {
    console.log('OpenRouter: Creating completion with model:', options.model || this.defaultModel);
    const model = options.model || this.defaultModel;
    
    const requestBody: OpenRouterCompletionRequest = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
    };

    try {
      console.log('OpenRouter: Sending request to API');
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin, // Required by OpenRouter
          'X-Title': 'InternJobs.ai' // Identify your app
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter: API error response:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      console.log('OpenRouter: Received successful response');
      const data = await response.json() as OpenRouterCompletionResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  /**
   * Helper method to create a system message
   */
  createSystemMessage(content: string): OpenRouterMessage {
    return { role: 'system', content };
  }

  /**
   * Helper method to create a user message
   */
  createUserMessage(content: string): OpenRouterMessage {
    return { role: 'user', content };
  }

  /**
   * Helper method to create an assistant message
   */
  createAssistantMessage(content: string): OpenRouterMessage {
    return { role: 'assistant', content };
  }
}

// Singleton instance with environment variable
let openRouterClient: OpenRouterClient | null = null;

/**
 * Get the OpenRouter client instance
 */
export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    // Get API key from environment variable or prompt user
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file.');
    }
    openRouterClient = new OpenRouterClient(apiKey);
  }
  return openRouterClient;
}
