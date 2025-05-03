// Script to update the public/jobs.json file with Houston internships

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jobsJsonPath = path.resolve(__dirname, '../public/jobs.json');

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
      postedAt: new Date().toISOString(),
      externalLink: "https://techhouston.example.com/careers/apply",
      timeCommitment: "Summer"
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
      postedAt: new Date().toISOString(),
      externalLink: "mailto:careers@houstonmedia.example.com",
      timeCommitment: "Summer"
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
      postedAt: new Date().toISOString(),
      externalLink: "https://houstonmedical.example.com/internships",
      timeCommitment: "Summer"
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
      postedAt: new Date().toISOString(),
      externalLink: "https://houstonengineering.example.com/careers/internships",
      timeCommitment: "Summer"
    }
  ];
  
  return houstonInternships;
}

// Function to update the jobs.json file
function updateJobsJson() {
  console.log('Updating jobs.json file...');
  
  try {
    // Read the existing jobs.json file
    const existingJobs = JSON.parse(fs.readFileSync(jobsJsonPath, 'utf-8'));
    console.log(`Read ${existingJobs.length} existing jobs from jobs.json`);
    
    // Create Houston internship listings
    const houstonInternships = createHoustonInternships();
    console.log(`Created ${houstonInternships.length} Houston internship listings`);
    
    // Check if any of the Houston internships already exist in the jobs.json file
    // by comparing title and company
    const newInternships = houstonInternships.filter(newJob => 
      !existingJobs.some(existingJob => 
        existingJob.title === newJob.title && existingJob.company === newJob.company
      )
    );
    
    if (newInternships.length === 0) {
      console.log('All Houston internships already exist in jobs.json. No update needed.');
      return;
    }
    
    console.log(`Adding ${newInternships.length} new Houston internships to jobs.json`);
    
    // Combine existing jobs with new internships
    const updatedJobs = [...existingJobs, ...newInternships];
    
    // Write the updated jobs to jobs.json
    fs.writeFileSync(jobsJsonPath, JSON.stringify(updatedJobs, null, 2));
    console.log(`Successfully updated jobs.json with ${newInternships.length} new Houston internships`);
    console.log(`Total jobs in jobs.json: ${updatedJobs.length}`);
    
  } catch (error) {
    console.error('Error updating jobs.json:', error);
  }
}

// Run the update
updateJobsJson();
