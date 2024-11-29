import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { StudentSignIn } from '../components/auth/StudentSignIn';
import type { Job } from '../types';

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function fetchJobAndApplication() {
      try {
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;
        setJob(jobData);

        // Check if user has already applied
        if (user) {
          const { data: applicationData, error: applicationError } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', id)
            .eq('user_id', user.id)
            .single();

          if (!applicationError && applicationData) {
            setHasApplied(true);
          }
        }
      } catch (error) {
        toast.error('Failed to load job details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    fetchJobAndApplication();
  }, [id, navigate, user]);

  const handleApply = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (hasApplied) return;

    setApplying(true);
    try {
      const { error } = await supabase.from('applications').insert({
        job_id: id,
        user_id: user.id,
        status: 'pending'
      });

      if (error) throw error;
      
      setHasApplied(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (!job) {
    return <div className="container mx-auto px-4 py-12">Job not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <img
                src={job.companyLogo || `https://ui-avatars.com/api/?name=${job.company}`}
                alt={job.company}
                className="w-16 h-16 rounded-lg"
              />
              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <p className="text-xl text-gray-600 mt-1">{job.company}</p>
              </div>
            </div>
            <button
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                hasApplied
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              {hasApplied ? (
                <>
                  <Check className="w-5 h-5" />
                  Applied
                </>
              ) : applying ? (
                'Applying...'
              ) : (
                'Apply Now'
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{job.location}</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <ul className="list-disc list-inside space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="text-gray-600">{req}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <StudentSignIn onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}