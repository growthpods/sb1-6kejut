/**
 * Run the job classification scripts
 * 
 * This script executes both the updateJobEducationLevels.js and updateJobTimeCommitments.js
 * scripts to analyze and classify jobs based on:
 * 1. Education level (High School or College)
 * 2. Time commitment (Evening, Weekend, Summer)
 */

import { exec } from 'child_process';

console.log('Starting comprehensive job classification process...');

// Function to execute a script and return a promise
function executeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Executing ${scriptPath}...`);
    
    exec(`node --experimental-modules ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${scriptPath}: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Error in ${scriptPath}: ${stderr}`);
      }
      
      console.log(stdout);
      resolve();
    });
  });
}

// Run the scripts sequentially
async function runClassificationScripts() {
  try {
    // Step 1: Update education levels
    console.log('Step 1: Analyzing jobs to determine whether they are suitable for high school or college students...');
    await executeScript('scripts/updateJobEducationLevels.js');
    
    // Step 2: Update time commitments
    console.log('\nStep 2: Analyzing jobs to determine appropriate time commitments (Evening, Weekend, Summer)...');
    await executeScript('scripts/updateJobTimeCommitments.js');
    
    console.log('\nJob classification complete!');
    console.log('All jobs have been analyzed and classified based on:');
    console.log('1. Education level (High School or College)');
    console.log('2. Time commitment (Evening, Weekend, Summer)');
    console.log('\nThese classifications will be used to filter and display jobs appropriately based on user selection.');
  } catch (error) {
    console.error('Error running classification scripts:', error);
  }
}

// Run the classification scripts
runClassificationScripts();
