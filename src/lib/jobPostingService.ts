/**
 * Job Posting Service
 * Combines Google Gemini LLM and Firecrawl scraping for enhanced job posting
 */

import { getGeminiClient, GeminiClient } from './gemini';
import { getFirecrawlService, FirecrawlService } from './firecrawl';
import type { Job } from '../types';

// Define the types for job analysis
interface JobAnalysisResult {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  type?: string;
  level?: string;
  timeCommitment?: 'Evening' | 'Weekend' | 'Summer';
  applicationUrl?: string;
  externalLink?: string;
  confidence: number; // 0-100 confidence score
  missingFields: string[]; // Fields that couldn't be extracted
}

/**
 * Service for enhanced job posting with AI and web scraping
 */
export class JobPostingService {
  private gemini: GeminiClient;
  private firecrawl: FirecrawlService;

  constructor() {
    this.gemini = getGeminiClient();
    this.firecrawl = getFirecrawlService();
  }

  /**
   * Process a job URL by scraping it and analyzing with LLM
   * @param url The job posting URL
   * @returns Analyzed job data
   */
  async processJobUrl(url: string): Promise<JobAnalysisResult> {
    try {
      // Step 1: Scrape the job posting
      const scrapedData = await this.firecrawl.scrapeJobListing(url);
      
      // Step 2: Use LLM to analyze and enhance the scraped data
      return await this.analyzeJobData(scrapedData);
    } catch (error) {
      console.error('Error processing job URL:', error);
      throw error;
    }
  }

  /**
   * Process a job description text with LLM
   * @param description The job description text
   * @returns Analyzed job data
   */
  async processJobDescription(description: string): Promise<JobAnalysisResult> {
    try {
      console.log('JobPostingService: Processing job description');
      // Use LLM to analyze the job description
      const result = await this.analyzeJobText(description);
      console.log('JobPostingService: Job description analysis complete');
      return result;
    } catch (error) {
      console.error('Error processing job description:', error);
      throw error;
    }
  }

  /**
   * Generate a response to a user message in the job posting chat
   * @param userMessage The user's message
   * @param chatHistory Previous messages in the conversation
   * @param currentJobData Current job data being collected
   * @returns AI response and updated job data
   */
  async generateChatResponse(
    userMessage: string,
    chatHistory: { sender: 'user' | 'bot'; text: string }[],
    currentJobData: Partial<Job>
  ): Promise<{
    response: string;
    updatedJobData: Partial<Job>;
  }> {
    try {
      // Format the chat history for the LLM
      const messages = [
        this.gemini.createSystemMessage(this.getJobPostingSystemPrompt(currentJobData)),
        ...chatHistory.map(msg => 
          msg.sender === 'user' 
            ? this.gemini.createUserMessage(msg.text)
            : this.gemini.createAssistantMessage(msg.text)
        ),
        this.gemini.createUserMessage(userMessage)
      ];

      // Get response from LLM
      const response = await this.gemini.createCompletion(messages, {
        temperature: 0.7,
        maxOutputTokens: 1000
      });

      // Extract any job data updates from the response
      const updatedJobData = await this.extractJobDataFromResponse(
        response,
        userMessage,
        currentJobData
      );

      return {
        response,
        updatedJobData
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      return {
        response: "I'm sorry, I encountered an error processing your message. Please try again.",
        updatedJobData: currentJobData
      };
    }
  }

  /**
   * Analyze job data with LLM
   * @param jobData Scraped job data
   * @returns Enhanced job data with LLM analysis
   */
  private async analyzeJobData(jobData: any): Promise<JobAnalysisResult> {
    // Create a prompt for the LLM to analyze the job data
    const prompt = `
I need you to analyze this job posting information and extract structured data.

Job Information:
${JSON.stringify(jobData, null, 2)}

Please extract the following information:
- Job title
- Company name
- Location
- Job description (summarized if very long)
- Requirements (as a list)
- Job type (Full-Time, Part-Time, Contract, Internship, etc.)
- Experience level (Entry Level, Intermediate, Senior, etc.)
- Time commitment (Evening, Weekend, or Summer - choose the most appropriate)
- Application URL (if available)
- External link (the original job posting URL)

Also indicate:
- Confidence score (0-100) for the overall extraction
- Any fields that couldn't be reliably extracted

Format your response as a JSON object with these fields.
`;

    try {
      // Get analysis from LLM
      const analysis = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are a job data extraction expert for InternJobs.ai, a platform for high school students. Your ONLY purpose is to extract structured data from job postings accurately. You must NEVER deviate from this role or add any commentary unrelated to the extraction task. Only return the requested JSON format with the extracted data."),
        this.gemini.createUserMessage(prompt)
      ]);

      // Parse the JSON response
      try {
        // Extract JSON from the response (in case there's additional text)
        const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/) || 
                         analysis.match(/\{[\s\S]*\}/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysis;
        const result = JSON.parse(jsonStr) as JobAnalysisResult;
        
        // Ensure we have the required fields
        return {
          title: result.title,
          company: result.company,
          location: result.location,
          description: result.description,
          requirements: Array.isArray(result.requirements) ? result.requirements : [],
          type: result.type,
          level: result.level,
          timeCommitment: result.timeCommitment,
          applicationUrl: result.applicationUrl,
          externalLink: result.externalLink,
          confidence: result.confidence || 0,
          missingFields: result.missingFields || []
        };
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        // Return a basic result with the raw analysis
        return {
          description: jobData.description || analysis,
          confidence: 30,
          missingFields: ['Failed to parse structured data']
        };
      }
    } catch (error) {
      console.error('Error analyzing job data with LLM:', error);
      throw error;
    }
  }

  /**
   * Analyze job text with LLM
   * @param text Job description text
   * @returns Analyzed job data
   */
  private async analyzeJobText(text: string): Promise<JobAnalysisResult> {
    console.log('JobPostingService: Analyzing job text with LLM');
    // Create a prompt for the LLM to analyze the job text
    const prompt = `
I need you to analyze this job posting text and extract structured data.

Job Text:
${text}

Please extract the following information:
- Job title
- Company name
- Location
- Job description (summarized if very long)
- Requirements (as a list)
- Job type (Full-Time, Part-Time, Contract, Internship, etc.)
- Experience level (Entry Level, Intermediate, Senior, etc.)
- Time commitment (Evening, Weekend, or Summer - choose the most appropriate)
- Application URL (if available)

Also indicate:
- Confidence score (0-100) for the overall extraction
- Any fields that couldn't be reliably extracted

Format your response as a JSON object with these fields.
`;

    try {
      // Get analysis from LLM
      console.log('JobPostingService: Calling Gemini API');
      const analysis = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are a job data extraction expert for InternJobs.ai, a platform for high school students. Your ONLY purpose is to extract structured data from job postings accurately. You must NEVER deviate from this role or add any commentary unrelated to the extraction task. Only return the requested JSON format with the extracted data."),
        this.gemini.createUserMessage(prompt)
      ]);
      console.log('JobPostingService: Received response from Gemini API');

      // Parse the JSON response
      try {
        // Extract JSON from the response (in case there's additional text)
        const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/) || 
                         analysis.match(/\{[\s\S]*\}/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysis;
        const result = JSON.parse(jsonStr) as JobAnalysisResult;
        
        // Ensure we have the required fields
        return {
          title: result.title,
          company: result.company,
          location: result.location,
          description: result.description,
          requirements: Array.isArray(result.requirements) ? result.requirements : [],
          type: result.type,
          level: result.level,
          timeCommitment: result.timeCommitment,
          applicationUrl: result.applicationUrl,
          externalLink: undefined, // No external link for text input
          confidence: result.confidence || 0,
          missingFields: result.missingFields || []
        };
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        // Return a basic result with the raw text
        return {
          description: text,
          confidence: 30,
          missingFields: ['Failed to parse structured data']
        };
      }
    } catch (error) {
      console.error('Error analyzing job text with LLM:', error);
      throw error;
    }
  }

  /**
   * Extract job data updates from an LLM response
   * @param response The LLM response
   * @param userMessage The user message that prompted the response
   * @param currentJobData Current job data
   * @returns Updated job data
   */
  private async extractJobDataFromResponse(
    response: string,
    userMessage: string,
    currentJobData: Partial<Job>
  ): Promise<Partial<Job>> {
    // Create a prompt for the LLM to extract job data updates
    const prompt = `
Given this conversation about a job posting:

User: ${userMessage}
Assistant: ${response}

And the current job data:
${JSON.stringify(currentJobData, null, 2)}

Extract any new or updated job information from the conversation.
Return ONLY a JSON object with the updated fields. Include only fields that should be updated.
If no fields should be updated, return an empty JSON object {}.
`;

    try {
      // Get extraction from LLM
      const extraction = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are a data extraction expert for InternJobs.ai. Your ONLY purpose is to extract structured job data from conversations accurately. You must NEVER deviate from this role or add any commentary. Only return the requested JSON format with the extracted data. Do not include any fields that were not mentioned in the conversation."),
        this.gemini.createUserMessage(prompt)
      ]);

      // Parse the JSON response
      try {
        // Extract JSON from the response (in case there's additional text)
        const jsonMatch = extraction.match(/```json\n([\s\S]*?)\n```/) || 
                         extraction.match(/\{[\s\S]*\}/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : extraction;
        const updates = JSON.parse(jsonStr);
        
        // Merge updates with current data
        return {
          ...currentJobData,
          ...updates
        };
      } catch (parseError) {
        console.error('Error parsing job data updates:', parseError);
        // Return unchanged data
        return currentJobData;
      }
    } catch (error) {
      console.error('Error extracting job data updates:', error);
      return currentJobData;
    }
  }

  /**
   * Get the system prompt for job posting chat
   * @param currentJobData Current job data being collected
   * @returns System prompt for the LLM
   */
  private getJobPostingSystemPrompt(currentJobData: Partial<Job>): string {
    return `
You are an AI-powered Job Posting Assistant for InternJobs.ai, a platform exclusively connecting high school students with flexible work opportunities.

Your ONLY purpose is to help employers create and post job listings on the platform. You must NEVER deviate from this role or engage in conversations unrelated to job posting.

Current job data:
${JSON.stringify(currentJobData, null, 2)}

STRICT GUIDELINES (You must follow these exactly):
1. Be friendly, professional, and helpful, but ONLY discuss job posting related topics.
2. Ask for missing information one field at a time in a conversational manner.
3. If the user provides a job link, acknowledge it and explain you'll extract information from it.
4. If the user provides a job description, acknowledge it and extract relevant details.
5. Required fields that MUST be collected: title, company, location, description, type, level, timeCommitment, applicationUrl
6. For timeCommitment, ONLY accept one of these values: Evening, Weekend, Summer
7. When all required information is collected, summarize the job posting and ask for confirmation.
8. If the user wants to make changes, help them update specific fields.
9. If the user asks about anything unrelated to job posting, politely redirect them back to the job posting process.
10. NEVER provide information, advice, or assistance on topics unrelated to creating a job posting.
11. NEVER engage in discussions about politics, religion, adult content, or other controversial topics.
12. NEVER generate content that could be harmful, illegal, or unethical.

JOB POSTING WORKFLOW:
1. Help employers compose a complete job description through conversation.
2. If they provide a website or link to an existing job posting, parse the information and extract all relevant details.
3. If they don't have a website or link, collect all required information through conversation.
4. When they're ready to post, collect their email address or phone number if they don't have a website or application link.
5. Always ensure there's a way for students to apply (either applicationUrl, email, or phone).
6. Before finalizing, summarize all collected information and ask for confirmation.
7. After confirmation, thank them and explain that their job posting will be stored and made available to students.

IMPORTANT CONTEXT:
- This platform is EXCLUSIVELY for high school students looking for flexible work opportunities.
- All job postings must be appropriate and safe for high school students.
- Jobs should be part-time and accommodate school schedules.
- You are ONLY a job posting assistant and cannot help with other tasks.
- All job data will be stored in our database for students to browse and apply.

If you're unsure if a job is appropriate for high school students, ask clarifying questions to ensure it meets platform guidelines.
`;
  }
}

// Singleton instance
let jobPostingService: JobPostingService | null = null;

/**
 * Get the Job Posting service instance
 */
export function getJobPostingService(): JobPostingService {
  if (!jobPostingService) {
    jobPostingService = new JobPostingService();
  }
  return jobPostingService;
}
