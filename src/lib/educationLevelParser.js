/**
 * Education Level Parser
 * Uses Gemini LLM to analyze job descriptions and determine the appropriate education level
 */
import { getGeminiClient } from "./gemini.js";

/**
 * Service for parsing education level from job descriptions
 */
export class EducationLevelParser {
    constructor() {
        this.gemini = getGeminiClient();
    }
    /**
     * Analyze a job description to determine whether it's suitable for high school or college students
     * @param jobData Job data including title, description, requirements, etc.
     * @returns The determined student type: 'High School' or 'College'
     */
    async parseEducationLevel(jobData) {
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
            }
            else if (cleanedResponse.toLowerCase().includes('college')) {
                return 'College';
            }
            else {
                // Default to High School if the response is unclear
                console.warn('Unclear education level response:', cleanedResponse);
                return 'High School';
            }
        }
        catch (error) {
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
    async parseEducationLevelFromText(title, description, requirements, manualOverride) {
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

Please analyze the following aspects carefully:
1. Required education level mentioned (if any). If the job requires a bachelor's degree, college enrollment, or any post-secondary coursework, it is for college students ONLY.
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
   - Jobs requiring specific college coursework, a degree, or enrollment in a bachelor's program are for college students ONLY.
8. Job title implications
   - Titles like "Research Assistant", "Engineering Intern", or any job requiring a degree or college enrollment are for college students ONLY.
   - Titles like "Office Assistant" or "Customer Service Representative" may be suitable for high school students

Based on your analysis, determine if this job is more suitable for:
- High School students (less complex, entry-level, minimal experience required, basic skills)
- College students (more complex, may require specific coursework, higher skill level, specialized knowledge, or any degree requirement)

If the information is not explicit, make a reasonable guess and append " (guessed by AI)" to your answer (e.g., "College (guessed by AI)"). If you cannot make a reasonable guess, return "Unknown".

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
            }
            else if (lowerCleanedResponse === 'college (guessed by ai)') {
                return 'College (guessed by AI)';
            }
            else if (lowerCleanedResponse === 'high school') {
                return 'High School';
            }
            else if (lowerCleanedResponse === 'college') {
                return 'College';
            }
            else if (lowerCleanedResponse === 'unknown') {
                // Log for manual review
                console.warn(`Education level for job '${title}' is Unknown according to LLM. Needs manual review.`);
                return null;
            }
            else {
                // Log for manual review
                console.warn(`Unclear education level response for job '${title}':`, cleanedResponse, '- defaulting to null. Needs manual review.');
                return null;
            }
        }
        catch (error) {
            console.error(`Error parsing education level from text for job '${title}':`, error);
            return null; // Default to null on error
        }
    }
}
// Singleton instance
let educationLevelParser = null;
/**
 * Get the Education Level Parser instance
 */
export function getEducationLevelParser() {
    if (!educationLevelParser) {
        educationLevelParser = new EducationLevelParser();
    }
    return educationLevelParser;
}
