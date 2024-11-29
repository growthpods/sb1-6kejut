import { Linkedin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function StudentSignIn({ onClose }: { onClose?: () => void }) {
  const handleLinkedInSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/linkedin`,
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
          <Linkedin className="w-5 h-5" />
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