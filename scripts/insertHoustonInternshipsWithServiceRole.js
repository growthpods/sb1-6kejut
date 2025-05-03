// Script to insert Houston internships into Supabase using the service role key to bypass RLS policies

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a Supabase client with the service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not defined in the environment variables');
  console.error('Please add it to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to remove sample jobs
async function removeSampleJobs() {
  console.log('Removing sample jobs from the database...');
  
  try {
    // Delete jobs with employer_id = 'system'
    const { data, error } = await supabase
      .from('jobs')
      .delete()
      .eq('employer_id', 'system');
      
    if (error) {
      console.error('Error removing sample jobs:', error);
      return false;
    }
    
    console.log('Sample jobs removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing sample jobs:', error);
    return false;
  }
}

// Function to create real Houston internship listings
function createHoustonInternships() {
  console.log('Creating real Houston internship listings...');
  
  // Real internship data based on scraped information
  const houstonInternships = [
    {
      id: uuidv4(),
      title: "High School Emerging Researcher Experience",
      company: "Houston Methodist",
      location: "Houston, TX",
      description: "The High School Emerging Researcher Experience is designed to introduce a select group of academically outstanding juniors and seniors to the world of translational research. By working alongside undergraduate research interns, students will gain valuable insights into the research process. Each summer project will be selected by the mentor assigned to the student and their specific area of expertise.",
      requirements: [
        "High school students who are currently in their junior or senior year",
        "Will be at least 16 years old by the start of the program (June 9th, 2025)",
        "Minimum 3.5 GPA",
        "Full-time commitment for the 8-week duration (June 9–August 1, 2025)"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://www.houstonmethodist.org/academic-institute/education/research/summer-internship-program/highschoolresearchinternship/",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "UPWARDS High School Summer Research Training Program",
      company: "MD Anderson Cancer Center",
      location: "Houston, TX",
      description: "The MD Anderson Cancer Center UPWARDS research training initiative was instituted to offer hands-on, laboratory-based research experience so as to encourage underserved students to enter into STEM based academic and professional careers. Accepted students will take part in a paid/ full-time (40 hours a week) on-campus summer research experience at MD Anderson.",
      requirements: [
        "Local high school student (incoming senior for the fall of 2025)",
        "18 years or older by June 2, 2025",
        "Identifies as economically disadvantaged, educationally disadvantaged, with disabilities, or a first-generation student"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs/programs/upwards-summer-program.html",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "NASA OSTEM High School Internship",
      company: "NASA Johnson Space Center",
      location: "Houston, TX",
      description: "NASA's Office of STEM Engagement (OSTEM) paid internships allow high school students to contribute to the agency's mission to advance science, technology, aeronautics, and space exploration. OSTEM internships offer students an opportunity to gain practical work experience while working side-by-side with mentors who are research scientists, engineers, and individuals from many other professions.",
      requirements: [
        "U.S. Citizen",
        "3.0 GPA on a 4.0 scale",
        "Be a full-time high school student",
        "Must be 16 years old at time of application"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://stemgateway.nasa.gov/public/s/explore-opportunities",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "Texas High School Aerospace Scholars Program",
      company: "NASA Johnson Space Center",
      location: "Houston, TX",
      description: "The High School Aerospace Scholars (HAS) program is a unique educational experience that combines online learning with an onsite summer experience at NASA Johnson Space Center. Texas high school juniors learn about space exploration, Earth science, technology, mathematics, and aeronautics through this interactive program.",
      requirements: [
        "Must be a Texas high school junior",
        "U.S. citizen",
        "Interest in science, technology, engineering, and mathematics",
        "Able to commit to a one-week summer experience at NASA Johnson Space Center"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://www.nasa.gov/centers-and-facilities/johnson/texas-high-school-aerospace-scholars-a-launchpad-for-future-innovators/",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "Summer Junior Volunteer Program",
      company: "Harris Health System",
      location: "Houston, TX",
      description: "The Harris Health Summer Junior Volunteer Program offers high school students the opportunity to gain valuable experience in a healthcare setting. Volunteers assist staff, interact with patients, and learn about various healthcare careers while contributing to the community.",
      requirements: [
        "High school student (ages 16-18)",
        "Minimum GPA of 3.0",
        "Ability to commit to at least 4 weeks during summer",
        "Interest in healthcare careers"
      ],
      type: "Volunteer",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://www.harrishealth.org/volunteer-services",
      company_logo: null,
      employer_id: "system"
    }
  ];
  
  return houstonInternships;
}

// Function to insert internships into Supabase
async function insertInternships() {
  console.log('Inserting real Houston internships into Supabase...');
  
  try {
    // Create Houston internship listings
    const houstonInternships = createHoustonInternships();
    console.log(`Created ${houstonInternships.length} Houston internship listings`);
    
    // Check if any of the internships already exist in the database
    // by comparing title and company
    const existingJobs = [];
    for (const job of houstonInternships) {
      const { data, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .eq('company', job.company);
        
      if (error) {
        console.error('Error checking for existing job:', error);
        continue;
      }
      
      if (data && data.length > 0) {
        existingJobs.push({ title: job.title, company: job.company });
      }
    }
    
    if (existingJobs.length === houstonInternships.length) {
      console.log('All Houston internships already exist in the database. No update needed.');
      return;
    }
    
    // Filter out internships that already exist
    const newInternships = houstonInternships.filter(job => 
      !existingJobs.some(existingJob => 
        existingJob.title === job.title && existingJob.company === job.company
      )
    );
    
    console.log(`Inserting ${newInternships.length} new Houston internships into the database`);
    
    // Insert internships in batches to avoid rate limits
    const BATCH_SIZE = 2;
    const BATCH_DELAY = 1000;
    
    const batches = [];
    for (let i = 0; i < newInternships.length; i += BATCH_SIZE) {
      batches.push(newInternships.slice(i, i + BATCH_SIZE));
    }
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Inserting batch ${i + 1}/${batches.length} (${batch.length} internships)...`);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(batch);
        
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        console.log(`Successfully inserted batch ${i + 1}`);
      }
      
      // Add a small delay between batches to avoid rate limits
      if (i < batches.length - 1) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await delay(BATCH_DELAY);
      }
    }
    
    // Verify the internships were added by counting the total
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting jobs:', countError);
      return;
    }
    
    console.log(`Total number of jobs in the database: ${count}`);
    
  } catch (error) {
    console.error('Error inserting internships:', error);
  }
}

// Main function to run the script
async function main() {
  console.log('Starting script execution...');
  
  // First try to remove sample jobs from Supabase
  const removedSampleJobs = await removeSampleJobs();
  
  if (removedSampleJobs) {
    console.log('Successfully removed sample jobs from Supabase');
  } else {
    console.log('Failed to remove sample jobs from Supabase');
    console.log('Proceeding with inserting new jobs anyway...');
  }
  
  // Try to insert real Houston internships into Supabase
  await insertInternships();
  
  console.log('Script execution completed');
}

// Run the script
main();
