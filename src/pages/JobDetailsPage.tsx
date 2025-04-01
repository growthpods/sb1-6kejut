import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Job } from '../types';
import { SAMPLE_JOBS } from '../data/sampleJobs';

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchJob() {
      const foundJob = SAMPLE_JOBS.find(job => job.id === id);
      setJob(foundJob || null);
      setLoading(false);
    }

    fetchJob();
  }, [id]);

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
            <a
              href={`mailto:apply@${job.company.toLowerCase().replace(/\s+/g, '')}.com`}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </a>
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
    </div>
  );
}