import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner'; // Keep if needed for CopilotChat interactions or errors
// import { supabase } from '../lib/supabase'; // Supabase interactions will be handled by backend tools
import { useAuth } from '../contexts/AuthContext';
import { CopilotChat } from '@copilotkit/react-ui';
// import type { Job } from '../types'; // Job type might be used by backend tools

export function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Most of the old state will be managed by CopilotKit or backend tools

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

If confirmed, inform the user you will proceed to post the job. The actual submission will be handled by a tool.
If not confirmed, ask what they'd like to change.
`;

  // TODO: Implement actual job submission logic via a CopilotKit tool on the backend.
  // This tool would take the final jobData and save it to Supabase.

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Job Posting</h1>
      
      {/* 
        The CopilotKitProvider is now in App.tsx.
        We just need to use CopilotChat here.
      */}
      <div style={{ height: 'calc(100vh - 250px)', maxHeight: '700px', display: 'flex', flexDirection: 'column' }}>
        <CopilotChat 
          labels={{
            title: "Job Posting Assistant",
            initial: "Hello! I'm here to help you post a new job. You can tell me about the job, paste a description, or share a link to an existing posting.",
          }}
          instructions={jobPostingInstructions}
          // We will need to configure tools (Firecrawl, Supabase submission) in the backend runtime.
          // The CopilotChat component will then be able to leverage them.
        />
      </div>
    </div>
  );
}
