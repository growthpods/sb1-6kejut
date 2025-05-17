/**
 * Run the updateJobEducationLevels script
 * 
 * This script executes the updateJobEducationLevels.js script to analyze and classify
 * jobs as either suitable for high school or college students.
 */

import { exec } from 'child_process';

console.log('Starting job classification process...');
console.log('Analyzing jobs to determine whether they are suitable for high school or college students...');

// Execute the script with Node.js
exec('node --experimental-modules scripts/updateJobEducationLevels.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('Job classification complete!');
  console.log('All jobs have been analyzed and classified as either "High School" or "College" based on their requirements and complexity.');
});
