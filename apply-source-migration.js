// Script to apply the migration to add source and career_site_url fields
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

// Initialize dotenv
dotenv.config();

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for migrations

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Applying migration to add source and career_site_url fields...');
  
  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, 'supabase/migrations/20250504102900_add_source_and_career_site_url.sql');
    
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
-- Add source field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source text;

-- Add career_site_url field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS career_site_url text;

COMMENT ON COLUMN jobs.source IS 'Source of the job posting (e.g., RapidAPI, Manual)';
COMMENT ON COLUMN jobs.career_site_url IS 'URL to the company career site';
      `;
    }
    
    // Execute the migration SQL
    console.log('Executing migration SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error executing migration SQL with RPC:', error);
      console.log('Trying alternative approach with individual queries...');
      
      // Alternative approach: Execute individual ALTER TABLE statements
      console.log('Adding source field...');
      const { error: sourceError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source text;' 
      });
      
      if (sourceError) {
        console.error('Error adding source field:', sourceError);
      } else {
        console.log('✅ source field added successfully');
      }
      
      console.log('Adding career_site_url field...');
      const { error: careerSiteUrlError } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS career_site_url text;' 
      });
      
      if (careerSiteUrlError) {
        console.error('Error adding career_site_url field:', careerSiteUrlError);
      } else {
        console.log('✅ career_site_url field added successfully');
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
      
      // Check for source field
      if ('source' in firstJob) {
        console.log('✅ source field exists in jobs table');
      } else {
        console.log('❌ source field is still missing from jobs table');
      }
      
      // Check for career_site_url field
      if ('career_site_url' in firstJob) {
        console.log('✅ career_site_url field exists in jobs table');
      } else {
        console.log('❌ career_site_url field is still missing from jobs table');
      }
      
      console.log('\nSample job structure after migration:');
      console.log(JSON.stringify(firstJob, null, 2));
    } else {
      console.log('No jobs found in the database to verify the migration.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the migration
applyMigration();
