import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLinkedIn } from 'react-linkedin-login-oauth2';
import { toast } from 'sonner';

export function LinkedInCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { linkedInLogin } = useLinkedIn();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleLinkedInCode(code);
    } else {
      toast.error('LinkedIn authentication failed');
      navigate('/');
    }
  }, [searchParams]);

  const handleLinkedInCode = async (code: string) => {
    try {
      await linkedInLogin(code);
      navigate('/dashboard');
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      toast.error('Failed to complete LinkedIn authentication');
      navigate('/');
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