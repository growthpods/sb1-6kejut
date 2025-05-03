import { supabase } from './supabase';

const BACKOFF_DELAY = 1000; // Start with 1 second
const MAX_RETRIES = 3;

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error?.status === 429) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, BACKOFF_DELAY * Math.pow(2, attempt))
        );
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function signInDemoEmployer(): Promise<any> {
  return withRetry(async () => {
    // Check if OTP is required
    const { data: otpData, error: otpError } = await supabase
      .from('employer_otps')
      .select('otp')
      .eq('email', 'rraj@growthpods.io')
      .single();

    if (otpError) {
      console.error('Error fetching OTP:', otpError);
      throw otpError;
    }

    if (otpData) {
      // OTP is required, prompt user to enter OTP
      // TODO: Add UI code to prompt user for OTP
      // and store the entered OTP in the enteredOTP variable
      let enteredOTP: string | null = null; // Replace null with the actual entered OTP

      if (!enteredOTP || enteredOTP !== otpData.otp) {
        throw new Error('Invalid OTP');
      }

      // OTP is valid, proceed with sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'rraj@growthpods.io',
        password: 'employer123'
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Create the demo employer account if it doesn't exist
          await createDemoEmployer();
          return signInDemoEmployer();
        }
        throw error;
      }

      return { data, error };
    } else {
      // OTP is not required, proceed with sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'rraj@growthpods.io',
        password: 'employer123'
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // Create the demo employer account if it doesn't exist
          await createDemoEmployer();
          return signInDemoEmployer();
        }
        throw error;
      }

      return { data, error };
    }
  });
}

export async function createDemoEmployer(): Promise<any> {
  return withRetry(async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'rraj@growthpods.io',
      password: 'employer123',
      options: {
        data: {
          isEmployer: true,
          company: 'GrowthPods'
        }
      }
    });

    if (error && !error.message.includes('User already registered')) {
      throw error;
    }

    // Generate and send OTP
    if (data?.user?.email) {
      await supabase.functions.invoke('generate_otp', {
        body: {
          email: data.user.email
        }
      });
    }

    return { data, error };
  });
}

export async function validateWorkEmail(email: string) {
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 
    'outlook.com', 'aol.com', 'icloud.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  if (personalDomains.includes(domain)) {
    return { valid: false, message: 'Please use your work email address' };
  }
  
  return { valid: true };
}
