import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  try {
    const { email, otp } = JSON.parse(event.body);
    if (!email || !otp) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and OTP are required' }) };
    }
    // Find OTP in Supabase
    const { data, error } = await supabase
      .from('job_post_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid code' }) };
    }
    // Check if OTP is expired (10 min)
    const createdAt = new Date(data[0].created_at);
    const now = new Date();
    if ((now - createdAt) / 1000 > 600) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Code expired' }) };
    }
    // Delete OTP after successful verification
    await supabase.from('job_post_otps').delete().eq('id', data[0].id);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to verify OTP' }) };
  }
} 