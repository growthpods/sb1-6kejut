// Script to fetch internships from RapidAPI Internships API and store them in Supabase using MCP server
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Initialize dotenv
dotenv.config();

// Get Supabase project ID from environment variables
const supabaseProjectId = process.env.SUPABASE_PROJECT_ID || 'jhboikdocmcnpvbtanwo';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get RapidAPI credentials from environment variables
const rapidApiKey = process.env.RAPIDAPI_INTERNSHIPS_KEY;
const rapidApiHost = process.env.RAPIDAPI_INTERNSHIPS_HOST;

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
        location_filter: 'United States',
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

// Function to filter internships for US-based opportunities
function filterInternships(internships) {
  console.log('Filtering internships for US-based opportunities...');
  
  // Filter for US-based internships
  const usInternships = internships.filter(internship => {
    // Check countries_derived array
    if (internship.countries_derived && internship.countries_derived.some(country => country.includes('United States'))) {
      return true;
    }
    
    // Check locations_raw
    if (internship.locations_raw && internship.locations_raw.some(loc => 
      loc.address && loc.address.addressCountry === 'US')) {
      return true;
    }
    
    // Check location string if available
    const location = (internship.location || '').toLowerCase();
    return location.includes('usa') || location.includes('united states') || 
           location.includes('us') || location.includes('america');
  });
  
  console.log(`Found ${usInternships.length} internships in the United States`);
  
  // Filter for student-friendly internships
  const studentInternships = usInternships.filter(internship => {
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

// Function to check if an internship already exists in the database using MCP server
// This function is not fully implemented for direct use within this Node.js script
// and would require a separate mechanism to interact with the Supabase database
// outside of the MCP tool's execute_sql capability which is for single queries.
// For now, we will skip the existence check and attempt to insert all fetched internships.
async function internshipExists(internship) {
  return false; // Skipping existence check for now
}

// Function to insert internships into the database using MCP server
async function insertInternships(internships) {
  console.log('Inserting internships into the database using MCP server...');

  let insertedCount = 0;
  let skippedCount = 0;

  for (const internship of internships) {
    try {
      // Check if internship already exists (skipping for now)
      const exists = await internshipExists(internship);

      // Extract company name for logging
      const company = internship.organization || 'Unknown Company';

      if (exists) {
        console.log(`Skipping internship "${internship.title}" from "${company}" (already exists)`);
        skippedCount++;
        continue;
      }

      // Map internship to our job schema
      const job = mapInternshipToJobSchema(internship);

      // Construct the SQL INSERT statement
      const query = `
        INSERT INTO jobs (title, company, location, description, requirements, type, level, applicants, posted_at, external_link, company_logo, employer_id, application_url, time_commitment, source, career_site_url)
        VALUES (
          '${job.title.replace(/'/g, "''")}',
          '${job.company.replace(/'/g, "''")}',
          '${job.location.replace(/'/g, "''")}',
          '${job.description.replace(/'/g, "''")}',
          '{}', -- Inserting an empty text array literal for requirements
          '${job.type}',
          '${job.level}',
          ${job.applicants},
          '${job.posted_at}',
          ${job.external_link ? `'${job.external_link.replace(/'/g, "''")}'` : 'NULL'},
          ${job.company_logo ? `'${job.company_logo.replace(/'/g, "''")}'` : 'NULL'},
          '${job.employer_id}',
          ${job.application_url ? `'${job.application_url.replace(/'/g, "''")}'` : 'NULL'},
          ${job.time_commitment ? `'${job.time_commitment}'` : 'NULL'},
          '${job.source}',
          ${job.career_site_url ? `'${job.career_site_url.replace(/'/g, "''")}'` : 'NULL'}
        );
      `;

      // Use the MCP tool to execute the SQL query
      console.log(`Attempting to insert internship "${job.title}" from "${job.company}" using MCP tool...`);
      // Note: Direct tool usage within a Node.js script is not possible.
      // This section is illustrative of the intended logic if this were run in an environment
      // where MCP tools are directly callable within the script execution context.
      // For this task, we will manually execute the tool call after the file is updated.

      // For now, just log the query that would be executed
      console.log("Generated SQL Query:");
      console.log(query);
      console.log('---');

      insertedCount++; // Count as inserted for logging purposes
    } catch (error) {
      console.error(`Error processing internship:`, error);
    }
  }

  console.log(`Processed ${insertedCount} internships for insertion, skipped ${skippedCount} existing internships`);
  console.log("Please manually execute the generated SQL queries using the MCP tool.");
}

// Main function to run the script
async function main() {
  console.log('Starting RapidAPI Internships fetch script with MCP server...');
  
  // Fetch internships from RapidAPI
  const internships = await fetchInternships();
  
  if (internships.length === 0) {
    console.log('No internships found. Exiting.');
    return;
  }
  
  // Filter internships for US-based opportunities
  const filteredInternships = filterInternships(internships);
  
  if (filteredInternships.length === 0) {
    console.log('No matching internships found after filtering. Exiting.');
    return;
  }
  
  // Insert internships into the database using MCP server
  await insertInternships(filteredInternships);
  
  console.log('RapidAPI Internships fetch script with MCP server completed successfully.');
}

// Run the script
main().catch(error => {
  console.error('Unexpected error in main function:', error);
});
