import { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNodeHttpEndpoint } from "@copilotkit/runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../src/lib/supabase"; // Adjust path as needed
import axios from 'axios'; 
import { Readable, PassThrough } from 'stream'; // Import PassThrough

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// No longer needed if streaming directly
// async function streamToString(stream) {
//   const chunks = [];
//   for await (const chunk of stream) {
//     chunks.push(Buffer.from(chunk));
//   }
//   return Buffer.concat(chunks).toString("utf-8");
// }

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

    // const firecrawlService = getFirecrawlService(); // Not using this for direct API call
    
    const runtime = new CopilotRuntime({
      serviceAdapter, // Pass the adapter to the runtime constructor
      actions: ({ properties }) => { // Define actions generator directly
        const currentUserId = properties?.userId; // Get userId from properties passed by frontend
        return [
        {
          name: "scrapeJobUrl",
          description: "Fetches and scrapes the markdown content of a job posting URL for analysis. Use this if a user provides a URL for a job posting.",
          parameters: [
            { name: "url", type: "string", description: "The URL of the job posting to scrape.", required: true },
          ],
          handler: async ({ url }) => {
            console.log("scrapeJobUrl tool called with URL:", url);
            const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
            if (!firecrawlApiKey) {
              console.error("FIRECRAWL_API_KEY is not set.");
              return "Error: Firecrawl API key is not configured on the server.";
            }
            try {
              const response = await axios.post(
                'https://api.firecrawl.dev/v1/scrape', // Updated to v1
                { 
                  url: url,
                  formats: ["markdown"], // Request markdown format
                  pageOptions: { onlyMainContent: true }
                },
                {
                  headers: {
                    'Authorization': `Bearer ${firecrawlApiKey}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              // Firecrawl's /v0/scrape endpoint returns an object like:
              // { success: true, data: { content: "...", markdown: "...", metadata: {...} } }
              // or { success: false, error: "..." }
              if (response.data && response.data.success && response.data.data && response.data.data.markdown) {
                return response.data.data.markdown;
              } else if (response.data && response.data.success && response.data.data && response.data.data.content) {
                // Fallback to HTML content if markdown is not directly available, though LLM prefers markdown
                return response.data.data.content; 
              } else {
                console.error("Firecrawl API did not return expected markdown/content:", response.data);
                return `Error: Could not extract markdown content from ${url}. Response: ${JSON.stringify(response.data)}`;
              }
            } catch (error) {
              console.error("Error in scrapeJobUrl tool (Firecrawl API call):", error.response ? error.response.data : error.message);
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
            const employer_id = currentUserId || process.env.DEFAULT_EMPLOYER_ID || "00000000-0000-0000-0000-000000000000"; 
            
            if (!employer_id || employer_id === "00000000-0000-0000-0000-000000000000") {
              // If DEFAULT_EMPLOYER_ID is also the placeholder, it means no real user.
              // This check might need refinement based on how unauthenticated users are handled.
              // For now, let's assume a valid employer_id (user) is required.
              // However, the original PostJobPage allowed posting if user was logged in.
              // CopilotKit might not have user context by default unless passed.
              // The frontend now passes it via properties. If currentUserId is null/undefined, it means user is not logged in.
              if (!currentUserId) {
                 return "Error: You must be logged in to post a job. User ID is missing.";
              }
            }

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
      ]; // End of actions array
    }, // End of actions generator function
    });

    // Create a mock req object from the Netlify event
    const mockReq = new Readable();
    mockReq.push(event.body || '{}');
    mockReq.push(null);
    mockReq.method = event.httpMethod;
    mockReq.url = event.path; // Or event.rawUrl which includes query params
    mockReq.headers = event.headers;

    // Define a class that extends PassThrough to better emulate http.ServerResponse
    class MockServerResponse extends PassThrough {
      constructor(options) {
        super(options);
        this._capturedStatusCode = 200;
        this._capturedHeaders = {};
        this._headersSent = false;
      }

      get statusCode() { return this._capturedStatusCode; }
      set statusCode(val) {
        if (this._headersSent) {
          // console.warn("Tried to set statusCode after headers were sent."); // Optional logging
          return;
        }
        this._capturedStatusCode = val;
      }

      get headersSent() { return this._headersSent; }

      setHeader(name, value) {
        if (this._headersSent) { return; }
        this._capturedHeaders[name.toLowerCase()] = value;
      }

      getHeader(name) {
        return this._capturedHeaders[name.toLowerCase()];
      }

      removeHeader(name) {
        if (this._headersSent) { return; }
        delete this._capturedHeaders[name.toLowerCase()];
      }

      writeHead(statusCode, statusMessage, headers) {
        if (this._headersSent) { return; }
        this.statusCode = statusCode;
        let actualHeaders = headers;
        if (typeof statusMessage === 'object' && statusMessage !== null) {
          actualHeaders = statusMessage; // statusMessage is optional, headers can be 2nd arg
        }
        if (actualHeaders) {
          for (const key in actualHeaders) {
            this.setHeader(key, actualHeaders[key]);
          }
        }
        this._headersSent = true;
      }

      // Override write and end to manage _headersSent
      write(...args) {
        if (!this._headersSent) {
          this._headersSent = true;
        }
        return super.write(...args);
      }

      end(...args) {
        if (!this._headersSent) {
          this._headersSent = true;
        }
        return super.end(...args);
      }
    }

    const mockRes = new MockServerResponse();

    const copilotKitEndpointHandler = copilotRuntimeNodeHttpEndpoint({
      runtime, 
      serviceAdapter, 
      endpoint: '/.netlify/functions/copilotkit-runtime',
    });

    copilotKitEndpointHandler(mockReq, mockRes);

    return {
      statusCode: mockRes.statusCode,
      headers: mockRes._capturedHeaders, // Use the internal storage for headers
      body: mockRes, // mockRes is the stream
      isBase64Encoded: false,
    };

  } catch (error) {
    console.error("Error in CopilotKit runtime function:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
