"use strict";
// Script to read scraped markdown from a file, parse it, and save jobs to Supabase
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs")); // Import file system module
const path_1 = __importDefault(require("path")); // Import path module
const uuid_1 = require("uuid");
const url_1 = require("url"); // Import fileURLToPath
const supabase_1 = require("../src/lib/supabase"); // Import supabase client
// --- Read Scraped Markdown from File ---
// Get the directory name in ES module scope
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Correct the path to go up one level from the script's directory
const markdownFilePath = path_1.default.resolve(__dirname, '../temp_scraped_markdown.md');
let scrapedMarkdown;
try {
    scrapedMarkdown = fs_1.default.readFileSync(markdownFilePath, 'utf-8');
    console.log(`Successfully read markdown from ${markdownFilePath}`);
}
catch (error) {
    console.error(`Error reading markdown file at ${markdownFilePath}:`, error.message);
    process.exit(1); // Exit if the file can't be read
}
// --- Simple Markdown Parser (Alternative Approach with Debugging) ---
function parseIndeedMarkdown(markdown) {
    const jobs = [];
    // Split by the markdown table separator, which seems to delimit job entries
    const jobBlocks = markdown.split('| --- | --- |');
    const maxJobs = 50; // Increased limit
    console.log(`Parsing markdown, found ${jobBlocks.length} potential job blocks.`);
    // Start from the second block as the first one is usually header/filters/ads
    for (let i = 1; i < jobBlocks.length && jobs.length < maxJobs; i++) {
        const block = jobBlocks[i].trim();
        // Split lines, trim whitespace, and remove empty lines
        const lines = block.split('\\n').map(line => line.trim()).filter(Boolean);
        // console.log(`\nDEBUG: Processing Block ${i}:`);
        // console.log(`  Lines (first 5):`, lines.slice(0, 5));
        if (lines.length < 1)
            continue; // Need at least a title line
        // Regex to capture title and external link from markdown link format ## [Title](Link)
        const titleMatch = lines[0].match(/## \[(.*?)\]\((.*?)\)/);
        if (!titleMatch || titleMatch.length < 3) {
            // console.log(`  DEBUG: No title match found for line: ${lines[0]}`);
            continue; // Couldn't find title/link
        }
        // console.log(`  DEBUG: Title match found: ${titleMatch[1]}`);
        const title = titleMatch[1].trim();
        const externalLink = titleMatch[2].trim();
        let company = 'N/A';
        let location = 'N/A';
        let descriptionLines = [];
        let companyLineIndex = -1;
        let locationLineIndex = -1;
        // Iterate through lines to find company and location, assuming a common structure
        for (let j = 1; j < lines.length; j++) {
            const line = lines[j];
            // Skip logo lines
            if (line.startsWith('!['))
                continue;
            // Skip lines that are likely metadata/tags/buttons
            if (line.startsWith('-') || line.includes('hour') || line.includes('week') || line.includes('Easily apply') || line.includes('EmployerActive') || line.includes('Typically responds') || line.includes('View similar') || line.includes('Hiring multiple') || line.startsWith('New<br>'))
                continue;
            // Potential Company Line (often first non-metadata line after title)
            if (company === 'N/A' && !line.includes(',')) { // Assume company names don't usually contain commas
                const companyMatch = line.match(/^([^<]*?)(?:<br>)?(?:[\d\.]+)?$/); // Try to extract text before <br> or rating
                if (companyMatch && companyMatch[1].trim()) {
                    company = companyMatch[1].trim();
                    companyLineIndex = j;
                    continue; // Move to next line after finding company
                }
            }
            // Potential Location Line (often contains City, ST format)
            if (location === 'N/A' && line.includes(',') && line.match(/[A-Z]{2}(\s+\d{5})?$/)) {
                const potentialLocation = line.split('<br>')[0].trim(); // Take text before <br> if present
                // Additional check to avoid lines that are just ratings or other text
                if (!potentialLocation.match(/^\d+\.\d+$/) && potentialLocation.length < 50) { // Avoid overly long lines or just numbers
                    location = potentialLocation;
                    locationLineIndex = j;
                    continue; // Move to next line after finding location
                }
            }
            // Assume lines after company/location (whichever is found last) are part of the description
            const lastFoundIndex = Math.max(companyLineIndex, locationLineIndex);
            if (j > lastFoundIndex && lastFoundIndex !== -1) {
                // Filter out common footer/link lines from description
                if (!line.includes('View all') && !line.includes('Salary Search') && !line.includes('See popular')) {
                    descriptionLines.push(line);
                }
            }
        }
        // Join description lines, replace markdown escapes
        const description = descriptionLines.join('\n').replace(/\\n/g, '\n').trim() || 'No description available.';
        jobs.push({
            title,
            externalLink,
            company,
            location,
            description,
        });
    }
    return jobs;
}
async function processAndSaveJobs() {
    console.log('Starting job processing...');
    if (!scrapedMarkdown || scrapedMarkdown.trim() === '') {
        console.error("Error: Scraped markdown content is empty or could not be read.");
        return;
    }
    // --- Parse Scraped Data ---
    const parsedJobs = parseIndeedMarkdown(scrapedMarkdown);
    console.log(`Parsed ${parsedJobs.length} job listings from markdown.`);
    if (parsedJobs.length === 0) {
        console.log("No jobs parsed. Exiting.");
        return;
    }
    // --- Format Data for Supabase ---
    // Map parsed data to the expected Supabase table structure (snake_case)
    // Generate UUIDs here before upserting
    const jobsToUpsert = parsedJobs.map((jobData) => ({
        id: (0, uuid_1.v4)(), // Generate ID for each job
        title: jobData.title || 'N/A',
        company: jobData.company || 'N/A',
        location: jobData.location || 'N/A',
        description: jobData.description || 'No description available.',
        // Default values for fields not parsed:
        requirements: [], // Defaulting as parser doesn't extract this
        type: 'Full-Time', // Defaulting
        level: 'Entry Level', // Defaulting
        applicants: 0,
        posted_at: new Date().toISOString(), // Use current date/time for scraped jobs
        external_link: jobData.externalLink || null, // Use null if undefined
        company_logo: null, // Defaulting as parser doesn't extract this
    }));
    console.log(`Formatted ${jobsToUpsert.length} jobs for Supabase.`);
    // --- Save Data to Supabase ---
    try {
        console.log(`Attempting to upsert ${jobsToUpsert.length} jobs to Supabase...`);
        const { data, error } = await supabase_1.supabase
            .from('jobs')
            .upsert(jobsToUpsert, {
            onConflict: 'title, company', // Avoid duplicates based on title and company
            ignoreDuplicates: true // Changed from false to true - don't error on duplicate, just skip
        });
        if (error) {
            console.error('Supabase upsert error:', error.message);
            throw error;
        }
        // Supabase upsert with ignoreDuplicates might return null for data even on success
        console.log(`Supabase upsert operation completed.`);
        // console.log('Upsert result data:', data); // Data might be null
    }
    catch (error) {
        console.error('Error saving jobs to Supabase:', error);
    }
    finally {
        // --- Clean up temporary file ---
        try {
            fs_1.default.unlinkSync(markdownFilePath);
            console.log(`Successfully deleted temporary file: ${markdownFilePath}`);
        }
        catch (cleanupError) {
            console.error(`Error deleting temporary file ${markdownFilePath}:`, cleanupError.message);
        }
    }
}
processAndSaveJobs();
