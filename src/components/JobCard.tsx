import { Heart, MapPin, Clock, ExternalLink, Globe } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
}

export function JobCard({ job, showApplyButton = true }: JobCardProps) {
  // Function to handle external application
  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle case where applicationUrl might not exist in the database yet
    // First check if the field exists in the job object
    if ('applicationUrl' in job && job.applicationUrl) {
      window.open(job.applicationUrl, '_blank');
    } else if (job.externalLink) {
      window.open(job.externalLink, '_blank');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex space-x-4">
          <img
            src={job.companyLogo || `https://ui-avatars.com/api/?name=${job.company}`}
            alt={job.company}
            className="w-12 h-12 rounded"
          />
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-500">
          <Heart className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.type && (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            {job.type}
          </span>
        )}
        {job.level && (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
            {job.level}
          </span>
        )}
        {/* Handle case where timeCommitment might not exist in the database yet */}
        {'timeCommitment' in job && job.timeCommitment && (
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {job.timeCommitment}
          </span>
        )}
        {/* All source badges removed as per user request */}
      </div>
      
      {job.description && (
        <div className="mt-4">
          <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </span>
        
        {showApplyButton && (('applicationUrl' in job && job.applicationUrl) || job.externalLink) && (
          <button 
            onClick={handleApplyClick}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Apply Now
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}
