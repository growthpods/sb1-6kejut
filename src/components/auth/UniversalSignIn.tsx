import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signInDemoEmployer } from '../../lib/auth';
import { toast } from 'sonner';

export function UniversalSignIn() {
  const [isEmployer, setIsEmployer] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmployerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-login for demo employer
      if (email === 'rraj@growthpods.io') {
        const { error } = await signInDemoEmployer();
        if (error) throw error;
        
        toast.success('Signed in successfully!');
        navigate('/dashboard');
        return;
      }

      // Regular magic link flow for other emails
      const domain = email.split('@')[1];
      const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      if (commonDomains.includes(domain)) {
        toast.error('Please use your work email address');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { isEmployer: true }
        }
      });

      if (error) throw error;
      
      toast.success('Check your email for the magic link!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {isEmployer ? (
            <Building2 className="w-12 h-12 text-blue-600" />
          ) : (
            <GraduationCap className="w-12 h-12 text-blue-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold">Welcome to InternJobs.ai</h1>
        <p className="text-gray-600 mt-2">
          {isEmployer 
            ? 'Sign in to find top intern talent' 
            : 'Sign in to explore internship opportunities'}
        </p>
      </div>

      <div className="flex rounded-lg overflow-hidden mb-6">
        <button
          onClick={() => setIsEmployer(true)}
          className={`flex-1 py-2 text-center ${
            isEmployer
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Employer
        </button>
        <button
          onClick={() => setIsEmployer(false)}
          className={`flex-1 py-2 text-center ${
            !isEmployer
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Student
        </button>
      </div>

      {isEmployer ? (
        <form onSubmit={handleEmployerSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="company@example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Please use your company email address
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setIsEmployer(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            Sign in with Email
          </button>
          <p className="text-sm text-center text-gray-500">
            We'll send you a magic link to sign in
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          By signing in, you agree to our{' '}
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