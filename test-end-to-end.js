import 'dotenv/config';
import { getEducationLevelParser } from './src/lib/educationLevelParser.js';
import { getTimeCommitmentParser } from './src/lib/timeCommitmentParser.js';

const educationLevelParser = getEducationLevelParser();
const timeCommitmentParser = getTimeCommitmentParser();

async function runTest() {
  const sampleJob = {
    title: 'Software Engineer Intern',
    description: 'This is a summer internship for a software engineer. Must be enrolled in a college-level computer science program.',
    requirements: ['Pursuing a BS in Computer Science', 'Experience with JavaScript'],
  };

  console.log('--- Running End-to-End Test ---');
  console.log('Sample Job:', JSON.stringify(sampleJob, null, 2));

  try {
    const educationLevel = await educationLevelParser.parseEducationLevelFromText(
      sampleJob.title,
      sampleJob.description,
      sampleJob.requirements
    );
    console.log(`Education Level Classified: ${educationLevel}`);

    const timeCommitment = await timeCommitmentParser.parseTimeCommitmentFromText(
      sampleJob.title,
      sampleJob.description,
      sampleJob.requirements
    );
    console.log(`Time Commitment Classified: ${timeCommitment}`);
  } catch (error) {
    console.error('Test failed:', error);
  }

  console.log('--- Test Complete ---');
}

runTest();
