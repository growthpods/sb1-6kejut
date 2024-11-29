import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { JobCard } from '../components/JobCard';
import type { Job } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const [applicationsResponse, jobsResponse] = await Promise.all([
        supabase
          .from('applications')
          .select(`
            *,
            job:jobs(*)
          `)
          .eq('user_id', user.id),
        supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user.id)
      ]);

      if (!applicationsResponse.error) {
        setApplications(applicationsResponse.data);
      }

      if (!jobsResponse.error) {
        setPostedJobs(jobsResponse.data);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {applications.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Your Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white p-6 rounded-lg shadow-sm">
                <JobCard job={application.job} />
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Status: <span className="capitalize">{application.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {postedJobs.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Posted Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}