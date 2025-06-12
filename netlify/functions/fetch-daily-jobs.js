// Netlify Scheduled Function to fetch internships daily from RapidAPI
// and store them in Supabase using the supabase-js client.

import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getEducationLevelParser } from '../../src/lib/educationLevelParser.js';
import { getTimeCommitmentParser } from '../../src/lib/timeCommitmentParser.js';
import pLimit from 'p-limit';

// Initialize dotenv to load environment variables (primarily for local testing if any)
// Netlify build process should make these available in the function's environment
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Get RapidAPI credentials from environment variables
const rapidApiKey = process.env.RAPIDAPI_INTERNSHIPS_KEY;
const rapidApiHost = process.env.RAPIDAPI_INTERNSHIPS_HOST;

// Initialize Supabase client
let supabase;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false // Recommended for server-side operations
    }
  });
} else {
  console.error('Supabase URL or Service Role Key is not configured in environment variables. Function will not be able to connect to Supabase.');
}

const educationLevelParser = getEducationLevelParser();
const timeCommitmentParser = getTimeCommitmentParser();

async function deleteOldJobs() {
  if (!supabase) {
    console.error('Supabase client not initialized. Skipping deleteOldJobs.');
    return;
  }
  console.log('Attempting to delete all jobs older than 2 months...');
  // Calculate date 2 months ago
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .lt('posted_at', twoMonthsAgo.toISOString());
    if (error) {
      console.error('Error deleting old jobs from Supabase:', error);
    } else {
      console.log('Successfully deleted all jobs older than 2 months.');
    }
  } catch (error) {
    console.error('Exception during deleteOldJobs:', error);
  }
}

async function fetchPage(offset) {
  try {
    const options = {
      method: 'GET',
      url: `https://${rapidApiHost}/active-jb-7d`,
      params: {
        location_filter: 'United States',
        description_type: 'text',
        offset: offset
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    };
    const response = await axios.request(options);
    if (response.data && Array.isArray(response.data)) {
      console.log(`Fetched ${response.data.length} jobs from RapidAPI (offset ${offset})`);
      return response.data;
    } else {
      console.log(`No jobs found or unexpected response at offset ${offset}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching jobs from RapidAPI (offset ${offset}):`, error.response ? error.response.data : error.message);
    return [];
  }
}

function rulePreTag(job) {
  // Improved rule-based tagging for high school and college jobs
  const title = job.title?.toLowerCase() || '';
  const description = job.description?.toLowerCase() || '';

  // High School: flexible schedule, simple tasks, no college mention
  const highSchoolKeywords = [
    'high school', 'evening', 'weekend', 'after school', 'summer only', 'part-time', 'camp counselor', 'retail', 'food service', 'office assistant', 'student assistant', 'helper', 'cashier', 'lifeguard', 'babysitter', 'tutor', 'receptionist', 'host', 'hostess', 'crew member', 'barista', 'busser', 'dishwasher', 'grocery', 'store associate', 'delivery', 'runner', 'usher', 'movie theater', 'library assistant', 'summer intern', 'general intern', 'student intern'
  ];
  const collegeKeywords = [
    'college', 'university', 'bachelor', 'research', 'engineering', 'software', 'developer', 'programming', 'analysis', 'analyst', 'lab', 'project management', 'business', 'finance', 'marketing intern', 'data science', 'graduate', 'junior', 'senior', 'major', 'gpa', 'field of study', 'degree', 'enrolled', 'academic', 'professional', 'technical', 'design', 'consulting', 'audit', 'accounting', 'legal', 'law', 'medical', 'clinical', 'pharmacy', 'biotech', 'stem', 'internship'
  ];

  // If any high school keyword is present and no college keyword, pretag as High School
  if (highSchoolKeywords.some(k => title.includes(k) || description.includes(k)) &&
      !collegeKeywords.some(k => title.includes(k) || description.includes(k))) {
    return { ...job, education_level: 'High School', pretagged: true };
  }
  // If any college keyword is present, pretag as College
  if (collegeKeywords.some(k => title.includes(k) || description.includes(k))) {
    return { ...job, education_level: 'College', pretagged: true };
  }
  // Default: not pretagged
  return { ...job, pretagged: false };
}

function dedupeByTitleCompany(jobs) {
  const map = new Map();
  for (const job of jobs) {
    const key = `${job.title}|${job.company}`;
    if (!map.has(key)) map.set(key, job);
  }
  return Array.from(map.values());
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function batchLLMTag(jobs) {
  // Simulate LLM tagging in batches of 10
  const tagged = [];
  const failures = [];
  const chunks = chunkArray(jobs, 10);
  for (const chunk of chunks) {
    try {
      // Simulate LLM call: use your existing logic for classification
      for (const job of chunk) {
        // Use your existing AI parser/classification logic here
        // For now, just mark as 'College (guessed by AI)' if not pretagged
        if (!job.pretagged) {
          tagged.push({ ...job, education_level: 'College (guessed by AI)' });
        } else {
          tagged.push(job);
        }
      }
    } catch (e) {
      failures.push(...chunk);
    }
  }
  return { tagged, failures };
}

// Inline hash function for deterministic employer_id from company name
function hashStringToHex(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// Utility: whitelist only schema columns for jobs table
function stripUnknownJobKeys(job) {
  // List only the columns that exist in your jobs table and are needed for the frontend
  const allowed = [
    'id',
    'title',
    'company',
    'location',
    'description',
    'requirements',
    'type',
    'level',
    'education_level',
    'time_commitment',
    'applicants',
    'posted_at',
    'external_link',
    'application_url',
    'company_logo',
    'employer_id',
    'source',
    'career_site_url',
    // keep any other fields you use for analytics/debugging if needed
  ];
  const clean = {};
  for (const k of allowed) {
    if (job[k] !== undefined) clean[k] = job[k];
  }
  return clean;
}

async function upsertJobsBatched(jobs, batchSize = 50) {
  let success = 0;
  let error = 0;
  let failures = [];
  // Strip unknown keys from all jobs before batching
  const jobsClean = jobs.map(stripUnknownJobKeys);
  const batches = chunkArray(jobsClean, batchSize);
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const { data, error: upsertError } = await supabase
      .from('jobs')
      .upsert(batch, { onConflict: 'title,company' });
    if (upsertError) {
      console.error(`Error upserting batch ${i + 1}:`, upsertError);
      failures.push(...batch);
      error += batch.length;
    } else {
      console.log(`Batch ${i + 1} upserted successfully (${batch.length} jobs).`);
      success += batch.length;
    }
  }
  return { success, error, failures };
}

function mapToJobSchema(internship, educationLevel, timeCommitment) {
  console.log('DEBUG internship object:', internship); // Debug log
  let location = null;
  if (internship.locations_derived && internship.locations_derived.length > 0) {
    location = internship.locations_derived[0];
  } else if (internship.location) {
    location = internship.location;
  } else if (
    internship.cities_derived && internship.cities_derived.length > 0 &&
    internship.regions_derived && internship.regions_derived.length > 0 &&
    internship.countries_derived && internship.countries_derived.length > 0
  ) {
    location = `${internship.cities_derived[0]}, ${internship.regions_derived[0]}, ${internship.countries_derived[0]}`;
  } else {
    location = 'United States';
  }

  return {
    title: internship.title || 'Untitled Internship',
    company: internship.organization || 'Unknown Company',
    location: location,
    description: internship.description_text || internship.description || 'No description provided.',
    requirements: [],
    type: 'internship',
    level: internship.level || 'Entry Level',
    applicants: 0,
    posted_at: internship.date_posted || new Date().toISOString(),
    external_link: internship.url || null,
    company_logo: internship.organization_logo || null,
    employer_id: hashStringToHex(internship.organization || internship.company || 'unknown'),
    application_url: internship.url || null,
    time_commitment: timeCommitment,
    education_level: educationLevel,
    source: 'RapidAPI',
    career_site_url: internship.linkedin_org_url || null
  };
}

function getJobUniqueKey(job) {
  // Use title + company + location as a unique key
  return `${job.title}::${job.company}::${job.location}`;
}

function deduplicateJobs(jobs) {
  const seen = new Set();
  const uniqueJobs = [];
  for (const job of jobs) {
    const key = getJobUniqueKey(job);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }
  return uniqueJobs;
}

function getYesterdayISOString() {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() - 24);
  return now.toISOString().split('.')[0]; // Remove milliseconds for API
}

// Main handler
export async function handler() {
  const isInitialImport = process.env.INITIAL_IMPORT === 'true';
  const pageCount = isInitialImport ? 500 : 100;
  const jobsTarget = isInitialImport ? 5000 : 1000;
  const mode = isInitialImport ? 'INITIAL IMPORT' : 'DAILY INCREMENTAL';
  console.log(`Starting full pipeline in ${mode} mode: targeting ~${jobsTarget} jobs (${pageCount} pages)...`);

  const limit = pLimit(10);
  const fetchPromises = [];
  for (let i = 0; i < pageCount; i++) {
    const params = {
      location_filter: 'United States',
      description_type: 'text',
      offset: i * 10
    };
    if (!isInitialImport) {
      params.date_filter = getYesterdayISOString();
    }
    fetchPromises.push(limit(() => fetchPageWithParams(params)));
  }
  const allPages = await Promise.all(fetchPromises);
  const allJobsRaw = allPages.flat();
  console.log(`Fetched total ${allJobsRaw.length} jobs from RapidAPI.`);

  // Map to job schema and rule pre-tag
  const jobsMapped = allJobsRaw.map(j => rulePreTag(mapToJobSchema(j, null, null)));

  // Batch LLM tagging for jobs not pretagged
  const pretagged = jobsMapped.filter(j => j.pretagged);
  const toLLM = jobsMapped.filter(j => !j.pretagged);
  const { tagged: llmTagged, failures: llmFailures } = await batchLLMTag(toLLM);
  const allTagged = [...pretagged, ...llmTagged];
  console.log(`Tagged jobs: ${allTagged.length} (pretagged: ${pretagged.length}, LLM: ${llmTagged.length}, LLM failures: ${llmFailures.length})`);

  // Deduplicate by title+company
  const uniqueJobs = dedupeByTitleCompany(allTagged);
  console.log(`Deduplicated jobs: ${uniqueJobs.length}`);

  // Upsert in batches
  const { success, error, failures: upsertFailures } = await upsertJobsBatched(uniqueJobs);
  console.log(`Upserted jobs: ${success}, Errors: ${error}`);

  // Simulate dead-letter queue (log failures)
  if (llmFailures.length || upsertFailures.length) {
    console.log('Dead-letter queue (failed jobs):', [...llmFailures, ...upsertFailures].length);
  }
  console.log('Full pipeline complete.');
}

// Helper to fetch with custom params
async function fetchPageWithParams(params) {
  try {
    const options = {
      method: 'GET',
      url: `https://${rapidApiHost}/active-jb-7d`,
      params,
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    };
    const response = await axios.request(options);
    if (response.data && Array.isArray(response.data)) {
      console.log(`Fetched ${response.data.length} jobs from RapidAPI (offset ${params.offset})`);
      return response.data;
    } else {
      console.log(`No jobs found or unexpected response at offset ${params.offset}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching jobs from RapidAPI (offset ${params.offset}):`, error.response ? error.response.data : error.message);
    return [];
  }
}

import { pathToFileURL } from 'url';

// This block allows the function to be run directly from the command line for testing
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log('Running fetch-daily-jobs.js directly for testing...');
  handler();

  // TEST: Fetch from RapidAPI and log the number of results (no filtering)
  (async () => {
    const rawResults = await fetchPage(0);
    console.log('TEST: Number of jobs returned from RapidAPI:', rawResults.length);
    if (rawResults.length > 0) {
      console.log('TEST: Titles of jobs returned:', rawResults.map(j => j.title));
    }
  })();
}
