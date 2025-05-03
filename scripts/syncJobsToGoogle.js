/**
 * Script to sync jobs from Supabase to Google Jobs API
 * 
 * This script fetches all jobs from Supabase and syncs them to Google Jobs API.
 * It can be run manually or scheduled to run periodically.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getGoogleJobsService } from '../src/lib/googleJobs.js';

// Load environment variables
dotenv.config();

// Create a Supabase client with the service role key
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not defined in the environment variables');
  console.error('Please add it to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to sync jobs from Supabase to Google Jobs API
async function syncJobsToGoogle() {
  try {
    console.log('Starting job sync from Supabase to Google Jobs API...');
    
    // Get Google Jobs service
    const googleJobsService = getGoogleJobsService();
    
    // Fetch all jobs from Supabase
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*');
      
    if (error) {
      console.error('Error fetching jobs from Supabase:', error);
      return;
    }
    
    console.log(`Found ${jobs.length} jobs in Supabase`);
    
    // Sync each job to Google Jobs API
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 1000;
    
    const batches = [];
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      batches.push(jobs.slice(i, i + BATCH_SIZE));
    }
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} jobs)...`);
      
      // Process jobs in parallel within each batch
      const promises = batch.map(async (job) => {
        try {
          // Convert Supabase job to our Job format
          const formattedJob = {
            ...job,
            postedAt: new Date(job.posted_at),
            requirements: job.requirements || [],
          };
          
          // Sync job to Google Jobs API
          const result = await googleJobsService.syncJob(formattedJob);
          console.log(`Synced job ${job.id} (${job.title}) to Google Jobs API`);
          return { success: true, jobId: job.id };
        } catch (error) {
          console.error(`Error syncing job ${job.id} (${job.title}) to Google Jobs API:`, error);
          return { success: false, jobId: job.id, error };
        }
      });
      
      // Wait for all jobs in the batch to be processed
      const results = await Promise.all(promises);
      
      // Log results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      console.log(`Batch ${i + 1} results: ${successCount} succeeded, ${failureCount} failed`);
      
      // Add a small delay between batches to avoid rate limits
      if (i < batches.length - 1) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await delay(BATCH_DELAY);
      }
    }
    
    console.log('Job sync completed');
  } catch (error) {
    console.error('Error syncing jobs to Google Jobs API:', error);
  }
}

// Function to delete jobs from Google Jobs API that no longer exist in Supabase
async function cleanupGoogleJobs() {
  try {
    console.log('Starting cleanup of Google Jobs API...');
    
    // Get Google Jobs service
    const googleJobsService = getGoogleJobsService();
    
    // Fetch all jobs from Supabase
    const { data: supabaseJobs, error: supabaseError } = await supabase
      .from('jobs')
      .select('id');
      
    if (supabaseError) {
      console.error('Error fetching jobs from Supabase:', supabaseError);
      return;
    }
    
    // Get all job IDs from Supabase
    const supabaseJobIds = supabaseJobs.map(job => job.id);
    console.log(`Found ${supabaseJobIds.length} jobs in Supabase`);
    
    // Fetch all jobs from Google Jobs API
    const googleJobs = await googleJobsService.listJobs({ pageSize: 100 });
    console.log(`Found ${googleJobs.jobs.length} jobs in Google Jobs API`);
    
    // Find jobs in Google Jobs API that don't exist in Supabase
    const jobsToDelete = googleJobs.jobs.filter(job => !supabaseJobIds.includes(job.id));
    console.log(`Found ${jobsToDelete.length} jobs to delete from Google Jobs API`);
    
    // Delete each job from Google Jobs API
    for (const job of jobsToDelete) {
      try {
        await googleJobsService.deleteJob(job.id);
        console.log(`Deleted job ${job.id} (${job.title}) from Google Jobs API`);
      } catch (error) {
        console.error(`Error deleting job ${job.id} (${job.title}) from Google Jobs API:`, error);
      }
      
      // Add a small delay between deletions to avoid rate limits
      await delay(500);
    }
    
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error cleaning up Google Jobs API:', error);
  }
}

// Main function to run the script
async function main() {
  console.log('Starting script execution...');
  
  // Sync jobs from Supabase to Google Jobs API
  await syncJobsToGoogle();
  
  // Clean up Google Jobs API
  await cleanupGoogleJobs();
  
  console.log('Script execution completed');
}

// Run the script
main();
