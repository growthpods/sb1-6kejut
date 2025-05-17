import { CopilotRuntime, GoogleGenerativeAIAdapter } from "@copilotkit/runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../src/lib/supabase"; // Adjust path as needed
// For Firecrawl, we need a way to call it from Node.js.
// The existing FirecrawlService uses window.mcpRequest or mock.
// For a real implementation, we'd need direct API access or a Node.js client for Firecrawl.
// For now, let's import the service and see if we can adapt or mock it.
import { getFirecrawlService } from "../../src/lib/firecrawl"; // Adjust path

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Helper to convert ReadableStream to string for Netlify response
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set.");
    return { statusCode: 500, body: "Server configuration error: GEMINI_API_KEY missing." };
  }

  try {
    new GoogleGenerativeAI(geminiApiKey); // Initializes auth for the package

    const serviceAdapter = new GoogleGenerativeAIAdapter({
      model: "gemini-2.0-flash",
    });

    const firecrawlService = getFirecrawlService();

    const runtime = new CopilotRuntime({
      actions: [
        {
          name: "scrapeJobUrl",
          description: "Fetches and scrapes the content of a job posting URL to extract its text content for analysis. Use this if a user provides a URL for a job posting.",
          parameters: [
            { name: "url", type: "string", description: "The URL of the job posting to scrape.", required: true },
          ],
          handler: async ({ url }) => {
            console.log("scrapeJobUrl tool called with URL:", url);
            try {
              // This will use mock data if window.mcpRequest is not available,
              // which will be the case in Netlify function.
              // TODO: Replace with a direct Firecrawl API call if possible from Node.js backend.
              const scrapeResult = await firecrawlService.scrapeJobListing(url); // This returns ScrapedJobData, not raw markdown
              // The LLM likely expects raw text. Let's return the description part or a combined text.
              // For now, returning the mock content structure or a simplified version.
              // The original FirecrawlService's scrapeJobListing calls parseJobContent.
              // Let's assume the LLM can work with the ScrapedJobData object structure.
              // Or, more simply, the tool should just return the raw markdown if that's what the LLM is trained to process.
              // The current firecrawlService.scrapeJobListing returns parsed data, not raw markdown.
              // Let's modify the tool to reflect that it returns structured data, or get raw markdown.
              // For now, let's assume it returns a string of the description for simplicity.
              // This needs to align with how the LLM will use the scraped data.
              // A better approach: the tool returns the raw markdown, and the LLM processes it.
              // The current `firecrawlService.scrapeJobListing` doesn't directly give raw markdown if it parses.
              // Let's assume we want the tool to return the main text content.
              // The `callFirecrawlMcp` in the service with `formats: ['markdown']` should give markdown.
              // The issue is `callFirecrawlMcp` uses mock if not in Claude env.
              // For a real backend tool, this needs a proper HTTP client for Firecrawl API.
              // For now, it will return mock data.
              if (scrapeResult && scrapeResult.description) {
                return `Scraped content for ${url}:\nTitle: ${scrapeResult.title}\nCompany: ${scrapeResult.company}\nLocation: ${scrapeResult.location}\nDescription: ${scrapeResult.description}`;
              }
              return `Could not scrape content from ${url}. (Currently using mock data in this environment if not in Claude).`;

            } catch (error) {
              console.error("Error in scrapeJobUrl tool:", error);
              return `Error scraping URL ${url}: ${error.message}`;
            }
          },
        },
        {
          name: "submitJobPosting",
          description: "Submits the finalized job posting details to the database.",
          parameters: [ // This needs to match the Job type structure or what the LLM will provide
            { name: "title", type: "string", description: "Job title", required: true },
            { name: "company", type: "string", description: "Company name", required: true },
            { name: "location", type: "string", description: "Job location", required: true },
            { name: "description", type: "string", description: "Job description", required: true },
            { name: "jobType", type: "string", description: "Type of job (e.g., Internship, Part-Time)", required: true }, // Renamed from 'type' to avoid conflict
            { name: "level", type: "string", description: "Experience level (e.g., Entry Level)", required: true },
            { name: "timeCommitment", type: "string", description: "Time commitment (e.g., Summer, Evening)", required: false },
            { name: "applicationUrl", type: "string", description: "URL to apply for the job", required: false },
            { name: "contactEmail", type: "string", description: "Contact email for applications", required: false },
            { name: "contactPhone", type: "string", description: "Contact phone for applications", required: false },
            { name: "externalLink", type: "string", description: "Original posting link, if any", required: false },
            { name: "companyLogoUrl", type: "string", description: "URL of the company logo", required: false },
            // TODO: Add requirements array if CopilotKit supports array types for parameters
            // { name: "requirements", type: "array", items: { type: "string" }, description: "Job requirements", required: false },
            // For now, assume requirements are part of the main description handled by LLM.
          ],
          handler: async (args) => {
            console.log("submitJobPosting tool called with args:", args);
            // TODO: Get authenticated user ID. This needs to be passed securely.
            // For now, using a placeholder or assuming it's part of args if passed from frontend context.
            const employer_id = args.userId || process.env.DEFAULT_EMPLOYER_ID || "00000000-0000-0000-0000-000000000000"; 
            
            if (!args.applicationUrl && !args.contactEmail && !args.contactPhone) {
              return "Job posting failed: An application method (URL, email, or phone) is required.";
            }

            const jobToInsert = {
              title: args.title,
              company: args.company,
              location: args.location,
              description: args.description,
              type: args.jobType, // Ensure this matches DB schema or map it
              level: args.level,
              time_commitment: args.timeCommitment || null,
              application_url: args.applicationUrl || null,
              contact_email: args.contactEmail || null, // Assuming these columns exist
              contact_phone: args.contactPhone || null, // Assuming these columns exist
              external_link: args.externalLink || null,
              company_logo: args.companyLogoUrl || null,
              employer_id: employer_id, 
              posted_at: new Date().toISOString(),
              source: 'CopilotKit Post', // Indicate source
              // requirements: args.requirements || [], // If requirements become a separate field
            };

            try {
              const { data, error } = await supabase.from("jobs").insert(jobToInsert).select();
              if (error) throw error;
              console.log("Job inserted successfully:", data);
              return "Job posted successfully! It is now live.";
            } catch (error) {
              console.error("Error inserting job to Supabase:", error);
              return `Error posting job: ${error.message}`;
            }
          },
        },
      ],
      serviceAdapter,
    });

    const requestBody = JSON.parse(event.body || '{}');
    const responseStream = runtime.stream(requestBody); // Pass only requestBody, adapter is in runtime

    // Netlify functions can return a ReadableStream for streaming responses
    // Ensure headers are set correctly for event stream
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
      isBase64Encoded: false,
      body: Readable.from(responseStream), // Convert the stream from CopilotKit if necessary
    };

  } catch (error) {
    console.error("Error in CopilotKit runtime function:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
