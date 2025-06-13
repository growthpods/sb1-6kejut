import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime';
import { GoogleGenerativeAIAdapter } from '@copilotkit/runtime/ai/google';
import { PassThrough } from 'stream';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.BASE_URL || 'https://internjobs.ai';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ai = new GoogleGenerativeAIAdapter({
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.0-flash',
});

const runtime = new CopilotRuntime({
  ai,
  tools: [
    {
      name: 'scrapeJobUrl',
      description: 'Scrape a job posting from a URL using Firecrawl',
      parameters: {
        url: { type: 'string', description: 'Job posting URL' },
      },
      handler: async ({ url }) => {
        const res = await axios.post(
          'https://api.firecrawl.dev/v1/scrape',
          {
            url,
            formats: ['markdown'],
            pageOptions: { onlyMainContent: true },
          },
          {
            headers: { 'x-api-key': FIRECRAWL_API_KEY },
          }
        );
        return res.data.content || '';
      },
    },
    {
      name: 'sendJobOtpAndPostJob',
      description: 'Send OTP to employer and post job after verification',
      parameters: {
        job: { type: 'object', description: 'Job data' },
        email: { type: 'string', description: 'Employer email' },
        otp: { type: 'string', description: 'OTP code from email', optional: true },
      },
      handler: async ({ job, email, otp }) => {
        if (!otp) {
          // Step 1: Send OTP
          await axios.post(`${BASE_URL}/.netlify/functions/send-job-otp`, { email });
          return 'A verification code has been sent to your email. Please enter the code here to continue.';
        } else {
          // Step 2: Verify OTP and post job
          const verifyRes = await axios.post(`${BASE_URL}/.netlify/functions/post-job`, { job, email, otp });
          if (verifyRes.data && verifyRes.data.success) {
            return 'Your job has been posted successfully!';
          } else {
            return `There was an error posting your job: ${verifyRes.data?.error || 'Unknown error'}`;
          }
        }
      },
    },
  ],
});

export default async function handler(event, context) {
  // Netlify streaming response compatibility
  const mockReq = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body,
  };
  class MockServerResponse extends PassThrough {
    constructor() {
      super();
      this.statusCode = 200;
      this.headers = {};
    }
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    }
    setHeader(key, value) {
      this.headers[key] = value;
    }
    getHeader(key) {
      return this.headers[key];
    }
  }
  const mockRes = new MockServerResponse();
  let responseBody = '';
  mockRes.on('data', (chunk) => {
    responseBody += chunk.toString();
  });
  await copilotRuntimeNodeHttpEndpoint(runtime, mockReq, mockRes);
  return {
    statusCode: mockRes.statusCode,
    headers: mockRes.headers,
    body: responseBody,
  };
} 