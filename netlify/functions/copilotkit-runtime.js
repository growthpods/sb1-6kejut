// Use CommonJS syntax for Netlify Functions
const { CopilotRuntime, GoogleGenerativeAIAdapter } = require("@copilotkit/runtime");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { supabase } = require('./lib/supabase-server'); // Use server-side Supabase client
const axios = require('axios');
const { Readable, PassThrough } = require('stream');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not set.");
    return { statusCode: 500, body: "Server configuration error: GEMINI_API_KEY missing." };
  }

  try {
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Create the service adapter with the Gemini model
    const serviceAdapter = new GoogleGenerativeAIAdapter({
      model: "gemini-2.0-flash",
      apiKey: geminiApiKey,
    });
    
    // Create the CopilotKit runtime with the service adapter and actions
    const runtime = new CopilotRuntime({
      serviceAdapter,
      actions: ({ properties }) => {
        // Get the user ID from the properties passed by the frontend
        const currentUserId = properties?.userId;
        console.log("Current user ID from properties:", currentUserId);
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
                      // Check the structure of the response and extract the markdown content
              console.log("Firecrawl API response structure:", JSON.stringify(Object.keys(response.data)));
              
              // Handle v1 API response format
              if (response.data && response.data.markdown) {
                return response.data.markdown;
              } 
              // Handle v0 API response format (fallback)
              else if (response.data && response.data.success && response.data.data) {
                if (response.data.data.markdown) {
                  return response.data.data.markdown;
                } else if (response.data.data.content) {
                  return response.data.data.content;
                }
              }
              
              console.error("Firecrawl API did not return expected markdown/content:", response.data);
              return `Error: Could not extract markdown content from ${url}. Response: ${JSON.stringify(response.data)}`;
            } catch (error) {
              console.error("Error in scrapeJobUrl tool (Firecrawl API call):", error.response ? error.response.data : error.message);
              return `Error scraping URL ${url}: ${error.message}`;
            }
          },
        },
        {
          name: "submitJobPosting",
          description: "Submits the finalized job posting details to the database.",
          parameters: [
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
            { name: "employerEmail", type: "string", description: "Email of the employer posting the job (for verification)", required: true },
            // TODO: Add requirements array if CopilotKit supports array types for parameters
            // { name: "requirements", type: "array", items: { type: "string" }, description: "Job requirements", required: false },
            // For now, assume requirements are part of the main description handled by LLM.
          ],
          handler: async (args) => {
            console.log("submitJobPosting tool called with args:", args);
            
            // Check for required fields
            if (!args.title || !args.company || !args.location || !args.description || !args.jobType || !args.level) {
              return "Job posting failed: Missing required fields (title, company, location, description, job type, or experience level).";
            }
            
            // Check for application method
            if (!args.applicationUrl && !args.contactEmail && !args.contactPhone) {
              return "Job posting failed: An application method (URL, email, or phone) is required.";
            }
            
            // Check for employer email (collected during chat)
            if (!args.employerEmail) {
              return "Job posting failed: Employer email is required for verification. Please provide your email address.";
            }
            
            // Use a default employer ID since we're not requiring login
            const employer_id = process.env.DEFAULT_EMPLOYER_ID || "00000000-0000-0000-0000-000000000000";

            const jobToInsert = {
              title: args.title,
              company: args.company,
              location: args.location,
              description: args.description,
              type: args.jobType, // Ensure this matches DB schema or map it
              level: args.level,
              time_commitment: args.timeCommitment || null,
              application_url: args.applicationUrl || null,
              contact_email: args.contactEmail || null,
              contact_phone: args.contactPhone || null,
              external_link: args.externalLink || null,
              company_logo: args.companyLogoUrl || null,
              employer_id: employer_id,
              employer_email: args.employerEmail, // Store the employer's email for verification
              posted_at: new Date().toISOString(),
              source: 'CopilotKit Post',
              // requirements: args.requirements || [], // If requirements become a separate field
            };
            
            console.log("Inserting job with employer email:", args.employerEmail);

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

    // Parse the request body
    const requestBody = JSON.parse(event.body || '{}');
    console.log("Processing request with body:", JSON.stringify(requestBody));
    
    // Handle different types of requests
    if (requestBody.operationName === 'availableAgents') {
      // Return empty agents list for availableAgents query
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            availableAgents: {
              agents: [],
              __typename: "AvailableAgents"
            }
          }
        })
      };
    } else if (requestBody.messages) {
      // Handle chat messages
      try {
        // Create a mock request for the runtime
        const mockReq = {
          body: requestBody,
          headers: event.headers,
        };
        
        // Create a mock response to capture the result
        const mockRes = {
          statusCode: 200,
          headers: {},
          body: '',
          write: function(chunk) {
            this.body += chunk;
            return true;
          },
          end: function() {},
          setHeader: function(name, value) {
            this.headers[name] = value;
          }
        };
        
        // Process the request with the runtime
        await runtime.handleRequest(mockReq, mockRes);
        
        // Return the response
        return {
          statusCode: mockRes.statusCode,
          headers: mockRes.headers,
          body: mockRes.body
        };
      } catch (error) {
        console.error("Error processing chat message:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Error processing chat message" })
        };
      }
    } else {
      // Handle other requests
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" })
      };
    }

  } catch (error) {
    console.error("Error in CopilotKit runtime function:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
}
