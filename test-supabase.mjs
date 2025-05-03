// Simple script to test Supabase connection and database structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by fetching a single row from the jobs table
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    
    // Check if the jobs table exists and has the expected structure
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .limit(5);
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return;
    }
    
    console.log('✅ Jobs table exists and is accessible');
    console.log(`Found ${jobsData.length} job(s) in the database`);
    
    // Check if the new fields exist in the jobs table
    if (jobsData.length > 0) {
      const firstJob = jobsData[0];
      console.log('\nChecking job table structure:');
      
      // Check for time_commitment field
      if ('time_commitment' in firstJob) {
        console.log('✅ time_commitment field exists in jobs table');
      } else {
        console.log('❌ time_commitment field is missing from jobs table');
      }
      
      // Check for application_url field
      if ('application_url' in firstJob) {
        console.log('✅ application_url field exists in jobs table');
      } else {
        console.log('❌ application_url field is missing from jobs table');
      }
      
      // Print the structure of the first job
      console.log('\nSample job structure:');
      console.log(JSON.stringify(firstJob, null, 2));
    } else {
      console.log('\nNo jobs found in the database to check structure');
    }
    
    // Check if the applications table exists
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .limit(1);
    
    if (applicationsError && applicationsError.code !== 'PGRST116') {
      console.error('Error fetching applications:', applicationsError);
    } else if (applicationsError && applicationsError.code === 'PGRST116') {
      console.log('❌ Applications table does not exist');
    } else {
      console.log('✅ Applications table exists and is accessible');
      console.log(`Found ${applicationsData.length} application(s) in the database`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSupabaseConnection();
