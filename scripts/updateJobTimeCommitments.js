/**
 * Update Time Commitments for Jobs
 * 
 * This script analyzes existing jobs in the database and determines the appropriate
 * time commitment (Evening, Weekend, Summer) for each job, then updates the time_commitment field.
 * 
 * The analysis considers:
 * - Mentioned work hours or schedule
 * - Seasonal nature of the job
 * - Specific mentions of "evening", "weekend", "summer", "after school", etc.
 * - Time commitment requirements
 * - Flexibility mentions
 * - School year vs. summer break considerations
 * - Job title implications
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getTimeCommitmentParser } from '../src/lib/timeCommitmentParser.js';

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
const timeCommitmentParser = getTimeCommitmentParser();

async function updateJobTimeCommitments() {
  try {
    console.log('Fetching jobs from database...');
    
    // Fetch all jobs that don't have a time commitment set
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .is('time_commitment', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${jobs.length} jobs without time commitment classification.`);
    
    // Process each job
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing job ${i+1}/${jobs.length}: ${job.title}`);
      
      try {
        // Determine the appropriate time commitment
        const timeCommitment = await timeCommitmentParser.parseTimeCommitmentFromText(
          job.title || '',
          job.description || '',
          job.requirements || []
        );
        
        if (timeCommitment) {
          console.log(`Determined time commitment for "${job.title}": ${timeCommitment}`);
          
          // Update the job in the database
          const { error: updateError } = await supabase
            .from('jobs')
            .update({ time_commitment: timeCommitment })
            .eq('id', job.id);
          
          if (updateError) {
            console.error(`Error updating job ${job.id}:`, updateError);
          } else {
            console.log(`Updated job ${job.id} with time commitment: ${timeCommitment}`);
          }
        } else {
          console.log(`Could not determine a clear time commitment for "${job.title}"`);
        }
      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Job time commitment classification complete!');
    console.log('All jobs have been analyzed and classified with appropriate time commitments where possible.');
  } catch (error) {
    console.error('Error updating job time commitments:', error);
  }
}

// Run the update function
updateJobTimeCommitments();
