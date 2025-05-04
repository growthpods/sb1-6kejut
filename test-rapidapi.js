// Test script for RapidAPI Internships API
import axios from 'axios';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get RapidAPI credentials from environment variables
const rapidApiKey = process.env.RAPIDAPI_INTERNSHIPS_KEY;
const rapidApiHost = process.env.RAPIDAPI_INTERNSHIPS_HOST;

// Function to fetch internships from RapidAPI
async function fetchInternships() {
  console.log('Fetching internships from RapidAPI...');
  console.log(`API Key: ${rapidApiKey ? '✅ Found' : '❌ Missing'}`);
  console.log(`API Host: ${rapidApiHost ? '✅ Found' : '❌ Missing'}`);
  
  try {
    // Set up the request options with query parameters
    const options = {
      method: 'GET',
      url: 'https://internships-api.p.rapidapi.com/active-jb-7d',
      params: {
        title_filter: 'intern OR internship OR "high school" OR "summer job"',
        location_filter: 'United States',
        description_filter: 'student OR "high school" OR college OR intern',
        description_type: 'text'
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    };
    
    // Make the request to RapidAPI
    console.log('Making request to RapidAPI...');
    const response = await axios.request(options);
    
    if (!response.data) {
      console.error('No data returned from RapidAPI');
      return [];
    }
    
    console.log(`Received ${response.data.length} internships from RapidAPI`);
    
    // Display the first internship as a sample
    if (response.data.length > 0) {
      console.log('\nSample internship:');
      console.log(JSON.stringify(response.data[0], null, 2));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching internships from RapidAPI:', error);
    return [];
  }
}

// Function to filter internships for US-based opportunities
function filterInternships(internships) {
  console.log('\nFiltering internships for US-based opportunities...');
  
  // Filter for US-based internships
  const usInternships = internships.filter(internship => {
    // Check locations_derived array
    if (internship.countries_derived && internship.countries_derived.some(country => country.includes('United States'))) {
      return true;
    }
    
    // Check locations_raw
    if (internship.locations_raw && internship.locations_raw.some(loc => 
      loc.address && loc.address.addressCountry === 'US')) {
      return true;
    }
    
    // Check location string if available
    const location = (internship.location || '').toLowerCase();
    return location.includes('usa') || location.includes('united states') || 
           location.includes('us') || location.includes('america');
  });
  
  console.log(`Found ${usInternships.length} internships in the United States`);
  
  // Filter for student-friendly internships
  const studentInternships = usInternships.filter(internship => {
    const title = (internship.title || '').toLowerCase();
    const description = (internship.description || '').toLowerCase();
    
    return (
      title.includes('student') || 
      description.includes('student') ||
      title.includes('summer') || 
      description.includes('summer') ||
      title.includes('intern') || 
      description.includes('intern') ||
      title.includes('high school') || 
      description.includes('high school') ||
      title.includes('highschool') || 
      description.includes('highschool') ||
      title.includes('college') || 
      description.includes('college')
    );
  });
  
  console.log(`Found ${studentInternships.length} student-friendly internships in the US`);
  
  // Display the first filtered internship as a sample
  if (studentInternships.length > 0) {
    console.log('\nSample student-friendly internship in the US:');
    console.log(JSON.stringify(studentInternships[0], null, 2));
  }
  
  return studentInternships;
}

// Function to determine time commitment based on internship data
function determineTimeCommitment(internship) {
  const title = (internship.title || '').toLowerCase();
  const descriptionText = (internship.description_text || '').toLowerCase();
  
  if (title.includes('summer') || descriptionText.includes('summer')) {
    return 'Summer';
  } else if (title.includes('weekend') || descriptionText.includes('weekend') || descriptionText.includes('saturday') || descriptionText.includes('sunday')) {
    return 'Weekend';
  } else if (title.includes('evening') || descriptionText.includes('evening') || descriptionText.includes('after school') || descriptionText.includes('after-school')) {
    return 'Evening';
  } else {
    return null; // Default to null if time commitment can't be determined
  }
}

// Function to analyze time commitments in the filtered internships
function analyzeTimeCommitments(internships) {
  console.log('\nAnalyzing time commitments in filtered internships...');
  
  const timeCommitments = {
    Summer: 0,
    Weekend: 0,
    Evening: 0,
    Unknown: 0
  };
  
  for (const internship of internships) {
    const commitment = determineTimeCommitment(internship);
    if (commitment === 'Summer') {
      timeCommitments.Summer++;
    } else if (commitment === 'Weekend') {
      timeCommitments.Weekend++;
    } else if (commitment === 'Evening') {
      timeCommitments.Evening++;
    } else {
      timeCommitments.Unknown++;
    }
  }
  
  console.log('Time commitment breakdown:');
  console.log(`- Summer: ${timeCommitments.Summer}`);
  console.log(`- Weekend: ${timeCommitments.Weekend}`);
  console.log(`- Evening: ${timeCommitments.Evening}`);
  console.log(`- Unknown: ${timeCommitments.Unknown}`);
}

// Main function to run the script
async function main() {
  console.log('Starting RapidAPI Internships test script...');
  
  // Fetch internships from RapidAPI
  const internships = await fetchInternships();
  
  if (internships.length === 0) {
    console.log('No internships found. Exiting.');
    return;
  }
  
  // Filter internships for Houston, TX and high school students
  const filteredInternships = filterInternships(internships);
  
  if (filteredInternships.length === 0) {
    console.log('No matching internships found after filtering. Exiting.');
    return;
  }
  
  // Analyze time commitments
  analyzeTimeCommitments(filteredInternships);
  
  console.log('\nRapidAPI Internships test script completed successfully.');
}

// Run the script
main().catch(error => {
  console.error('Unexpected error in main function:', error);
});
