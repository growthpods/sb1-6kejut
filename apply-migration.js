// Script to apply the migration to add time_commitment and application_url fields
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Applying migration to add time_commitment and application_url fields...');
  
  try {
    // Read the migration SQL file
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250422221709_add_time_commitment_and_application_url.sql');
    
    console.log(`Reading migration file: ${migrationPath}`);
    let migrationSQL;
    
    try {
      migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('Migration SQL file read successfully');
    } catch (readError) {
      console.error('Error reading migration file:', readError);
      console.log('Using hardcoded migration SQL instead');
      
      // Hardcoded migration SQL as a fallback
      migrationSQL = `
-- Add time_commitment field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS time_commitment text;

-- Add application_url field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_url text;

COMMENT ON COLUMN jobs.time_commitment IS 'When the job is available (Evening, Weekend, Summer)';
COMMENT ON COLUMN jobs.application_url IS 'Direct URL where students can apply for the job';
      `;
    }
    
    // Execute the migration SQL
    console.log('Executing migration SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error executing migration SQL with RPC:', error);
      console.log('Trying alternative approach with individual queries...');
      
      // Alternative approach: Execute individual ALTER TABLE statements
      console.log('Adding time_commitment field...');
      const { error: timeCommitmentError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS time_commitment text;' 
      });
      
      if (timeCommitmentError) {
        console.error('Error adding time_commitment field:', timeCommitmentError);
      } else {
        console.log('✅ time_commitment field added successfully');
      }
      
      console.log('Adding application_url field...');
      const { error: applicationUrlError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_url text;' 
      });
      
      if (applicationUrlError) {
        console.error('Error adding application_url field:', applicationUrlError);
      } else {
        console.log('✅ application_url field added successfully');
      }
    } else {
      console.log('✅ Migration SQL executed successfully');
    }
    
    // Verify the migration
    console.log('\nVerifying migration...');
    const { data, error: verifyError } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
      return;
    }
    
    if (data.length > 0) {
      const firstJob = data[0];
      console.log('Job table structure after migration:');
      
      // Check for time_commitment field
      if ('time_commitment' in firstJob) {
        console.log('✅ time_commitment field exists in jobs table');
      } else {
        console.log('❌ time_commitment field is still missing from jobs table');
      }
      
      // Check for application_url field
      if ('application_url' in firstJob) {
        console.log('✅ application_url field exists in jobs table');
      } else {
        console.log('❌ application_url field is still missing from jobs table');
      }
      
      console.log('\nSample job structure after migration:');
      console.log(JSON.stringify(firstJob, null, 2));
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
applyMigration();
