import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:8888';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = process.env.TEST_JOB_POST_EMAIL || 'test-employer@example.com';

async function getLatestOtp(email) {
  // Query Supabase directly for the latest OTP for the test email
  const res = await axios.post(`${SUPABASE_URL}/rest/v1/rpc`, {
    q: `select otp from job_post_otps where email = '${email}' order by created_at desc limit 1;`
  }, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data[0]?.otp;
}

async function testOtpJobPosting() {
  console.log('Testing OTP job posting flow via CopilotKit runtime...');

  // Step 1: Simulate chat to collect job info and email
  const job = {
    title: 'Test Software Engineering Intern',
    company: 'Test Company',
    location: 'Houston, TX',
    description: 'Work on cool projects.',
    requirements: ['Interest in software', 'Team player'],
    type: 'Internship',
    level: 'Entry Level',
    application_url: 'https://testcompany.com/apply',
    education_level: 'College',
    time_commitment: 'Full-Time',
  };
  const email = TEST_EMAIL;

  // Step 2: Trigger OTP send
  const sendOtpRes = await axios.post(`${BASE_URL}/.netlify/functions/copilotkit-runtime`, {
    tools: [{
      name: 'sendJobOtpAndPostJob',
      parameters: { job, email }
    }],
    messages: [
      { role: 'user', content: 'I want to post a job.' },
      { role: 'assistant', content: 'Please provide your job details and email.' },
      { role: 'user', content: JSON.stringify({ ...job, email }) },
    ],
    properties: {},
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('OTP send response:', sendOtpRes.data);

  // Step 3: Simulate receiving OTP
  console.log('Waiting for OTP to be generated...');
  await new Promise(r => setTimeout(r, 2000));
  const otp = await getLatestOtp(email);
  if (!otp) {
    console.error('Failed to retrieve OTP from Supabase.');
    return;
  }
  console.log('Retrieved OTP:', otp);

  // Step 4: Submit OTP and job data
  const postJobRes = await axios.post(`${BASE_URL}/.netlify/functions/copilotkit-runtime`, {
    tools: [{
      name: 'sendJobOtpAndPostJob',
      parameters: { job, email, otp }
    }],
    messages: [
      { role: 'user', content: 'Here is my OTP.' },
      { role: 'assistant', content: 'Please enter your OTP to complete posting.' },
      { role: 'user', content: otp },
    ],
    properties: {},
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('Job post response:', postJobRes.data);
}

testOtpJobPosting().catch(console.error); 