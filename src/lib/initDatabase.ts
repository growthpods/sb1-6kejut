import { supabase } from './supabase';
import { SAMPLE_JOBS } from '../data/sampleJobs';

export async function initializeDatabase() {
  try {
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
      // Add a small delay between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}