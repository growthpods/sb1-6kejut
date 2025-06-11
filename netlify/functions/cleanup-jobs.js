import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOldJobs() {
  console.log('Cleaning up old jobs...');
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .lt('posted_at', fifteenDaysAgo);

  if (error) {
    console.error('Error cleaning up old jobs:', error);
  } else {
    console.log('Cleaned up old jobs successfully.');
  }
}

export const handler = schedule('0 0 * * *', async () => {
  try {
    await cleanupOldJobs();
    return {
      statusCode: 200,
      body: 'Job cleanup process completed successfully.',
    };
  } catch (error) {
    console.error('Error running job cleanup process:', error);
    return {
      statusCode: 500,
      body: 'Error running job cleanup process.',
    };
  }
});
