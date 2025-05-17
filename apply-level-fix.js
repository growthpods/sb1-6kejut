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
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250516234500_fix_level_field.sql', 'utf8');
    
    console.log('Applying migration...');
    const { error } = await supabase.rpc('pg_execute', { query: migrationSQL });
    
    if (error) {
      throw error;
    }
    
    console.log('Migration applied successfully!');
    console.log('Checking updated level values...');
    
    const { data: jobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, level, education_level')
      .limit(10);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('Sample jobs with updated level:');
    console.table(jobs);
    
    // Check the specific job that had the issue
    const { data: specificJob, error: specificError } = await supabase
      .from('jobs')
      .select('id, title, level, education_level')
      .eq('id', 'db7ddd6c-930a-4e20-8df3-a41c0e1226a4')
      .single();
    
    if (specificError) {
      throw specificError;
    }
    
    console.log('The specific job that had the issue:');
    console.table(specificJob);
    
    // Count jobs by level
    const { data: counts, error: countError } = await supabase
      .rpc('pg_execute', { 
        query: "SELECT level, COUNT(*) FROM jobs GROUP BY level ORDER BY COUNT(*) DESC;" 
      });
    
    if (countError) {
      throw countError;
    }
    
    console.log('Level distribution:');
    console.table(counts);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applyMigration();
