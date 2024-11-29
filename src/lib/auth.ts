import { supabase } from './supabase';

export async function sendMagicLink(email: string, redirectTo: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: { isEmployer: true }
      }
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Magic link error:', error);
    return { success: false, error };
  }
}

export async function validateWorkEmail(email: string) {
  // Common free email providers
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 
    'outlook.com', 'aol.com', 'icloud.com'
  ];
  
  const domain = email.split('@')[1];
  
  if (!domain) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  if (freeEmailDomains.includes(domain.toLowerCase())) {
    return { valid: false, message: 'Please use your work email address' };
  }
  
  return { valid: true };
}