/**
 * Update Education Levels for Jobs
 * 
 * This script analyzes existing jobs in the database and determines whether each job
 * is more suitable for high school or college students, then updates the education_level field.
 * 
 * The analysis considers:
 * - Required skills and their complexity
 * - Required experience level
 * - Job responsibilities and their complexity
 * - Time commitment required
 * - Required coursework or academic background
 * - Job title implications
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getEducationLevelParser } from '../src/lib/educationLevelParser.js';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const educationLevelParser = getEducationLevelParser();

async function updateJobEducationLevels() {
  try {
    console.log('Fetching jobs from database...');
    
    // Fetch all jobs that don't have an education level set
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .is('education_level', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${jobs.length} jobs without student type classification.`);
    
    // Process each job
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing job ${i+1}/${jobs.length}: ${job.title}`);
      
      try {
        // Determine whether the job is suitable for high school or college students
        const studentType = await educationLevelParser.parseEducationLevelFromText(
          job.title || '',
          job.description || '',
          job.requirements || []
        );
        
        console.log(`Determined student type for "${job.title}": ${studentType} (${studentType === 'High School' ? 'less complex, entry-level' : 'more complex, specialized knowledge'})`);
        
        // Update the job in the database
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ education_level: studentType })
          .eq('id', job.id);
        
        if (updateError) {
          console.error(`Error updating job ${job.id}:`, updateError);
        } else {
          console.log(`Updated job ${job.id} with student type: ${studentType}`);
        }
      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Job student type classification complete!');
    console.log('All jobs have been analyzed and classified as either "High School" or "College" based on their requirements and complexity.');
  } catch (error) {
    console.error('Error updating job education levels:', error);
  }
}

// Run the update function
updateJobEducationLevels();
