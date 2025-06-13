import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  try {
    const { email } = JSON.parse(event.body);
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store OTP in Supabase
    await supabase.from('job_post_otps').insert({ email, otp });
    // Send OTP via email (using nodemailer, or replace with your email provider)
    // For demo: log OTP to console
    console.log(`OTP for ${email}: ${otp}`);
    // If you want to actually send email, configure nodemailer transport here
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //   from: 'no-reply@internjobs.ai',
    //   to: email,
    //   subject: 'Your InternJobs.ai Job Posting Verification Code',
    //   text: `Your verification code is: ${otp}`
    // });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send OTP' })
    };
  }
} 