// Simple script to check if the fields exist and try to update a single job
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFields() {
  try {
    console.log('Checking Supabase connection and fields...');
    
    // Get a single job
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching job:', error);
      return;
    }
    
    console.log('Successfully fetched job with ID:', job.id);
    
    // Check if fields exist
    const hasTimeCommitment = 'time_commitment' in job;
    const hasApplicationUrl = 'application_url' in job;
    
    console.log(`time_commitment field: ${hasTimeCommitment ? 'exists' : 'missing'}`);
    console.log(`application_url field: ${hasApplicationUrl ? 'exists' : 'missing'}`);
    
    // If fields are missing, try to update the job
    if (!hasTimeCommitment || !hasApplicationUrl) {
      console.log('Attempting to update job with missing fields...');
      
      const updateData = {};
      if (!hasTimeCommitment) updateData.time_commitment = 'Summer';
      if (!hasApplicationUrl) updateData.application_url = null;
      
      const { error: updateError } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', job.id);
      
      if (updateError) {
        console.error('Error updating job:', updateError);
        return;
      }
      
      console.log('Job updated successfully');
      
      // Fetch the job again to verify the update
      const { data: updatedJob, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated job:', fetchError);
        return;
      }
      
      console.log('Updated job:', updatedJob);
      
      // Check if fields exist now
      const hasTimeCommitmentNow = 'time_commitment' in updatedJob;
      const hasApplicationUrlNow = 'application_url' in updatedJob;
      
      console.log(`time_commitment field after update: ${hasTimeCommitmentNow ? 'exists' : 'still missing'}`);
      console.log(`application_url field after update: ${hasApplicationUrlNow ? 'exists' : 'still missing'}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkFields();
