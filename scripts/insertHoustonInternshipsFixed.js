// Script to insert Houston internships directly into the Supabase database

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create a Supabase client for Node.js
const supabaseUrl = 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to create Houston internship listings
function createHoustonInternships() {
  console.log('Creating Houston internship listings...');
  
  // Sample internship data
  const houstonInternships = [
    {
      id: uuidv4(),
      title: "Software Development Intern",
      company: "TechHouston",
      location: "Houston, TX",
      description: "We're looking for a talented high school student to join our software development team for the summer. This is a great opportunity to gain real-world experience in a fast-paced tech environment.",
      requirements: [
        "Currently enrolled in high school",
        "Basic knowledge of programming (JavaScript, Python, or similar)",
        "Eager to learn and grow",
        "Available to work 20 hours per week during summer"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://techhouston.example.com/careers/apply",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "Marketing Intern",
      company: "Houston Media Group",
      location: "Houston, TX",
      description: "Join our marketing team for a summer internship! You'll get hands-on experience with social media management, content creation, and digital marketing campaigns.",
      requirements: [
        "High school student (rising junior or senior preferred)",
        "Interest in marketing and communications",
        "Creative mindset",
        "Good writing skills",
        "Familiarity with social media platforms"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "mailto:careers@houstonmedia.example.com",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "Research Assistant Intern",
      company: "Houston Medical Center",
      location: "Houston, TX",
      description: "The Houston Medical Center is seeking a motivated high school student to assist our research team during the summer months. This internship provides a unique opportunity to gain experience in a medical research environment.",
      requirements: [
        "Current high school student with interest in medicine or science",
        "Strong attention to detail",
        "Basic computer skills",
        "Ability to follow instructions precisely",
        "Interest in healthcare or medical research"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://houstonmedical.example.com/internships",
      company_logo: null,
      employer_id: "system"
    },
    {
      id: uuidv4(),
      title: "Engineering Intern",
      company: "Houston Engineering Solutions",
      location: "Houston, TX",
      description: "Houston Engineering Solutions is offering a summer internship program for high school students interested in engineering. This hands-on program will provide real-world experience in various engineering disciplines.",
      requirements: [
        "Current high school student (junior or senior)",
        "Strong interest in engineering",
        "Good math and science skills",
        "Ability to work in a team environment",
        "Willingness to learn and take direction"
      ],
      type: "Internship",
      level: "Entry Level",
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: "https://houstonengineering.example.com/careers/internships",
      company_logo: null,
      employer_id: "system"
    }
  ];
  
  return houstonInternships;
}

// Function to insert internships into Supabase
async function insertInternships() {
  console.log('Inserting Houston internships into Supabase...');
  
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
        if (error.code === '42501') {
          console.error('Permission denied. This is likely due to Row Level Security (RLS) policies.');
          console.error('Try using the service_role key instead of the anon key, or disable RLS for this operation.');
        }
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

// Run the script
console.log('Starting script execution...');
insertInternships();
