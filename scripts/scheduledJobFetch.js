/**
 * Scheduled Job Fetch
 * 
 * This script is designed to be run as a cron job to regularly fetch and classify jobs.
 * It runs the fetchAndClassifyJobs.js script and logs the results.
 * 
 * Example cron schedule (daily at 2 AM):
 * 0 2 * * * node /path/to/scheduledJobFetch.js >> /path/to/logs/job-fetch.log 2>&1
 */

import { exec } from 'child_process';
import { appendFile } from 'fs/promises';
import path from 'path';

// Log file path
const logFilePath = path.join(process.cwd(), 'logs', 'job-fetch.log');

// Function to log messages with timestamps
async function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  try {
    await appendFile(logFilePath, logMessage);
  } catch (error) {
    console.error(`Error writing to log file: ${error.message}`);
  }
}

// Function to execute the fetch and classify script
async function runFetchAndClassify() {
  return new Promise((resolve, reject) => {
    const startTime = new Date();
    
    log(`Starting scheduled job fetch at ${startTime.toLocaleString()}`);
    
    exec('node --experimental-modules scripts/fetchAndClassifyJobs.js', async (error, stdout, stderr) => {
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // Duration in seconds
      
      if (error) {
        await log(`Error executing fetchAndClassifyJobs.js: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        await log(`Errors from fetchAndClassifyJobs.js: ${stderr}`);
      }
      
      await log(`Output from fetchAndClassifyJobs.js:\n${stdout}`);
      await log(`Job fetch completed in ${duration} seconds`);
      
      resolve();
    });
  });
}

// Main function
async function main() {
  try {
    await runFetchAndClassify();
  } catch (error) {
    await log(`Unhandled error in scheduledJobFetch.js: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
