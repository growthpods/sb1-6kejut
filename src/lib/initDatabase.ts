import { supabase } from './supabase';
import { SAMPLE_JOBS } from '../data/sampleJobs';

async function createTables() {
  const { error: jobsTableError } = await supabase.from('jobs').select('id').limit(1);
  
  if (jobsTableError?.code === '42P01') { // Table doesn't exist
    const { error } = await supabase.rpc('create_jobs_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS jobs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          description TEXT NOT NULL,
          requirements TEXT[] NOT NULL DEFAULT '{}',
          type TEXT NOT NULL,
          level TEXT NOT NULL,
          applicants INTEGER NOT NULL DEFAULT 0,
          posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          external_link TEXT,
          company_logo TEXT,
          employer_id TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS applications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          job_id UUID REFERENCES jobs(id),
          user_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          resume_url TEXT,
          cover_letter TEXT
        );
      `
    });

    if (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  }

  return true;
}

export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    const tablesCreated = await createTables();
    if (!tablesCreated) return;

    // Check if we already have jobs
    const { data: existingJobs, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing jobs:', checkError);
      return;
    }

    // If we have existing jobs, no need to initialize
    if (existingJobs && existingJobs.length > 0) {
      return;
    }

    // Insert sample jobs in batches to avoid rate limits
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < SAMPLE_JOBS.length; i += batchSize) {
      const batch = SAMPLE_JOBS.slice(i, i + batchSize).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        type: job.type,
        level: job.level,
        applicants: job.applicants,
        posted_at: job.postedAt.toISOString(),
        company_logo: job.companyLogo,
        external_link: null,
        employer_id: 'system'
      }));
      batches.push(batch);
    }

    for (const batch of batches) {
      const { error: insertError } = await supabase.from('jobs').insert(batch);
      if (insertError) {
        console.error('Error inserting job batch:', insertError);
      }
      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}