// Netlify Scheduled Function to fetch internships daily from RapidAPI
// and store them in Supabase using the supabase-js client.

import axios from 'axios';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

async function deleteOldRapidApiJobs() {
  if (!supabase) {
    console.error('Supabase client not initialized. Skipping deleteOldRapidApiJobs.');
    return;
  }
  console.log('Attempting to delete old RapidAPI jobs (older than 2 months)...');
  
  // Calculate date 2 months ago
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
      // Do not re-throw, allow process to continue to fetching if deletion fails for some reason
    } else {
      console.log('Successfully deleted old RapidAPI jobs.');
    }
  } catch (error) {
    console.error('Exception during deleteOldRapidApiJobs:', error);
  }
}

async function fetchInternshipsFromRapidAPI() {
  console.log('Fetching all internships from RapidAPI for Texas...');
  if (!rapidApiKey || !rapidApiHost) {
    console.error('RapidAPI Key or Host is not configured in environment variables.');
    return [];
  }
  if (!supabase) {
    console.error('Supabase client not initialized. Cannot fetch new jobs without DB access for potential storage.');
    return [];
  }


  let allInternships = [];
  let currentOffset = 0;
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
          location_filter: 'Texas', // Updated to broader 'Texas' filter
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
        if (response.data.length < 10) { 
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

function filterFetchedInternships(internships) {
  console.log('Filtering fetched internships for student-friendliness...');
  return internships.filter(internship => {
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

function mapToJobSchema(internship) {
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
    // id: uuidv4(), // Supabase can auto-generate if PK is set to default to gen_random_uuid()
    title: internship.title || 'Untitled Internship',
    company: internship.organization || 'Unknown Company',
    location: location,
    description: internship.description_text || 'No description provided.',
    requirements: [], // Defaulting as not reliably parsed from this API
    type: 'Internship',
    level: 'High School', 
    applicants: 0,
    posted_at: internship.date_posted || new Date().toISOString(),
    external_link: internship.url || null,
    company_logo: internship.organization_logo || null,
    employer_id: '00000000-0000-0000-0000-000000000000', 
    application_url: internship.url || null,
    time_commitment: determineTimeCommitment(internship),
    source: 'RapidAPI',
    career_site_url: internship.linkedin_org_url || null
  };
}

function determineTimeCommitment(internship) {
  const title = (internship.title || '').toLowerCase();
  const descriptionText = (internship.description_text || '').toLowerCase();
  if (title.includes('summer') || descriptionText.includes('summer')) return 'Summer';
  if (title.includes('weekend') || descriptionText.includes('weekend')) return 'Weekend';
  if (title.includes('evening') || descriptionText.includes('evening')) return 'Evening';
  return null;
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

  // Using upsert with onConflict. Ensure your 'jobs' table has a unique constraint 
  // on (title, company, location) for this to work as "DO NOTHING" on conflict.
  // If not, this might error or create duplicates if IDs are not managed carefully.
  // The `ignoreDuplicates: false` (default) means it will error on conflict if not updating.
  // To truly "DO NOTHING", the constraint is key.
  // Alternatively, if 'external_link' is guaranteed unique for new jobs, it could be a conflict target.
  const { data, error } = await supabase
    .from('jobs')
    .upsert(jobs, {
      onConflict: 'title,company,location', // Assumes a unique constraint exists on these columns
      ignoreDuplicates: true // This makes it behave like ON CONFLICT DO NOTHING for the specified constraint
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
    await deleteOldRapidApiJobs();
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
    
    const jobsToInsert = studentFriendlyInternships.map(mapToJobSchema);
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
