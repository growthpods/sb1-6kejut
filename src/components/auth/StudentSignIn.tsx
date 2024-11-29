import { Loader2, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function StudentSignIn({ onClose }: { onClose?: () => void }) {
  const handleLinkedInSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            response_type: 'code',
            client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
            scope: 'r_liteprofile r_emailaddress',
            state: crypto.randomUUID()
          },
          data: { isEmployer: false }
        }
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      window.location.href = data.url;
    } catch (error) {
      console.error('LinkedIn sign in error:', error);
      toast.error('Failed to sign in with LinkedIn');
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <GraduationCap className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Sign in to Apply</h1>
        <p className="text-gray-600 mt-2">
          Use your LinkedIn profile to quickly apply for internships
        </p>
      </div>

      <div className="space-y-6">
        <button
          onClick={handleLinkedInSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#0077b5] text-white hover:bg-[#006397] focus:outline-none focus:ring-2 focus:ring-[#0077b5] focus:ring-offset-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          Continue with LinkedIn
        </button>
        
        <p className="text-sm text-center text-gray-500">
          We'll use your LinkedIn profile to create your application
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}