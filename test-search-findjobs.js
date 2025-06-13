import axios from 'axios';

const BASE_URL = 'https://internjobs.ai';
const SEARCH_TERM = 'software'; // Change as needed
const LOCATION = 'Texas'; // Change as needed

async function main() {
  const url = `${BASE_URL}/find-jobs?search=${encodeURIComponent(SEARCH_TERM)}&location=${encodeURIComponent(LOCATION)}`;
  console.log('Testing search at:', url);
  const res = await axios.get(url);
  // Log a snippet of the HTML to confirm results are present
  const html = res.data;
  const jobCardCount = (html.match(/JobCard/g) || []).length;
  console.log(`Found ${jobCardCount} job cards in the HTML.`);
  // Optionally, print a snippet
  console.log(html.substring(0, 500));
}

main().catch(console.error); 