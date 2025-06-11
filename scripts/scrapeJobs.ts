import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getFirecrawlService, FirecrawlService } from '../src/lib/firecrawl';

// Load environment variables from .env file
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and service role key are required.');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
const firecrawl: FirecrawlService = getFirecrawlService();

/**
 * Scrapes job listings from a given URL and returns them.
 * @param url The URL to scrape.
 * @returns A promise that resolves to an array of job listings.
 */
async function scrapeJobs(url: string): Promise<any[]> {
  try {
    console.log(`Scraping jobs from: ${url}`);
    const jobs = await firecrawl.scrapeJobListing(url);
    if (jobs && jobs.length > 0) {
      console.log(`Successfully scraped ${jobs.length} jobs.`);
      return jobs;
    } else {
      console.log('No jobs found or scraping failed.');
      return [];
    }
  } catch (error) {
    console.error('Error scraping jobs:', error);
    return [];
  }
}

/**
 * Inserts job listings into the Supabase database.
 * @param jobs The job listings to insert.
 * @param source The source of the job listings.
 */
async function insertJobs(jobs: any[], source: string): Promise<void> {
  if (jobs.length === 0) {
    console.log('No jobs to insert.');
    return;
  }

  console.log(`Inserting ${jobs.length} jobs from ${source} into the database...`);

  for (const job of jobs) {
    try {
      const { data: existingJob, error: selectError } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .eq('company', job.company)
        .eq('location', job.location)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`Error checking for existing job: ${job.title}`, selectError);
        continue;
      }

      if (existingJob) {
        console.log(`Job "${job.title}" by ${job.company} already exists. Skipping.`);
        continue;
      }

      const { error: insertError } = await supabase.from('jobs').insert({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        application_url: job.applicationUrl,
        source: source,
        posted_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error(`Error inserting job: ${job.title}`, insertError);
      } else {
        console.log(`Successfully inserted job: ${job.title}`);
      }
    } catch (error) {
      console.error(`An unexpected error occurred while inserting job: ${job.title}`, error);
    }
  }
}

/**
 * The main function to run the job scraping and insertion process.
 */
async function main() {
  const sources = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer%20Intern&location=Texas%2C%20United%20States' },
    { name: 'Indeed', url: 'https://www.indeed.com/jobs?q=internship&l=Texas' },
    { name: 'Glassdoor', url: 'https://www.glassdoor.com/Job/texas-internship-jobs-SRCH_IL.0,5_IS1347_KO6,16.htm' },
  ];

  try {
    for (const source of sources) {
      const scrapedJobs = await scrapeJobs(source.url);
      await insertJobs(scrapedJobs, source.name);
    }
    console.log('Job scraping and insertion process completed.');
  } catch (error) {
    console.error('An error occurred in the main process:', error);
  }
}

main();
