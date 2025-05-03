// Script to execute the migration SQL directly using the Supabase REST API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('Executing migration to add time_commitment and application_url fields...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250422221709_add_time_commitment_and_application_url.sql');
    let migrationSQL;
    
    try {
      console.log(`Reading migration file: ${migrationPath}`);
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
    
    // Split the migration SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}: ${stmt.substring(0, 50)}...`);
      
      try {
        // Use the REST API to execute the SQL statement
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: stmt
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error executing statement ${i + 1}: ${errorText}`);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (stmtError) {
        console.error(`Error executing statement ${i + 1}:`, stmtError);
      }
    }
    
    // Verify the migration
    console.log('\nVerifying migration...');
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error verifying migration:', error);
      return;
    }
    
    if (data.length > 0) {
      const job = data[0];
      console.log('Job structure after migration:');
      
      // Check for time_commitment field
      if ('time_commitment' in job) {
        console.log('✅ time_commitment field exists in jobs table');
      } else {
        console.log('❌ time_commitment field is still missing from jobs table');
      }
      
      // Check for application_url field
      if ('application_url' in job) {
        console.log('✅ application_url field exists in jobs table');
      } else {
        console.log('❌ application_url field is still missing from jobs table');
      }
      
      console.log('\nSample job structure:');
      console.log(JSON.stringify(job, null, 2));
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
executeMigration();
