// Netlify Scheduled Function to fetch internships daily from RapidAPI
// and store them in Supabase using the supabase-js client.

import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getEducationLevelParser } from '../../src/lib/educationLevelParser.js';
import { getTimeCommitmentParser } from '../../src/lib/timeCommitmentParser.js';

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

async function fetchInternshipsFromRapidAPI() {
  console.log('Fetching internships from RapidAPI for Texas (simple mode)...');
  if (!rapidApiKey || !rapidApiHost) {
    console.error('RapidAPI Key or Host is not configured in environment variables.');
    return [];
  }
  if (!supabase) {
    console.error('Supabase client not initialized. Cannot fetch new jobs without DB access for potential storage.');
    return [];
  }

  try {
    const options = {
      method: 'GET',
      url: `https://${rapidApiHost}/active-jb-7d`,
      params: {
        location_filter: 'Texas'
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    };
    const response = await axios.request(options);
    if (response.data && Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} internships from RapidAPI.`);
      return response.data;
    } else {
      console.log('No internships found or unexpected response.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching internships from RapidAPI:', error.response ? error.response.data : error.message);
    return [];
  }
}

function filterFetchedInternships(internships) {
  console.log('Filtering fetched internships for Texas location and student-friendliness...');
  
  // First filter for Texas location
  const texasInternships = internships.filter(internship => {
    const location = (internship.locations_derived && internship.locations_derived.length > 0) 
      ? internship.locations_derived[0].toLowerCase() 
      : (internship.location || '').toLowerCase();
    
    return location.includes('texas') || location.includes('tx');
  });
  
  console.log(`Found ${texasInternships.length} Texas internships out of ${internships.length} total`);
  
  // Then filter for student-friendly internships
  return texasInternships.filter(internship => {
    const title = (internship.title || '').toLowerCase();
    const description = (internship.description || '').toLowerCase();
    return (
      title.includes('student') || description.includes('student') ||
      title.includes('summer') || description.includes('summer') ||
      title.includes('intern') || description.includes('intern') ||
      title.includes('high school') || description.includes('high school') ||
      title.includes('highschool') || description.includes('highschool') ||
      title.includes('college') || description.includes('college')
    );
  });
}

function mapToJobSchema(internship, educationLevel, timeCommitment) {
  let location = 'Houston, TX, USA'; 
  if (internship.locations_derived && internship.locations_derived.length > 0) {
    const specificLocation = internship.locations_derived[0];
    if (specificLocation.toLowerCase().includes('houston')) {
      location = specificLocation;
    }
  } else if (internship.location && internship.location.toLowerCase().includes('houston')) {
     location = internship.location;
  }

  return {
    title: internship.title || 'Untitled Internship',
    company: internship.organization || 'Unknown Company',
    location: location,
    description: internship.description_text || 'No description provided.',
    requirements: [],
    type: 'Internship',
    level: 'Entry Level', 
    applicants: 0,
    posted_at: internship.date_posted || new Date().toISOString(),
    external_link: internship.url || null,
    company_logo: internship.organization_logo || null,
    employer_id: '00000000-0000-0000-0000-000000000000', 
    application_url: internship.url || null,
    time_commitment: timeCommitment,
    education_level: educationLevel,
    source: 'RapidAPI',
    career_site_url: internship.linkedin_org_url || null
  };
}

async function insertJobsToSupabase(jobs) {
  if (!supabase) {
    console.error('Supabase client not initialized. Skipping insertJobsToSupabase.');
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
      onConflict: 'title,company',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error upserting jobs to Supabase:', error);
  } else {
    console.log(`Successfully processed upsert for ${jobs.length} jobs. Result data length: ${data ? data.length : 'N/A'}`);
  }
}

export const handler = async (event, context) => {
  console.log('Netlify Scheduled Function "fetch-daily-jobs" starting...');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase environment variables not fully configured.');
    return { statusCode: 500, body: 'Server configuration error: Supabase credentials missing.' };
  }
  if (!rapidApiKey || !rapidApiHost) {
    console.error('RapidAPI environment variables not fully configured.');
    return { statusCode: 500, body: 'Server configuration error: RapidAPI credentials missing.' };
  }
  if (!supabase) {
     console.error('Supabase client failed to initialize. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
     return { statusCode: 500, body: 'Server configuration error: Supabase client init failed.'};
  }

  try {
    await deleteOldJobs();
    const rawInternships = await fetchInternshipsFromRapidAPI();

    if (rawInternships.length === 0) {
      console.log('No new internships fetched from RapidAPI for Texas.');
      return { statusCode: 200, body: 'No new internships fetched.' };
    }

    const studentFriendlyInternships = filterFetchedInternships(rawInternships);
    if (studentFriendlyInternships.length === 0) {
      console.log('No student-friendly internships after filtering.');
      return { statusCode: 200, body: 'No student-friendly internships found.' };
    }

    // AI parsing/classification step
    const jobsToInsert = [];
    for (const internship of studentFriendlyInternships) {
      let educationLevel = null;
      let timeCommitment = null;
      try {
        educationLevel = await educationLevelParser.parseEducationLevelFromText(
          internship.title || '',
          internship.description_text || internship.description || '',
          []
        );
      } catch (e) {
        console.error(`Error classifying education level for "${internship.title}":`, e);
      }
      try {
        timeCommitment = await timeCommitmentParser.parseTimeCommitmentFromText(
          internship.title || '',
          internship.description_text || internship.description || '',
          []
        );
      } catch (e) {
        console.error(`Error classifying time commitment for "${internship.title}":`, e);
      }
      jobsToInsert.push(mapToJobSchema(internship, educationLevel, timeCommitment));
    }
    await insertJobsToSupabase(jobsToInsert);

    console.log('Netlify Scheduled Function "fetch-daily-jobs" completed successfully.');
    return {
      statusCode: 200,
      body: `Successfully processed jobs. Fetched: ${rawInternships.length}, Filtered: ${studentFriendlyInternships.length}, Attempted to upsert: ${jobsToInsert.length}.`,
    };
  } catch (error) {
    console.error('Error in Netlify Scheduled Function "fetch-daily-jobs":', error);
    return {
      statusCode: 500,
      body: `Error in scheduled function: ${error.message}`,
    };
  }
};

import { pathToFileURL } from 'url';

// This block allows the function to be run directly from the command line for testing
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log('Running fetch-daily-jobs.js directly for testing...');
  handler();
}
