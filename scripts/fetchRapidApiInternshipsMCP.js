// Script to fetch internships from RapidAPI Internships API and store them in Supabase using MCP server
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getEducationLevelParser } from '../src/lib/educationLevelParser.ts';
import { getTimeCommitmentParser } from '../src/lib/timeCommitmentParser.ts';

// Initialize parsers
const educationLevelParser = getEducationLevelParser();
const timeCommitmentParser = getTimeCommitmentParser();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';
let supabase;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
} else {
  console.error('Supabase URL or Service Role Key is not configured. Script cannot interact with Supabase.');
  // process.exit(1); // Optionally exit if Supabase connection is critical
}


// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get RapidAPI credentials from environment variables
const rapidApiKey = process.env.RAPIDAPI_INTERNSHIPS_KEY;
const rapidApiHost = process.env.RAPIDAPI_INTERNSHIPS_HOST;

// Function to fetch internships from RapidAPI
async function fetchInternships() {
  console.log('Fetching all internships from RapidAPI for Texas...');
  if (!rapidApiKey || !rapidApiHost) {
    console.error('RapidAPI Key or Host is not configured in environment variables.');
    return [];
  }

  let allInternships = [];
  let currentOffset = 0;
  // const pageSize = 50; // API example uses 10, let's try a larger size if supported, otherwise API might cap it.
  let keepFetching = true;
  let page = 1;

  while (keepFetching) {
    console.log(`Fetching page ${page} with offset ${currentOffset}...`);
    try {
      const options = {
        method: 'GET',
        url: `https://${rapidApiHost}/active-jb-7d`,
        params: {
          title_filter: '"high school" (intern OR internship OR "summer job")',
          location_filter: 'Texas', 
          description_filter: '"high school" (student OR college OR intern)',
          description_type: 'text',
          offset: currentOffset,
        },
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost
        }
      };
      const response = await axios.request(options);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Received ${response.data.length} internships on page ${page}.`);
        allInternships = allInternships.concat(response.data);
        currentOffset += response.data.length; 
        page++;
        if (response.data.length < 10) { // Heuristic based on observed API behavior / example
             console.log('Likely fetched all available jobs for the current filter (received less than 10 items).');
             keepFetching = false;
        }
      } else {
        console.log(`No more internships found on page ${page} or unexpected response.`);
        keepFetching = false; 
      }
    } catch (error) {
      console.error(`Error fetching internships from RapidAPI on page ${page}:`, error.response ? error.response.data : error.message);
      keepFetching = false; 
    }
  }
  console.log(`Total internships fetched for Texas: ${allInternships.length}`);
  return allInternships;
}

// Function to filter internships for student-friendliness and Texas location
function filterInternships(internships) {
  console.log('Filtering internships for student-friendliness and Texas location...');
  
  // First filter for Texas location
  const texasInternships = internships.filter(internship => {
    const location = (internship.locations_derived && internship.locations_derived.length > 0) 
      ? internship.locations_derived[0].toLowerCase() 
      : (internship.location || '').toLowerCase();
    
    return location.includes('texas') || location.includes('tx');
  });
  
  console.log(`Found ${texasInternships.length} Texas internships out of ${internships.length} total`);
  
  // Then filter for student-friendly internships
  const studentInternships = texasInternships.filter(internship => {
    const title = (internship.title || '').toLowerCase();
    const description = (internship.description || '').toLowerCase();
    
    return (
      title.includes('student') || 
      description.includes('student') ||
      title.includes('summer') || 
      description.includes('summer') ||
      title.includes('intern') || 
      description.includes('intern') ||
      title.includes('high school') || 
      description.includes('high school') ||
      title.includes('highschool') || 
      description.includes('highschool') ||
      title.includes('college') || 
      description.includes('college')
    );
  });
  
  console.log(`Found ${studentInternships.length} student-friendly internships in the US`);
  return studentInternships;
}

// Function to map RapidAPI internship data to our database schema
async function mapInternshipToJobSchema(internship) {
  // Extract location from the API data
  let location = 'United States';
  if (internship.locations_derived && internship.locations_derived.length > 0) {
    location = internship.locations_derived[0];
  }
  
  // Extract description from the API response
  let description = internship.description_text || 'No description provided. Please visit the application link for more details.';
  
  // Extract company name
  const company = internship.organization || 'Unknown Company';
  
  // Extract logo URL
  const companyLogo = internship.organization_logo || null;
  
  // Extract application URL
  const applicationUrl = internship.url || null;
  
  // Extract career site URL
  const careerSiteUrl = internship.linkedin_org_url || null;
  
  // Extract posted date
  const postedAt = internship.date_posted || new Date().toISOString();
  
  // Use AI to determine education level and time commitment
  console.log(`Analyzing job: ${internship.title}`);
  
  // Prepare job data for analysis
  const jobData = {
    title: internship.title || 'Untitled Internship',
    description: description,
    company: company,
    location: location
  };
  
  // Determine education level using AI
  let educationLevel;
  try {
    educationLevel = await educationLevelParser.parseEducationLevelFromText(
      jobData.title,
      jobData.description,
      []
    );
    console.log(`Determined education level for "${jobData.title}": ${educationLevel}`);
  } catch (error) {
    console.error(`Error determining education level for "${jobData.title}":`, error);
    educationLevel = null;
  }
  
  // Determine time commitment using AI
  let timeCommitment;
  try {
    timeCommitment = await timeCommitmentParser.parseTimeCommitmentFromText(
      jobData.title,
      jobData.description,
      []
    );
    console.log(`Determined time commitment for "${jobData.title}": ${timeCommitment || 'Unknown'}`);
  } catch (error) {
    console.error(`Error determining time commitment for "${jobData.title}":`, error);
    timeCommitment = null;
  }
  
  // Fall back to simple determination if AI fails
  if (!timeCommitment) {
    timeCommitment = determineTimeCommitmentSimple(internship);
  }
  
  return {
    title: internship.title || 'Untitled Internship',
    company: company,
    location: location,
    description: description,
    requirements: [],
    type: 'Internship',
    level: 'Entry Level',
    applicants: 0,
    posted_at: postedAt,
    external_link: applicationUrl,
    company_logo: companyLogo,
    employer_id: '00000000-0000-0000-0000-000000000000', // System user ID for API-sourced jobs
    application_url: applicationUrl,
    time_commitment: timeCommitment,
    education_level: educationLevel,
    source: 'RapidAPI',
    career_site_url: careerSiteUrl
  };
}

// Simple function to determine time commitment based on internship data (fallback method)
function determineTimeCommitmentSimple(internship) {
  const title = (internship.title || '').toLowerCase();
  const descriptionText = (internship.description_text || '').toLowerCase();
  
  if (title.includes('summer') || descriptionText.includes('summer')) {
    return 'Summer';
  } else if (title.includes('weekend') || descriptionText.includes('weekend') || descriptionText.includes('saturday') || descriptionText.includes('sunday')) {
    return 'Weekend';
  } else if (title.includes('evening') || descriptionText.includes('evening') || descriptionText.includes('after school') || descriptionText.includes('after-school')) {
    return 'Evening';
  } else {
    return null; // Default to null if time commitment can't be determined
  }
}

// Function to insert internships into the database using supabase-js
async function insertJobsToSupabase(jobs) {
  if (!supabase) {
    console.error('Supabase client not initialized. Skipping job insertion.');
    return;
  }
  if (jobs.length === 0) {
    console.log('No new jobs to insert.');
    return;
  }
  console.log(`Attempting to insert/upsert ${jobs.length} jobs into Supabase...`);

  const { data, error } = await supabase
    .from('jobs')
    .upsert(jobs, {
      onConflict: 'title,company,location', // Match the actual unique constraint
      ignoreDuplicates: false // Ensure existing records are updated
    });

  if (error) {
    console.error('Error upserting jobs to Supabase:', error);
  } else {
    console.log(`Successfully processed upsert for ${jobs.length} jobs. Result data length: ${data ? data.length : 'N/A'}`);
  }
}

// Function to delete old RapidAPI jobs from the database using supabase-js
async function deleteOldRapidApiJobs() {
  if (!supabase) {
    console.error('Supabase client not initialized. Skipping deletion of old jobs.');
    return;
  }
  console.log('Deleting old RapidAPI jobs (older than 2 months) from the database...');
  
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('source', 'RapidAPI')
      .lt('posted_at', twoMonthsAgo.toISOString());

    if (error) {
      console.error('Error deleting old RapidAPI jobs from Supabase:', error);
    } else {
      console.log('Successfully deleted old RapidAPI jobs.');
    }
  } catch (error) {
    console.error('Exception during deleteOldRapidApiJobs:', error);
  }
}


// Main function to run the script
async function main() {
  console.log('Starting RapidAPI Internships fetch script...');
  
  if (!supabase) {
    console.log('Supabase client not initialized. Exiting script.');
    return;
  }

  await deleteOldRapidApiJobs();

  const internships = await fetchInternships(); 
  
  if (internships.length === 0) {
    console.log('No internships found from RapidAPI for Texas. Exiting.');
    return;
  }
  
  const filteredInternships = filterInternships(internships);
  
  if (filteredInternships.length === 0) {
    console.log('No matching student-friendly internships found after filtering. Exiting.');
    return;
  }
  
  console.log('Mapping internships to job schema and classifying them...');
  const jobsToInsert = [];
  
  // Process each internship sequentially to allow for AI classification
  for (let i = 0; i < filteredInternships.length; i++) {
    try {
      const job = await mapInternshipToJobSchema(filteredInternships[i]);
      jobsToInsert.push(job);
      
      // Add a small delay to avoid rate limiting on AI services
      if (i < filteredInternships.length - 1) { // No delay after the last item
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error mapping internship ${i} to job schema:`, error);
    }
  }

  const deduplicatedJobsToInsert = deduplicateJobsArray(jobsToInsert);
  console.log(`After deduplication, ${deduplicatedJobsToInsert.length} unique jobs to upsert.`);

  await insertJobsToSupabase(deduplicatedJobsToInsert); 
  
  console.log('RapidAPI Internships fetch script completed successfully.');
}

// Run the script
main().catch(error => {
  console.error('Unexpected error in main function:', error);
});

// Helper function to deduplicate jobs based on title, company, and location
function deduplicateJobsArray(jobs) {
  const uniqueJobs = [];
  const seenKeys = new Set();
  for (const job of jobs) {
    const key = `${job.title}|${job.company}|${job.location}`;
    if (!seenKeys.has(key)) {
      uniqueJobs.push(job);
      seenKeys.add(key);
    } else {
      console.log(`Duplicate job found and removed from batch: ${job.title} at ${job.company} in ${job.location}`);
    }
  }
  return uniqueJobs;
}
