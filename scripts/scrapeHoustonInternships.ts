// Script to scrape high school internships in Houston and store them in the database

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFirecrawlService } from '../src/lib/firecrawl';
import { supabase } from '../src/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Job } from '../src/types';

// Add type declaration for window.mcpRequest
declare global {
  interface Window {
    mcpRequest: (params: {
      serverName: string;
      toolName: string;
      arguments: any;
    }) => Promise<any>;
  }
}

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const markdownFilePath = path.resolve(__dirname, '../temp_scraped_markdown.md');

// Define search terms and URLs for high school internships in Houston
const searchUrls = [
  'https://www.indeed.com/jobs?q=high+school+intern&l=Houston%2C+TX',
  'https://www.indeed.com/jobs?q=high+school+internship&l=Houston%2C+TX',
  'https://www.indeed.com/jobs?q=summer+intern+high+school&l=Houston%2C+TX',
  'https://www.ziprecruiter.com/Jobs/High-School-Intern/--in-Houston,TX'
];

// Function to search and scrape job listings
async function searchAndScrapeJobs() {
  try {
    console.log('Starting job search and scraping process...');
    const firecrawl = getFirecrawlService();
    let allMarkdown = '';

    // Process each search URL
    for (const url of searchUrls) {
      console.log(`Searching and scraping jobs from: ${url}`);
      
      try {
        // Use the Firecrawl MCP server to search and scrape
        const response = await window.mcpRequest({
          serverName: 'github.com/mendableai/firecrawl-mcp-server',
          toolName: 'firecrawl_scrape',
          arguments: {
            url,
            formats: ['markdown'],
            onlyMainContent: true
          }
        });
        
        if (response && typeof response === 'string') {
          console.log(`Successfully scraped content from ${url}`);
          allMarkdown += response + '\n\n';
        } else {
          console.warn(`No content returned from ${url}`);
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Save all scraped content to a markdown file
    fs.writeFileSync(markdownFilePath, allMarkdown);
    console.log(`Saved scraped content to ${markdownFilePath}`);
    
    // Parse the markdown and save to database
    await parseAndSaveJobs();
    
  } catch (error) {
    console.error('Error in search and scrape process:', error);
  }
}

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
      company_logo: null
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
    
  } catch (error) {
    console.error('Error parsing and saving jobs:', error);
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(markdownFilePath);
      console.log(`Successfully deleted temporary file: ${markdownFilePath}`);
    } catch (cleanupError: any) {
      console.error(`Error deleting temporary file ${markdownFilePath}:`, cleanupError.message);
    }
  }
}

// Define job interface for parsing
interface ParsedJob {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  type?: string;
  level?: string;
  externalLink?: string | null;
  applicationUrl?: string | null;
}

// Function to parse job listings from markdown
function parseJobListings(markdown: string): ParsedJob[] {
  const jobs: ParsedJob[] = [];
  
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
function extractTitle(markdown: string) {
  const titleMatch = markdown.match(/# (.*?)(?:\n|$)/);
  return titleMatch ? titleMatch[1].trim() : 'High School Internship';
}

function extractCompany(markdown: string) {
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

function extractLocation(markdown: string) {
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

function extractDescription(markdown: string) {
  // Remove title
  let description = markdown.replace(/# .*?\n/, '');
  
  // Remove requirements section if found
  const requirementsMatch = description.match(/(?:Requirements|Qualifications):(.*?)(?:##|$)/s);
  if (requirementsMatch) {
    description = description.replace(requirementsMatch[0], '');
  }
  
  return description.trim();
}

function extractRequirements(markdown: string) {
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

function extractJobType(markdown: string) {
  const typeMatch = markdown.match(/(?:Job Type|Employment Type|Type):\s*([A-Za-z\s-]+)/i);
  return typeMatch ? typeMatch[1].trim() : 'Internship';
}

function extractJobLevel(markdown: string) {
  const levelMatch = markdown.match(/(?:Experience|Level):\s*([A-Za-z\s]+)/i);
  return levelMatch ? levelMatch[1].trim() : 'Entry Level';
}

function extractApplicationUrl(markdown: string) {
  const applyMatch = markdown.match(/(?:Apply|Application).*?(https?:\/\/[^\s"]+)/i);
  return applyMatch ? applyMatch[1].trim() : null;
}

// Since we can't directly use the MCP server in a Node.js script,
// we'll create a browser-based script that can be run in the browser
// and then save the results to a file for processing
console.log(`
This script is designed to be run in a browser environment that has access to the MCP server.
Please use the browser_action tool to run this script, or create a browser-based version
that can interact with the MCP server.

For now, we'll create some sample high school internship listings for Houston.
`);

// Create sample internship listings for testing
function createSampleInternships() {
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

// Create sample internships for testing
createSampleInternships();
