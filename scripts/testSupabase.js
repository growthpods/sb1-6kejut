// Simple script to test Supabase connection

import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for Node.js
const supabaseUrl = 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Check if supabase is initialized
    console.log('Supabase client:', supabase ? 'Initialized' : 'Not initialized');
    
    // Try to fetch some data from the jobs table
    console.log('Fetching data from jobs table...');
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('Error fetching data:', error.message);
      return;
    }
    
    console.log(`Successfully fetched ${data.length} jobs from the database.`);
    console.log('Sample job data:', data[0]);
    
    // Try to count the total number of jobs
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting jobs:', countError.message);
      return;
    }
    
    console.log(`Total number of jobs in the database: ${count}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSupabaseConnection();
