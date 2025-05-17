/**
 * Fetch and Classify Jobs
 * 
 * This script fetches jobs from external sources, classifies them by education level
 * and time commitment, and adds them to the database.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getEducationLevelParser } from '../src/lib/educationLevelParser.js';
import { getTimeCommitmentParser } from '../src/lib/timeCommitmentParser.js';
import { getFirecrawlService } from '../src/lib/firecrawl.js';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const educationLevelParser = getEducationLevelParser();
const timeCommitmentParser = getTimeCommitmentParser();
const firecrawl = getFirecrawlService();

// Sources to fetch jobs from
const sources = [
  {
    name: 'Indeed',
    url: 'https://www.indeed.com/jobs?q=internship&l=Texas',
    type: 'scrape'
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs/search/?keywords=internship&location=Texas',
    type: 'scrape'
  },
  {
    name: 'Glassdoor',
    url: 'https://www.glassdoor.com/Job/texas-internship-jobs-SRCH_IL.0,5_IS1347_KO6,16.htm',
    type: 'scrape'
  }
];

async function fetchAndClassifyJobs() {
  try {
    console.log('Starting job fetching and classification process...');
    
    for (const source of sources) {
      console.log(`Fetching jobs from ${source.name}...`);
      
      try {
        // Fetch jobs from the source
        let jobs = [];
        
        if (source.type === 'scrape') {
          // Use Firecrawl to scrape job listings
          const scrapedData = await firecrawl.scrapeJobListings(source.url);
          jobs = scrapedData.jobs || [];
        }
        
        console.log(`Found ${jobs.length} jobs from ${source.name}.`);
        
        // Process each job
        for (let i = 0; i < jobs.length; i++) {
          const job = jobs[i];
          console.log(`Processing job ${i+1}/${jobs.length}: ${job.title}`);
          
          try {
            // Determine education level and time commitment
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
            
            console.log(`Classified "${job.title}": Education Level: ${educationLevel}, Time Commitment: ${timeCommitment || 'Unknown'}`);
            
            // Check if the job already exists in the database
            const { data: existingJobs, error: checkError } = await supabase
              .from('jobs')
              .select('id')
              .eq('title', job.title)
              .eq('company', job.company)
              .eq('location', job.location);
            
            if (checkError) {
              console.error(`Error checking for existing job:`, checkError);
              continue;
            }
            
            if (existingJobs && existingJobs.length > 0) {
              console.log(`Job "${job.title}" already exists in the database. Updating classification...`);
              
              // Update the existing job with the new classification
              const { error: updateError } = await supabase
                .from('jobs')
                .update({
                  education_level: educationLevel,
                  time_commitment: timeCommitment
                })
                .eq('id', existingJobs[0].id);
              
              if (updateError) {
                console.error(`Error updating job ${existingJobs[0].id}:`, updateError);
              } else {
                console.log(`Updated job ${existingJobs[0].id} with education level: ${educationLevel}, time commitment: ${timeCommitment || 'Unknown'}`);
              }
            } else {
              console.log(`Adding new job "${job.title}" to the database...`);
              
              // Add the job to the database
              const { error: insertError } = await supabase
                .from('jobs')
                .insert({
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  description: job.description,
                  requirements: job.requirements,
                  type: job.type || 'Internship',
                  level: job.level || 'Entry Level',
                  education_level: educationLevel,
                  time_commitment: timeCommitment,
                  application_url: job.applicationUrl,
                  source: source.name,
                  posted_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error(`Error adding job to database:`, insertError);
              } else {
                console.log(`Added job "${job.title}" to the database.`);
              }
            }
          } catch (jobError) {
            console.error(`Error processing job:`, jobError);
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (sourceError) {
        console.error(`Error fetching jobs from ${source.name}:`, sourceError);
      }
    }
    
    console.log('Job fetching and classification complete!');
  } catch (error) {
    console.error('Error in fetchAndClassifyJobs:', error);
  }
}

// Run the fetch and classify function
fetchAndClassifyJobs();
