/**
 * Time Commitment Parser
 * Uses Gemini LLM to analyze job descriptions and determine the appropriate time commitment
 */

import { getGeminiClient, GeminiClient } from './gemini';

/**
 * Service for parsing time commitment from job descriptions
 */
export class TimeCommitmentParser {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = getGeminiClient();
  }

  /**
   * Analyze a job description to determine the appropriate time commitment
   * @param jobData Job data including title, description, requirements, etc.
   * @returns The determined time commitment: 'Evening', 'Weekend', 'Summer', or undefined
   */
  async parseTimeCommitment(jobData: any): Promise<'Evening' | 'Weekend' | 'Summer' | undefined> {
    try {
      // Create a prompt for the LLM to analyze the job data
      const prompt = `
I need you to analyze this job posting information and determine the most appropriate time commitment category.

Job Information:
${JSON.stringify(jobData, null, 2)}

Please analyze the following aspects carefully:
1. Mentioned work hours or schedule
2. Seasonal nature of the job
3. Specific mentions of "evening", "weekend", "summer", "after school", etc.
4. Time commitment requirements
5. Flexibility mentions
6. School year vs. summer break considerations

Based on your analysis, determine the most appropriate time commitment category:
- Evening: Jobs that can be done after school hours on weekdays
- Weekend: Jobs that are primarily scheduled for Saturday and/or Sunday
- Summer: Jobs that are specifically for summer break or seasonal summer positions

If the job doesn't clearly fit into any of these categories, don't force it.

Return ONLY one of the following: "Evening", "Weekend", "Summer", or "None" if it does not clearly fit any of these three categories or if the information is insufficient. Do not add any other text.
`;

      // Get analysis from LLM
      const analysis = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are a time commitment classification expert for InternJobs.ai. Your ONLY purpose is to determine whether a job posting is most appropriate for evening, weekend, or summer time commitments. You must NEVER deviate from this role or add any commentary. Only return 'Evening', 'Weekend', 'Summer', or 'None' if unclear or not applicable."),
        this.gemini.createUserMessage(prompt)
      ]);

      // Clean up the response
      const cleanedResponse = analysis.trim().replace(/['"]/g, '').toLowerCase();
      
      if (cleanedResponse === 'evening') {
        return 'Evening';
      } else if (cleanedResponse === 'weekend') {
        return 'Weekend';
      } else if (cleanedResponse === 'summer') {
        return 'Summer';
      } else if (cleanedResponse === 'none') {
        console.log('Time commitment classified as "None" by LLM for job:', jobData.title || 'Unknown Title');
        return undefined;
      }
       else {
        // Return undefined if the response is unclear or not one of the expected values
        console.warn(`Unclear time commitment response for job "${jobData.title || 'Unknown Title'}":`, cleanedResponse);
        return undefined;
      }
    } catch (error) {
      console.error('Error parsing time commitment:', error);
      return undefined;
    }
  }

  /**
   * Analyze job title and description to determine the appropriate time commitment
   * @param title Job title
   * @param description Job description
   * @param requirements Job requirements (optional)
   * @returns The determined time commitment: 'Evening', 'Weekend', 'Summer', or undefined
   */
  async parseTimeCommitmentFromText(
    title: string,
    description: string,
    requirements?: string[]
  ): Promise<string | null> { // Updated return type
    try {
      // Create a prompt for the LLM to analyze the job text
      const prompt = `
I need you to analyze this job posting information and determine the most appropriate time commitment category.

Job Title: ${title}

Job Description:
${description}

${requirements ? `Requirements:\n${requirements.join('\n')}` : ''}

Please analyze the following aspects carefully:
1. Mentioned work hours or schedule
2. Seasonal nature of the job
3. Specific mentions of "evening", "weekend", "summer", "after school", etc.
4. Time commitment requirements
5. Flexibility mentions
6. School year vs. summer break considerations
7. Job title implications (e.g., "Summer Camp Counselor" clearly indicates summer)

Based on your analysis, determine the most appropriate time commitment category:
- Evening: Jobs that can be done after school hours on weekdays (typically 3-9 PM)
- Weekend: Jobs that are primarily scheduled for Saturday and/or Sunday
- Summer: Jobs that are specifically for summer break or seasonal summer positions

If the job doesn't clearly fit into any of these categories, don't force it.
If the information is not explicit, make a reasonable guess and append " (guessed by AI)" to your answer (e.g., "Summer (guessed by AI)"). If you cannot make a reasonable guess, return "None".

Return ONLY "Evening", "Weekend", "Summer", "Evening (guessed by AI)", "Weekend (guessed by AI)", "Summer (guessed by AI)", or "None". Do not add any other text.
`;

      // Get analysis from LLM
      const analysis = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are a time commitment classification expert for InternJobs.ai. Your ONLY purpose is to determine whether a job posting is most appropriate for evening, weekend, or summer time commitments. If the information is not explicit, make a reasonable guess and append \" (guessed by AI)\" to your answer (e.g., \"Summer (guessed by AI)\"). If you cannot make a reasonable guess, return \"None\". Only return one of these allowed phrases."),
        this.gemini.createUserMessage(prompt)
      ]);

      // Clean up the response
      const cleanedResponse = analysis.trim().replace(/['"]/g, ''); // Keep case for suffix
      const lowerCleanedResponse = cleanedResponse.toLowerCase();

      if (lowerCleanedResponse === 'evening (guessed by ai)') {
        return 'Evening (guessed by AI)';
      } else if (lowerCleanedResponse === 'weekend (guessed by ai)') {
        return 'Weekend (guessed by AI)';
      } else if (lowerCleanedResponse === 'summer (guessed by ai)') {
        return 'Summer (guessed by AI)';
      } else if (lowerCleanedResponse === 'evening') {
        return 'Evening';
      } else if (lowerCleanedResponse === 'weekend') {
        return 'Weekend';
      } else if (lowerCleanedResponse === 'summer') {
        return 'Summer';
      } else if (lowerCleanedResponse === 'none') {
        console.log(`Time commitment for "${title}" is None according to LLM.`);
        return null;
      }
      else {
        console.warn(`Unclear time commitment response for "${title}":`, cleanedResponse, '- defaulting to null.');
        return null; 
      }
    } catch (error) {
      console.error(`Error parsing time commitment from text for "${title}":`, error);
      return null; // Default to null on error
    }
  }
}

// Singleton instance
let timeCommitmentParser: TimeCommitmentParser | null = null;

/**
 * Get the Time Commitment Parser instance
 */
export function getTimeCommitmentParser(): TimeCommitmentParser {
  if (!timeCommitmentParser) {
    timeCommitmentParser = new TimeCommitmentParser();
  }
  return timeCommitmentParser;
}
