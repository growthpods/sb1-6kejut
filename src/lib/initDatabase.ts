import { supabase } from './supabase';
// import { SAMPLE_JOBS } from '../data/sampleJobs'; // Removed import

// const BATCH_SIZE = 5; // No longer needed
// const BATCH_DELAY = 1000; // No longer needed

export async function initializeDatabase() {
  try {
    // Check if we already have jobs
    const { data: existingJobs, error: checkError } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (checkError) {
      if (checkError.code === '42P01') {
        console.log('Tables not yet created, waiting for migrations...');
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        return initializeDatabase();
      }
      console.error('Error checking jobs:', checkError);
      return;
    }

    // If we have existing jobs, no need to initialize
    if (existingJobs && existingJobs.length > 0) {
      console.log('Database already initialized');
      return;
    }

    // --- Sample Data Insertion Logic Removed ---
    // // Insert sample jobs in batches to avoid rate limits
    // const batches = [];
    // for (let i = 0; i < SAMPLE_JOBS.length; i += BATCH_SIZE) {
    //   const batch = SAMPLE_JOBS.slice(i, i + BATCH_SIZE).map(job => ({
    //     id: job.id,
    //     title: job.title,
    //     company: job.company,
    //     location: job.location,
    //     description: job.description,
    //     requirements: job.requirements,
    //     type: job.type,
    //     level: job.level,
    //     applicants: job.applicants,
    //     posted_at: job.postedAt.toISOString(),
    //     company_logo: job.companyLogo,
    //     external_link: null,
    //     employer_id: 'system'
    //   }));
    //   batches.push(batch);
    // }

    // for (const batch of batches) {
    //   const { error: insertError } = await supabase.from('jobs').insert(batch);
    //   if (insertError) {
    //     throw insertError;
    //   }
    //   // Add a small delay between batches to avoid rate limits
    //   await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    // }

    console.log('Skipping sample data initialization.');
    // --- End of Removed Logic ---

  } catch (error) {
    // Keep error handling for table check
    const err = error as { code?: string }; // Type assertion for error code
    if (err.code === '42P01') {
      console.log('Tables not yet created, waiting for migrations...');
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initializeDatabase();
    }
    console.error('Database initialization error:', error);
  }
}
