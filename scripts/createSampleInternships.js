// Script to create sample high school internships in Houston and store them in the database

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create a Supabase client for Node.js
const supabaseUrl = 'https://jhboikdocmcnpvbtanwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYm9pa2RvY21jbnB2YnRhbndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzAwNDUsImV4cCI6MjA0ODQwNjA0NX0.-GjCaxHbkCtmrOKpBkzL6foxhhy6aNLFBdeAJtxVmos';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const markdownFilePath = path.resolve(__dirname, '../temp_scraped_markdown.md');

// Function to parse job listings from markdown and save to database
async function parseAndSaveJobs() {
  console.log('Parsing job listings from markdown...');
  
  try {
    // Read the markdown file
    const markdown = fs.readFileSync(markdownFilePath, 'utf-8');
    
    // Parse job listings from markdown
    const jobs = parseJobListings(markdown);
    console.log(`Parsed ${jobs.length} job listings from markdown.`);
    
    if (jobs.length === 0) {
      console.log('No jobs parsed. Exiting.');
      return;
    }
    
    // Format jobs for Supabase
    const jobsToUpsert = jobs.map(job => ({
      id: uuidv4(),
      title: job.title || 'High School Internship',
      company: job.company || 'Unknown Company',
      location: job.location || 'Houston, TX',
      description: job.description || 'No description available.',
      requirements: job.requirements || [],
      type: job.type || 'Internship',
      level: job.level || 'Entry Level',
      time_commitment: 'Summer', // Default to Summer for high school internships
      applicants: 0,
      posted_at: new Date().toISOString(),
      external_link: job.externalLink || null,
      application_url: job.applicationUrl || null,
      company_logo: null,
      employer_id: 'system' // Use 'system' as the employer_id for sample jobs
    }));
    
    // Save to Supabase
    console.log(`Attempting to upsert ${jobsToUpsert.length} jobs to Supabase...`);
    const { data, error } = await supabase
      .from('jobs')
      .upsert(jobsToUpsert, {
        onConflict: 'title, company',
        ignoreDuplicates: true
      });
      
    if (error) {
      console.error('Supabase upsert error:', error.message);
      throw error;
    }
    
    console.log('Supabase upsert operation completed successfully.');
    console.log('Upserted data:', data);
    
    // Verify the jobs were added by counting the total
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting jobs:', countError.message);
      return;
    }
    
    console.log(`Total number of jobs in the database after upsert: ${count}`);
    
  } catch (error) {
    console.error('Error parsing and saving jobs:', error);
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(markdownFilePath);
      console.log(`Successfully deleted temporary file: ${markdownFilePath}`);
    } catch (cleanupError) {
      console.error(`Error deleting temporary file ${markdownFilePath}:`, cleanupError.message);
    }
  }
}

// Function to parse job listings from markdown
function parseJobListings(markdown) {
  const jobs = [];
  
  // Split the markdown into job blocks
  const jobBlocks = markdown.split('# ').filter(Boolean);
  
  for (const block of jobBlocks) {
    try {
      // Add the # back to the beginning of the block for proper parsing
      const jobMarkdown = '# ' + block;
      
      // Extract job details
      const title = extractTitle(jobMarkdown);
      const company = extractCompany(jobMarkdown);
      const location = extractLocation(jobMarkdown) || 'Houston, TX';
      const description = extractDescription(jobMarkdown);
      const requirements = extractRequirements(jobMarkdown);
      const type = extractJobType(jobMarkdown) || 'Internship';
      const level = extractJobLevel(jobMarkdown) || 'Entry Level';
      const applicationUrl = extractApplicationUrl(jobMarkdown);
      
      // Create job object
      const job = {
        title,
        company,
        location,
        description,
        requirements,
        type,
        level,
        externalLink: null, // We don't have the original URL
        applicationUrl
      };
      
      jobs.push(job);
    } catch (error) {
      console.error('Error parsing job block:', error);
    }
  }
  
  return jobs;
}

// Helper functions to extract job details from markdown
function extractTitle(markdown) {
  const titleMatch = markdown.match(/# (.*?)(?:\n|$)/);
  return titleMatch ? titleMatch[1].trim() : 'High School Internship';
}

function extractCompany(markdown) {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  
  // Look for company patterns
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const companyMatch = lines[i].match(/(?:at|by|from) ([A-Z][A-Za-z0-9\s&.,]+)/) || 
                        lines[i].match(/^([A-Z][A-Za-z0-9\s&.,]+)$/);
    if (companyMatch && !lines[i].includes('#')) {
      return companyMatch[1].trim();
    }
  }
  
  return 'Unknown Company';
}

function extractLocation(markdown) {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  
  // Look for location patterns
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const locationMatch = lines[i].match(/Location:?\s*([^,]+,\s*[A-Z]{2})/) || 
                         lines[i].match(/([A-Za-z\s]+,\s*[A-Z]{2})/);
    if (locationMatch) {
      return locationMatch[1].trim();
    }
  }
  
  return 'Houston, TX';
}

function extractDescription(markdown) {
  // Remove title
  let description = markdown.replace(/# .*?\n/, '');
  
  // Remove requirements section if found
  const requirementsMatch = description.match(/(?:Requirements|Qualifications):(.*?)(?:##|$)/s);
  if (requirementsMatch) {
    description = description.replace(requirementsMatch[0], '');
  }
  
  return description.trim();
}

function extractRequirements(markdown) {
  const requirementsMatch = markdown.match(/(?:Requirements|Qualifications):(.*?)(?:##|$)/s);
  
  if (requirementsMatch) {
    const reqSection = requirementsMatch[1];
    return reqSection
      .split('\n')
      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[*-]\s*/, '').trim());
  }
  
  return [];
}

function extractJobType(markdown) {
  const typeMatch = markdown.match(/(?:Job Type|Employment Type|Type):\s*([A-Za-z\s-]+)/i);
  return typeMatch ? typeMatch[1].trim() : 'Internship';
}

function extractJobLevel(markdown) {
  const levelMatch = markdown.match(/(?:Experience|Level):\s*([A-Za-z\s]+)/i);
  return levelMatch ? levelMatch[1].trim() : 'Entry Level';
}

function extractApplicationUrl(markdown) {
  const applyMatch = markdown.match(/(?:Apply|Application).*?(https?:\/\/[^\s"]+)/i);
  return applyMatch ? applyMatch[1].trim() : null;
}

// Create sample internship listings for testing
function createSampleInternships() {
  console.log('Creating sample internship listings for Houston...');
  
  const sampleMarkdown = `
# Software Development Intern
at TechHouston

Location: Houston, TX

## About the Role

We're looking for a talented high school student to join our software development team for the summer. This is a great opportunity to gain real-world experience in a fast-paced tech environment.

## Responsibilities

* Assist in developing and maintaining web applications
* Write clean, maintainable code
* Collaborate with senior developers on projects
* Participate in code reviews and team meetings
* Debug and fix issues as they arise

## Requirements

* Currently enrolled in high school
* Basic knowledge of programming (JavaScript, Python, or similar)
* Eager to learn and grow
* Available to work 20 hours per week during summer

## Details

* Job Type: Internship
* Duration: 3 months (Summer 2025)
* Location: Houston, TX (Hybrid)
* Compensation: $15/hour

Apply now: https://techhouston.example.com/careers/apply

# Marketing Intern
at Houston Media Group

Location: Houston, TX

## About the Role

Join our marketing team for a summer internship! You'll get hands-on experience with social media management, content creation, and digital marketing campaigns.

## Responsibilities

* Assist with social media content creation and scheduling
* Help develop marketing materials
* Conduct market research
* Support the team with administrative tasks
* Participate in brainstorming sessions

## Requirements

* High school student (rising junior or senior preferred)
* Interest in marketing and communications
* Creative mindset
* Good writing skills
* Familiarity with social media platforms

## Details

* Job Type: Internship
* Duration: 8 weeks (June-August 2025)
* Location: Houston, TX (In-office)
* Compensation: $14/hour

Apply by sending your resume to careers@houstonmedia.example.com

# Research Assistant Intern
at Houston Medical Center

Location: Houston, TX

## About the Role

The Houston Medical Center is seeking a motivated high school student to assist our research team during the summer months. This internship provides a unique opportunity to gain experience in a medical research environment.

## Responsibilities

* Assist researchers with data collection and entry
* Help organize and maintain research materials
* Observe laboratory procedures
* Participate in team meetings
* Assist with literature reviews

## Requirements

* Current high school student with interest in medicine or science
* Strong attention to detail
* Basic computer skills
* Ability to follow instructions precisely
* Interest in healthcare or medical research

## Details

* Job Type: Internship
* Duration: 10 weeks (Summer 2025)
* Location: Houston Medical Center, Houston, TX
* Compensation: Unpaid, but eligible for school credit

Apply now: https://houstonmedical.example.com/internships

# Engineering Intern
at Houston Engineering Solutions

Location: Houston, TX

## About the Role

Houston Engineering Solutions is offering a summer internship program for high school students interested in engineering. This hands-on program will provide real-world experience in various engineering disciplines.

## Responsibilities

* Assist engineers with basic design tasks
* Help with data collection and analysis
* Participate in field visits and observations
* Assist with documentation and reporting
* Attend team meetings and presentations

## Requirements

* Current high school student (junior or senior)
* Strong interest in engineering
* Good math and science skills
* Ability to work in a team environment
* Willingness to learn and take direction

## Details

* Job Type: Internship
* Duration: 8 weeks (June-July 2025)
* Location: Houston, TX
* Compensation: $16/hour

To apply, visit https://houstonengineering.example.com/careers/internships
`;

  // Save sample markdown to file
  fs.writeFileSync(markdownFilePath, sampleMarkdown);
  console.log(`Created sample internship listings and saved to ${markdownFilePath}`);
  
  // Parse and save the sample internships
  parseAndSaveJobs();
}

// Run the script
console.log('Starting script execution...');
createSampleInternships();
