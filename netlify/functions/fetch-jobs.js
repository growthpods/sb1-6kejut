import { schedule } from '@netlify/functions';
import { main as fetchRapidApiInternships } from '../../scripts/fetchRapidApiInternships.js';

export const handler = schedule('0 8 * * *', async () => {
  try {
    await fetchRapidApiInternships();
    return {
      statusCode: 200,
      body: 'Job fetching process completed successfully.',
    };
  } catch (error) {
    console.error('Error running job fetching process:', error);
    return {
      statusCode: 500,
      body: 'Error running job fetching process.',
    };
  }
});
