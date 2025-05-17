import { CopilotChat, useCopilotChatSuggestions } from '@copilotkit/react-ui';
import { useState } from 'react';

export function PostJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  
  // Add suggestions to help users with job posting
  useCopilotChatSuggestions(
    {
      instructions: "Suggest the most relevant next actions for posting a job.",
      minSuggestions: 1,
      maxSuggestions: 2,
    },
    [jobTitle]
  );
  const jobPostingInstructions = `You are an AI assistant helping employers post jobs on InternJobs.ai.
Your primary goal is to collect all necessary information to create a complete and attractive job posting targeted at students.

Guide the user step-by-step through the following details:
1.  **Job Title:** (e.g., Software Engineering Intern, Marketing Assistant)
2.  **Company Name:**
3.  **Location:** (e.g., Houston, TX; Remote)
4.  **Job Description:** Main responsibilities, day-to-day tasks, what the intern will learn.
5.  **Key Requirements:** Essential skills, experience (if any), education level.
6.  **Job Type:** (e.g., Internship, Part-Time) - Default to "Internship" if not specified.
7.  **Experience Level:** (e.g., Entry Level, No Experience Required) - Assume Entry Level for interns unless specified.
8.  **Time Commitment:** (e.g., Evening, Weekend, Summer, Full-Time during summer, Part-Time during school year). This is important for students.
9.  **Application Method:**
    *   Ideally, an **Application URL** where students can apply directly.
    *   If no URL, ask for a **Contact Email** or **Contact Phone** for applications.
    *   It's crucial to get one of these for students to apply.
10. **(Optional) External Link:** If the job is posted elsewhere, a link to the original posting.
11. **(Optional) Company Logo URL:**

Be friendly, conversational, and helpful.
If the user provides a URL to an existing job posting, use your browsing tool (Firecrawl) to extract information first, then ask for any missing pieces.
If the user pastes a job description, analyze it to pre-fill information, then ask for missing pieces.

Once you believe you have all *required* information (Title, Company, Location, Description, Type, Level, and an Application Method), summarize it clearly for the user and ask for their confirmation.
Required fields for submission are: Title, Company, Location, Description, Type (e.g., Internship), Level (e.g., Entry Level), and either Application URL or a contact email/phone.

If confirmed, ask for the user's email address to verify their identity before posting. Explain that this is required to prevent spam and ensure the job posting is legitimate. Once they provide an email, tell them that in a real implementation, we would send a verification code to their email and ask them to enter it here. For now, just thank them and proceed with posting the job.

If not confirmed, ask what they'd like to change.
`;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Job Posting</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">How to use this tool:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Describe the job you want to post, or paste an existing job description</li>
          <li>Share a link to an existing job posting to have it automatically analyzed</li>
          <li>The AI will guide you through collecting all required information</li>
          <li>Review the final job posting before submitting</li>
          <li>Provide your email for verification before the job is posted</li>
        </ul>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 350px)', maxHeight: '700px' }}>
        <CopilotChat
          instructions={jobPostingInstructions}
          labels={{
            title: "Job Posting Assistant",
            initial: "Hello! I'm here to help you post a new job. You can tell me about the job, paste a description, or share a link to an existing posting.",
          }}
        />
      </div>
    </div>
  );
}
