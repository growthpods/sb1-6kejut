import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250516223100_add_education_level.sql', 'utf8');
    
    console.log('Applying migration...');
    const { error } = await supabase.rpc('pg_execute', { query: migrationSQL });
    
    if (error) {
      throw error;
    }
    
    console.log('Migration applied successfully!');
    console.log('Checking education_level values...');
    
    const { data: jobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, education_level')
      .limit(10);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('Sample jobs with education_level:');
    console.table(jobs);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applyMigration();
