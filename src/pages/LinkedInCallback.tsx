import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function LinkedInCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error || error_description) {
      console.error('LinkedIn OAuth error:', error_description);
      toast.error('LinkedIn authentication failed');
      navigate('/login');
      return;
    }

    if (code) {
      handleLinkedInCode(code);
    } else {
      toast.error('LinkedIn authentication failed');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleLinkedInCode = async (code: string) => {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      toast.success('Successfully signed in with LinkedIn');
      navigate('/dashboard');
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      toast.error('Failed to complete LinkedIn authentication');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing LinkedIn sign in...</p>
      </div>
    </div>
  );
}