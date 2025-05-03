import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Check, Clock, ExternalLink } from 'lucide-react';
import type { Job } from '../types';
import { supabase } from '../lib/supabase';

export function JobDetailsPage() {
  const { id } = useParams();
  // const navigate = useNavigate(); // Removed unused navigate
  const [job, setJob] = useState<Job | null>(null); // Keep Job type, but data structure might differ slightly from DB
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    async function fetchJobDetails() {
      if (!id) {
        setError("Job ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data, error: dbError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single(); // Fetch a single record

        if (dbError) throw dbError;

        if (data) {
           // Ensure postedAt is a Date object
           const jobData = {
             ...data,
             postedAt: new Date(data.posted_at || data.postedAt) // Handle potential naming difference
           };
           // Map database fields to Job type if necessary (assuming direct mapping for now)
           setJob(jobData as Job);
        } else {
          setJob(null); // Job not found
        }
      } catch (err: any) {
        console.error("Failed to fetch job details:", err);
        setError(err.message || "Failed to load job details.");
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJobDetails();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12 text-red-600">Error: {error}</div>;
  }

  if (!job) {
    return <div className="container mx-auto px-4 py-12">Job not found or invalid ID.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <img
                src={job.companyLogo || `https://ui-avatars.com/api/?name=${job.company}`}
                alt={`${job.company} logo`}
                className="w-16 h-16 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <p className="text-xl text-gray-600 mt-1">{job.company}</p>
                
                {/* Time Commitment Badge - Handle case where timeCommitment might not exist in the database yet */}
                {'timeCommitment' in job && job.timeCommitment && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.timeCommitment} Availability
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Use application URL if available, fall back to external link - Handle case where applicationUrl might not exist in the database yet */}
            {'applicationUrl' in job && job.applicationUrl ? (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Apply Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            ) : job.externalLink ? (
              <a
                href={job.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                View Job
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            ) : (
              <span className="px-6 py-3 rounded-lg bg-gray-400 text-white cursor-not-allowed">
                Apply Link Unavailable
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span>{job.type || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{job.location || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Posted: {job.postedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-gray-400" />
              <span>{job.level || 'N/A'}</span>
            </div>
            {/* Handle case where timeCommitment might not exist in the database yet */}
            {'timeCommitment' in job && job.timeCommitment && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700">{job.timeCommitment} Availability</span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description || 'No description provided.'}</p> {/* Add fallback */}
          </div>

          {/* Ensure requirements is an array before mapping */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="text-gray-600">{req}</li>
                ))}
              </ul>
            </div>
          )}
          {(!Array.isArray(job.requirements) || job.requirements.length === 0) && (
             <div className="mt-8">
               <h2 className="text-xl font-semibold mb-4">Requirements</h2>
               <p className="text-gray-600">No specific requirements listed.</p>
             </div>
          )}
          {/* Removed extra </ul> tag below */}
        </div>
      </div>
    </div>
  );
}
