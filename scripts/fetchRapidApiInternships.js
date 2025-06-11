// Script to fetch internships from RapidAPI Internships API and store them in Supabase
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Initialize dotenv
dotenv.config();

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjgzMDA0NSwiZXhwIjoyMDQ4NDA2MDQ1fQ.Oi-qL1FQ3NZ0LA-cQkGKqwE4nzBRCJSSR6V4ditLvAk'; // Using service role key for database operations

// Get RapidAPI credentials from environment variables
const rapidApiKey = process.env.RAPIDAPI_INTERNSHIPS_KEY;
const rapidApiHost = process.env.RAPIDAPI_INTERNSHIPS_HOST;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

import { getEducationLevelParser } from '../src/lib/educationLevelParser.js';
import { getTimeCommitmentParser } from '../src/lib/timeCommitmentParser.js';

const educationLevelParser = getEducationLevelParser();
const timeCommitmentParser = getTimeCommitmentParser();

// Function to fetch internships from RapidAPI
async function fetchInternships() {
  console.log('Fetching internships from RapidAPI...');
  
  try {
    // Set up the request options with query parameters
    const options = {
      method: 'GET',
      url: 'https://internships-api.p.rapidapi.com/active-jb-7d',
      params: {
        title_filter: 'intern OR internship OR "high school" OR "summer job"',
        location_filter: 'Houston, Texas',
        description_filter: 'student OR "high school" OR college OR intern',
        description_type: 'text'
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    };
    
    // Make the request to RapidAPI
    console.log('Making request to RapidAPI...');
    const response = await axios.request(options);
    
    if (!response.data) {
      console.error('No data returned from RapidAPI');
      return [];
    }
    
    console.log(`Received ${response.data.length} internships from RapidAPI`);
    return response.data;
  } catch (error) {
    console.error('Error fetching internships from RapidAPI:', error);
    return [];
  }
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
  
  // Extract posted date
  const postedAt = internship.date_posted || new Date().toISOString();

  const educationLevel = await educationLevelParser.parseEducationLevelFromText(
    internship.title || '',
    description,
    []
  );

  const timeCommitment = await timeCommitmentParser.parseTimeCommitmentFromText(
    internship.title || '',
    description,
    []
  );
  
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
    education_level: educationLevel
  };
}

// Function to check if an internship already exists in the database
async function internshipExists(internship) {
  // Extract company name
  const company = internship.organization || 'Unknown Company';
  
  const { data, error } = await supabase
    .from('jobs')
    .select('id')
    .eq('title', internship.title)
    .eq('company', company);
  
  if (error) {
    console.error('Error checking if internship exists:', error);
    return false;
  }
  
  return data && data.length > 0;
}

// Function to insert internships into the database
async function insertInternships(internships) {
  console.log('Inserting internships into the database...');
  
  let insertedCount = 0;
  let skippedCount = 0;
  
  for (const internship of internships) {
    // Check if internship already exists
    const exists = await internshipExists(internship);
    
    // Extract company name for logging
    const company = internship.organization || 'Unknown Company';
    
    if (exists) {
      console.log(`Skipping internship "${internship.title}" from "${company}" (already exists)`);
      skippedCount++;
      continue;
    }
    
    // Map internship to our job schema
    const job = await mapInternshipToJobSchema(internship);
    
    // Insert into database
    const { error } = await supabase
      .from('jobs')
      .insert([job]);
    
    if (error) {
      console.error(`Error inserting internship "${job.title}" from "${job.company}":`, error);
    } else {
      console.log(`Inserted internship "${job.title}" from "${job.company}"`);
      insertedCount++;
    }
  }
  
  console.log(`Inserted ${insertedCount} new internships, skipped ${skippedCount} existing internships`);
}

// Main function to run the script
export async function main() {
  console.log('Starting RapidAPI Internships fetch script...');
  
  // Fetch internships from RapidAPI
  const internships = await fetchInternships();
  
  if (internships.length === 0) {
    console.log('No internships found. Exiting.');
    return;
  }
  
  // Insert internships into the database
  await insertInternships(internships);
  
  console.log('RapidAPI Internships fetch script completed successfully.');
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unexpected error in main function:', error);
  });
}
