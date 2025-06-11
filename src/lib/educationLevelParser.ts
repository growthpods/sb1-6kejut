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
      // Create a prompt for the LLM to analyze the job data
      const prompt = `
I need you to analyze this job posting information and determine whether it's more appropriate for a high school student or a college student who is still studying.

Job Information:
${JSON.stringify(jobData, null, 2)}

Please analyze the following aspects carefully:
1. Required education level mentioned (if any)
2. Required skills and their complexity
   - High school students typically have basic computer skills, communication skills, and may know some entry-level programming
   - College students typically have more advanced technical skills, specialized knowledge in their field of study
3. Required experience level
   - High school students typically have little to no professional experience
   - College students may have previous internships or part-time work experience
4. Job responsibilities and their complexity
   - High school appropriate: data entry, customer service, basic administrative tasks, social media assistance
   - College appropriate: specialized research, complex analysis, project management, specialized technical work
5. Time commitment required
   - High school students need more flexible schedules around school hours
   - College students may have more flexible daytime availability
6. Any specific mentions of "high school" or "college" students
7. Required coursework or academic background
   - Jobs requiring specific college coursework are clearly for college students

Based on your analysis, determine if this job is more suitable for:
- High School students (less complex, entry-level, minimal experience required, basic skills)
- College students (more complex, may require specific coursework, higher skill level, specialized knowledge)

If the information is not explicit, make a reasonable guess and append " (guessed by AI)" to your answer (e.g., "College (guessed by AI)"). If you cannot make a reasonable guess, return "Unknown".

Return ONLY "High School", "College", "High School (guessed by AI)", "College (guessed by AI)", or "Unknown". Do not add any other text.
`;

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
      // Improved prompt: Be stricter about degree requirements
      const prompt = `
I need you to analyze this job posting information and determine whether it's more appropriate for a high school student or a college student who is still studying.

Job Title: ${title}

Job Description:
${description}

${requirements ? `Requirements:\n${requirements.join('\n')}` : ''}

Please analyze the following aspects carefully and be very strict with your classification:
1.  **Explicit College Requirements (CRITICAL):** If the job explicitly states *any* of the following, it is for **College students ONLY**:
    *   "college enrollment"
    *   "bachelor's degree"
    *   "university student"
    *   "post-secondary coursework"
    *   "currently pursuing a Bachelor's or Master's degree"
    *   "finishing or completed junior year of college"
    *   "graduate student"
    *   "pursuing a degree"
    *   "enrolled in a college/university"
    *   "college credit"
    *   "relevant college major"
    *   "academic standing" (e.g., sophomore, junior, senior)
    *   Any specific academic major or field of study (e.g., "Computer Science," "Engineering," "Business Administration") that implies college-level study.
    *   Any requirement for a specific GPA.

2.  **Skills and Complexity:**
    *   **High School appropriate:** Basic computer skills, communication skills, general office software (e.g., Microsoft Office basics), social media usage, data entry, simple content creation, basic administrative tasks.
    *   **College appropriate:** Advanced technical skills, specialized software proficiency (e.g., CAD, specific programming languages beyond basics, data analysis tools), in-depth research, complex problem-solving, theoretical knowledge in a specific field.

3.  **Experience Level:**
    *   **High School appropriate:** Little to no professional experience, volunteer work, school projects, extracurricular activities.
    *   **College appropriate:** Previous internships, significant part-time work experience, experience in a professional or academic research setting.

4.  **Job Responsibilities:**
    *   **High School appropriate:** Support roles, general assistance, repetitive tasks, learning-focused roles with direct supervision.
    *   **College appropriate:** Independent project work, leading small initiatives, complex analysis, design, development, or research tasks.

5.  **Time Commitment:**
    *   **High School appropriate:** Flexible schedules around school hours (e.g., evening, weekend, summer-only, part-time during school year).
    *   **College appropriate:** Full-time summer commitments, roles that require significant daytime availability during the academic year.

6.  **Job Title Implications:**
    *   **College-leaning titles:** "Research Assistant," "Engineering Intern," "Software Development Intern," "Business Analyst Intern," "Data Science Intern," or any title explicitly mentioning a specialized field that typically requires college study.
    *   **High School-leaning titles:** "Office Assistant," "Customer Service Representative," "Marketing Assistant," "Summer Intern," "General Intern," "Student Intern" (if no explicit college requirements are present).

**Decision Rule:**
*   If *any* of the "Explicit College Requirements" (point 1) are met, classify as "College".
*   Otherwise, if the job is a general "Internship" or "Assistant" role and does *not* explicitly state any college requirements, classify as "High School".
*   If the job is clearly a professional role (not an internship/assistant) and has no explicit education level, default to "College".

Based on your analysis, determine if this job is more suitable for:
- High School (if NO explicit college requirements are found, and it's a general internship/assistant role)
- College (if ANY explicit college requirements are found, or it's a professional role)

If the information is not explicit and you cannot confidently classify based on the above rules, make a reasonable guess and append " (guessed by AI)" to your answer (e.g., "College (guessed by AI)"). If you cannot make a reasonable guess, return "Unknown".

Return ONLY "High School", "College", "High School (guessed by AI)", "College (guessed by AI)", or "Unknown". Do not add any other text.
`;

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
