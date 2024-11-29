import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MoreHorizontal, Search, Plus, Settings } from 'lucide-react';
import type { Job, Candidate } from '../types';

type ApplicationStatus = 'applied' | 'screening' | 'disqualified' | 'qualified';

interface Application {
  id: string;
  candidate: Candidate;
  job: Job;
  status: ApplicationStatus;
  appliedAt: Date;
  rating?: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchEmployerData();
  }, [user]);

  const fetchEmployerData = async () => {
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        supabase.from('jobs').select('*').eq('employer_id', user?.id),
        supabase
          .from('applications')
          .select(`
            *,
            candidate:profiles(*),
            job:jobs(*)
          `)
          .eq('employer_id', user?.id)
      ]);

      if (!jobsResponse.error && jobsResponse.data) {
        setJobs(jobsResponse.data);
        if (!selectedJob && jobsResponse.data.length > 0) {
          setSelectedJob(jobsResponse.data[0].id);
        }
      }

      if (!applicationsResponse.error && applicationsResponse.data) {
        setApplications(applicationsResponse.data.map(app => ({
          ...app,
          appliedAt: new Date(app.applied_at)
        })));
      }
    } catch (error) {
      console.error('Error fetching employer data:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedJob && app.job.id !== selectedJob) return false;
    if (!searchQuery) return true;
    
    const searchText = `${app.candidate.name} ${app.candidate.title} ${app.candidate.location}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return filteredApplications.filter(app => app.status === status);
  };

  const renderApplicationColumn = (status: ApplicationStatus, title: string, count: number) => (
    <div className="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-gray-500">{count}</span>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded">
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        {getApplicationsByStatus(status).map(app => (
          <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <img
                  src={app.candidate.avatar_url || `https://ui-avatars.com/api/?name=${app.candidate.name}`}
                  alt={app.candidate.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-medium">{app.candidate.name}</h4>
                  <p className="text-sm text-gray-600">{app.candidate.title}</p>
                  <p className="text-sm text-gray-500">{app.candidate.location}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {app.rating && (
              <div className="mt-2 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < app.rating! ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 text-sm text-gray-500">
              Applied {app.appliedAt.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <select
                value={selectedJob || ''}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidates..."
                  className="bg-transparent border-none focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6 overflow-x-auto pb-6">
          {renderApplicationColumn('applied', 'Applied', getApplicationsByStatus('applied').length)}
          {renderApplicationColumn('screening', 'Screening', getApplicationsByStatus('screening').length)}
          {renderApplicationColumn('disqualified', 'Disqualified', getApplicationsByStatus('disqualified').length)}
          {renderApplicationColumn('qualified', 'Qualified', getApplicationsByStatus('qualified').length)}
        </div>
      </div>
    </div>
  );
}