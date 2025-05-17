// Script to fetch internships from RapidAPI Internships API and store them in Supabase using MCP server
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Initialize dotenv
dotenv.config();

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
  console.log('Fetching all internships from RapidAPI for Houston...');
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
          title_filter: 'intern OR internship OR "high school" OR "summer job"',
          location_filter: 'Houston', // Location filter set to Houston as per user request
          description_filter: 'student OR "high school" OR college OR intern',
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
  console.log(`Total internships fetched for Houston: ${allInternships.length}`);
  return allInternships;
}

// Function to filter internships (now primarily for student-friendliness as location is in API query)
function filterInternships(internships) {
  console.log('Filtering internships for student-friendliness...');
  
  // Location filter is now primarily handled by the API query parameter.
  // We can add a stricter client-side filter if needed, but let's rely on the API first.
  // Filter for student-friendly internships
  const studentInternships = internships.filter(internship => {
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
function mapInternshipToJobSchema(internship) {
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
  
  return {
    title: internship.title || 'Untitled Internship',
    company: company,
    location: location,
    description: description,
    requirements: [],
    type: 'Internship',
    level: 'High School',
    applicants: 0,
    posted_at: postedAt,
    external_link: applicationUrl,
    company_logo: companyLogo,
    employer_id: '00000000-0000-0000-0000-000000000000', // System user ID for API-sourced jobs
    application_url: applicationUrl,
    time_commitment: determineTimeCommitment(internship),
    source: 'RapidAPI',
    career_site_url: careerSiteUrl
  };
}

// Function to determine time commitment based on internship data
function determineTimeCommitment(internship) {
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
      onConflict: 'title,company,location', // Assumes a unique constraint
      ignoreDuplicates: true 
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
    console.log('No internships found from RapidAPI for Houston. Exiting.');
    return;
  }
  
  const filteredInternships = filterInternships(internships);
  
  if (filteredInternships.length === 0) {
    console.log('No matching student-friendly internships found after filtering. Exiting.');
    return;
  }
  
  const jobsToInsert = filteredInternships.map(mapInternshipToJobSchema);
  await insertJobsToSupabase(jobsToInsert); 
  
  console.log('RapidAPI Internships fetch script completed successfully.');
}

// Run the script
main().catch(error => {
  console.error('Unexpected error in main function:', error);
});
