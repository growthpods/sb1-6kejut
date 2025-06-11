/**
 * Scrape Houston-based internships from a specific source and insert them into the database.
 * 
 * This script is designed to be run manually to populate the database with initial data.
 * It uses Firecrawl to scrape the job listings and Supabase to insert them.
 */

import { getEducationLevelParser } from '../src/lib/educationLevelParser.js';
import { getTimeCommitmentParser } from '../src/lib/timeCommitmentParser.js';
import { getFirecrawlService } from '../src/lib/firecrawl.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and service role key are required.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const educationLevelParser = getEducationLevelParser();
const timeCommitmentParser = getTimeCommitmentParser();

/**
 * Fetches and scrapes jobs from a given URL.
 */
async function searchAndScrapeJobs() {
  try {
    const firecrawl = getFirecrawlService();
    
    // The URL to scrape for Houston-based internships
    const scrapeUrl = 'https://www.linkedin.com/jobs/search/?keywords=internship&location=Houston%2C%20Texas%2C%20United%20States';
    
    console.log(`Scraping jobs from: ${scrapeUrl}`);
    
    // Scrape the URL for job listings
    const jobs = await firecrawl.scrapeJobListing(scrapeUrl);
    
    if (jobs && jobs.length > 0) {
      console.log(`Successfully scraped ${jobs.length} jobs.`);
      return jobs;
    } else {
      console.log('No jobs found or scraping failed.');
      return [];
    }
  } catch (error) {
    console.error('Error scraping jobs:', error);
    return [];
  }
}

/**
 * Inserts a list of jobs into the Supabase database.
 * 
 * @param jobs - An array of jobs to insert.
 */
async function insertJobs(jobs: any[]) {
  if (jobs.length === 0) {
    console.log('No jobs to insert.');
    return;
  }
  
  console.log(`Inserting ${jobs.length} jobs into the database...`);
  
  for (const job of jobs) {
    try {
      // Check if the job already exists
      const { data: existingJob, error: selectError } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .eq('company', job.company)
        .eq('location', job.location)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is not an error in this case
        console.error(`Error checking for existing job: ${job.title}`, selectError);
        continue;
      }
      
      if (existingJob) {
        console.log(`Job "${job.title}" by ${job.company} already exists. Skipping.`);
        continue;
      }
      
      // Parse education level and time commitment
      const educationLevel = await educationLevelParser.parseEducationLevelFromText(
        job.title || '',
        job.description || '',
        job.requirements || []
      );
      
      const timeCommitment = await timeCommitmentParser.parseTimeCommitmentFromText(
        job.title || '',
        job.description || '',
        job.requirements || []
      );

      // Insert the new job
      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          application_url: job.applicationUrl,
          education_level: educationLevel,
          time_commitment: timeCommitment,
          source: 'LinkedIn Scrape',
          posted_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error(`Error inserting job: ${job.title}`, insertError);
      } else {
        console.log(`Successfully inserted job: ${job.title}`);
      }
    } catch (error) {
      console.error(`An unexpected error occurred while inserting job: ${job.title}`, error);
    }
  }
}

/**
 * Main function to run the scraping and insertion process.
 */
async function main() {
  try {
    // Step 1: Scrape the jobs
    const scrapedJobs = await searchAndScrapeJobs();
    
    // Step 2: Insert the jobs into the database
    await insertJobs(scrapedJobs);
    
    console.log('Job scraping and insertion process completed.');
  } catch (error) {
    console.error('An error occurred in the main process:', error);
  }
}

// Execute the main function
main();
