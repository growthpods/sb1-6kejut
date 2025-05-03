// Simple script to directly add the missing columns to the jobs table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJobsTable() {
  console.log('Starting direct update of jobs table...');
  
  try {
    // First, let's check if the fields already exist
    const { data: beforeData, error: beforeError } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (beforeError) {
      console.error('Error checking jobs table:', beforeError);
      return;
    }
    
    if (beforeData.length > 0) {
      const firstJob = beforeData[0];
      console.log('Current job structure:');
      console.log(JSON.stringify(firstJob, null, 2));
      
      // Check if fields already exist
      const timeCommitmentExists = 'time_commitment' in firstJob;
      const applicationUrlExists = 'application_url' in firstJob;
      
      if (timeCommitmentExists && applicationUrlExists) {
        console.log('✅ Both fields already exist in the jobs table. No update needed.');
        return;
      }
    }
    
    // Update existing jobs to add the new fields
    console.log('Updating jobs table with new fields...');
    
    // Get all jobs
    const { data: allJobs, error: getError } = await supabase
      .from('jobs')
      .select('id');
    
    if (getError) {
      console.error('Error getting jobs:', getError);
      return;
    }
    
    console.log(`Found ${allJobs.length} jobs to update`);
    
    // Update each job with the new fields
    for (const job of allJobs) {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          time_commitment: 'Summer', // Default value
          application_url: null // Default to null
        })
        .eq('id', job.id);
      
      if (updateError) {
        console.error(`Error updating job ${job.id}:`, updateError);
      }
    }
    
    console.log('✅ Jobs updated successfully');
    
    // Verify the update
    const { data: afterData, error: afterError } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (afterError) {
      console.error('Error verifying update:', afterError);
      return;
    }
    
    if (afterData.length > 0) {
      const updatedJob = afterData[0];
      console.log('Updated job structure:');
      console.log(JSON.stringify(updatedJob, null, 2));
      
      // Check if fields exist now
      const timeCommitmentExists = 'time_commitment' in updatedJob;
      const applicationUrlExists = 'application_url' in updatedJob;
      
      console.log(`time_commitment field: ${timeCommitmentExists ? '✅ exists' : '❌ missing'}`);
      console.log(`application_url field: ${applicationUrlExists ? '✅ exists' : '❌ missing'}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the update
updateJobsTable();
