import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Check, Clock, ExternalLink } from 'lucide-react'; // Removed Globe
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
           // Map Supabase snake_case fields to our camelCase Job type
           const jobData: Job = {
             id: data.id,
             title: data.title,
             company: data.company,
             location: data.location,
             description: data.description,
             requirements: data.requirements || [],
             type: data.type, // Assuming 'type' is already correct case in DB or matches Job type
             level: data.level, // Assuming 'level' is already correct case in DB or matches Job type
             educationLevel: data.education_level,
             timeCommitment: data.time_commitment,
             applicants: data.applicants,
             postedAt: new Date(data.posted_at),
             // Map both snake_case and camelCase for links
             applicationUrl: data.application_url || data.external_link || '',
             externalLink: data.external_link || data.application_url || '',
             companyLogo: data.company_logo,
             source: data.source,
             // careerSiteUrl needs to be added to Job type. For now, handle if present.
             ...(data.career_site_url && { careerSiteUrl: data.career_site_url }),
           };
           setJob(jobData);
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
    <div className={`${
      job.educationLevel === 'High School' 
        ? 'bg-green-50' 
        : job.educationLevel === 'College'
          ? 'bg-purple-50'
          : 'bg-gray-50'
    } py-12`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className={`${
            job.educationLevel === 'High School' 
              ? 'bg-white border-l-4 border-green-500' 
              : job.educationLevel === 'College'
                ? 'bg-white border-l-4 border-purple-500'
                : 'bg-white'
          } rounded-lg shadow-md p-8`}>
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

                  {/* Education Level Badge - Prominently displayed */}
                  {job.educationLevel && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        job.educationLevel === 'High School' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                        </svg>
                        {job.educationLevel} Internship
                      </span>
                    </div>
                  )}

                  {/* Time Commitment Badge */}
                  {job.timeCommitment && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.timeCommitment} Availability
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons for Apply and Career Site */}
              <div className="flex flex-col items-end gap-4">
                {/* Apply Button - Use applicationUrl or externalLink */}
                {(job.applicationUrl || job.externalLink) && (
                  <a
                    href={job.applicationUrl || job.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}

                {/* Career Site Button */}
                {/* @ts-ignore TODO: Add careerSiteUrl to Job type */}
                {job.careerSiteUrl && (
                  <a
                    // @ts-ignore
                    href={job.careerSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  >
                    Company Career Site
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}

                {/* Display if no apply link is available */}
                {!(job.applicationUrl || job.externalLink) && !(job as any).careerSiteUrl && (
                  <span className="px-6 py-3 rounded-lg bg-gray-400 text-white cursor-not-allowed">
                    Links Unavailable
                  </span>
                )}
              </div>
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
                <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-gray-400" />
                <span>{job.level || 'N/A'}</span>
              </div>
              {/* Source display removed as per user request */}
              {/* Handle case where timeCommitment might not exist in the database yet */}
              {job.timeCommitment && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-700">{job.timeCommitment} Availability</span>
                </div>
              )}
              
              {/* Education Level is now displayed prominently at the top, so we can remove this section */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
