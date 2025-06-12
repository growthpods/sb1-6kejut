/**
 * Education Level Parser
 * Uses Gemini LLM to analyze job descriptions and determine the appropriate education level
 */

import { getGeminiClient, GeminiClient } from './gemini.ts';

/**
 * Service for parsing education level from job descriptions
 */
export class EducationLevelParser {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = getGeminiClient();
  }

  /**
   * Analyze a job description to determine whether it's suitable for high school or college students
   * @param jobData Job data including title, description, requirements, etc.
   * @returns The determined student type: 'High School' or 'College'
   */
  async parseEducationLevel(jobData: any): Promise<'High School' | 'College'> {
    try {
      // Updated prompt: Focus on real-world suitability, not just education requirements
      const prompt = `
I need you to analyze this job posting and determine if it is truly suitable for a high school student (entry-level, simple tasks, flexible schedule, no specialized skills) or a college student (specialized, technical, or field-specific tasks, may require prior experience or advanced skills).

**Do NOT use formal education requirements as the main criteria.** Only consider them if they are a clear barrier (e.g., 'must be enrolled in college').

Focus on:
- Schedule flexibility (evenings, weekends, summer, after school, part-time)
- Task complexity (simple/repetitive/support vs. specialized/technical/field-specific)
- Required skills (basic vs. advanced/field-specific)
- Level of responsibility (direct supervision vs. independent/project work)
- Typical age/experience of successful candidates

If the job is only appropriate for a college student due to complexity, technical skills, or independence, classify as "College".
If the job is simple, flexible, and could realistically be done by a high schooler, classify as "High School".
If unsure, make a reasonable guess and append " (guessed by AI)".

Job Information:
${JSON.stringify(jobData, null, 2)}

Return ONLY "High School", "College", "High School (guessed by AI)", "College (guessed by AI)", or "Unknown". Do not add any other text.`;

      // Get analysis from LLM
      const analysis = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are an education level classification expert for InternJobs.ai. Your ONLY purpose is to determine whether a job posting is more appropriate for high school or college students. If the information is not explicit, make a reasonable guess and append \" (guessed by AI)\" to your answer (e.g., \"College (guessed by AI)\"). If you cannot make a reasonable guess, return \"Unknown\". Only return one of these allowed phrases."),
        this.gemini.createUserMessage(prompt)
      ]);

      // Clean up the response to ensure we only get "High School" or "College"
      const cleanedResponse = analysis.trim().replace(/['"]/g, '');
      
      if (cleanedResponse.toLowerCase().includes('high school')) {
        return 'High School';
      } else if (cleanedResponse.toLowerCase().includes('college')) {
        return 'College';
      } else {
        // Default to High School if the response is unclear
        console.warn('Unclear education level response:', cleanedResponse);
        return 'High School';
      }
    } catch (error) {
      console.error('Error parsing education level:', error);
      // Default to High School on error
      return 'High School';
    }
  }

  /**
   * Analyze job title and description to determine whether it's suitable for high school or college students
   * @param title Job title
   * @param description Job description
   * @param requirements Job requirements (optional)
   * @param manualOverride Optional manual override for education level
   * @returns The determined student type: 'High School' or 'College', or the manual override if provided
   */
  async parseEducationLevelFromText(
    title: string,
    description: string,
    requirements?: string[],
    manualOverride?: string | null
  ): Promise<string | null> {
    // If manual override is provided, use it
    if (manualOverride && (manualOverride === 'High School' || manualOverride === 'College')) {
      console.log(`Manual override used for job '${title}': ${manualOverride}`);
      return manualOverride;
    }
    try {
      // Updated prompt: Focus on real-world suitability, not just education requirements
      const prompt = `
I need you to analyze this job posting and determine if it is truly suitable for a high school student (entry-level, simple tasks, flexible schedule, no specialized skills) or a college student (specialized, technical, or field-specific tasks, may require prior experience or advanced skills).

**Do NOT use formal education requirements as the main criteria.** Only consider them if they are a clear barrier (e.g., 'must be enrolled in college').

Focus on:
- Schedule flexibility (evenings, weekends, summer, after school, part-time)
- Task complexity (simple/repetitive/support vs. specialized/technical/field-specific)
- Required skills (basic vs. advanced/field-specific)
- Level of responsibility (direct supervision vs. independent/project work)
- Typical age/experience of successful candidates

If the job is only appropriate for a college student due to complexity, technical skills, or independence, classify as "College".
If the job is simple, flexible, and could realistically be done by a high schooler, classify as "High School".
If unsure, make a reasonable guess and append " (guessed by AI)".

Job Title: ${title}

Job Description:
${description}

${requirements ? `Requirements:\n${requirements.join('\n')}` : ''}

Return ONLY "High School", "College", "High School (guessed by AI)", "College (guessed by AI)", or "Unknown". Do not add any other text.`;

      // Get analysis from LLM
      const analysis = await this.gemini.createCompletion([
        this.gemini.createSystemMessage("You are an education level classification expert for InternJobs.ai. Your ONLY purpose is to determine whether a job posting is more appropriate for high school or college students. If the information is not explicit, make a reasonable guess and append \" (guessed by AI)\" to your answer (e.g., \"College (guessed by AI)\"). If you cannot make a reasonable guess, return \"Unknown\". Only return one of these allowed phrases. Be strict: if a job requires a degree, college enrollment, or post-secondary coursework, it is for college students ONLY."),
        this.gemini.createUserMessage(prompt)
      ]);

      // Clean up the response
      const cleanedResponse = analysis.trim().replace(/['"]/g, ''); // Keep case for suffix
      const lowerCleanedResponse = cleanedResponse.toLowerCase();

      if (lowerCleanedResponse === 'high school (guessed by ai)') {
        return 'High School (guessed by AI)';
      } else if (lowerCleanedResponse === 'college (guessed by ai)') {
        return 'College (guessed by AI)';
      } else if (lowerCleanedResponse === 'high school') {
        return 'High School';
      } else if (lowerCleanedResponse === 'college') {
        return 'College';
      } else if (lowerCleanedResponse === 'unknown') {
        // Log for manual review
        console.warn(`Education level for job '${title}' is Unknown according to LLM. Needs manual review.`);
        return null;
      }
      else {
        // Log for manual review
        console.warn(`Unclear education level response for job '${title}':`, cleanedResponse, '- defaulting to null. Needs manual review.');
        return null; 
      }
    } catch (error) {
      console.error(`Error parsing education level from text for job '${title}':`, error);
      return null; // Default to null on error
    }
  }
}

// Singleton instance
let educationLevelParser: EducationLevelParser | null = null;

/**
 * Get the Education Level Parser instance
 */
export function getEducationLevelParser(): EducationLevelParser {
  if (!educationLevelParser) {
    educationLevelParser = new EducationLevelParser();
  }
  return educationLevelParser;
}
