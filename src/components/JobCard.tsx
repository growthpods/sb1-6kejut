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
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3 sm:space-x-4">
          <img
            src={job.companyLogo || `https://ui-avatars.com/api/?name=${job.company}`}
            alt={job.company}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded flex-shrink-0"
          />
          <div>
            <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{job.title}</h3>
            <p className="text-gray-600 text-sm sm:text-base">{job.company}</p>
            <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-none">{job.location}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Education Level Badge - Prominently displayed at the top */}
      {'educationLevel' in job && job.educationLevel && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            job.educationLevel === 'High School' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-purple-100 text-purple-800 border border-purple-300'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
            {job.educationLevel} Internship
          </span>
        </div>
      )}
      
      <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
        {job.type && (
          <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm">
            {job.type}
          </span>
        )}
        {job.level && (
          <span className="px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm">
            {job.level}
          </span>
        )}
        {/* Handle case where timeCommitment might not exist in the database yet */}
        {'timeCommitment' in job && job.timeCommitment && (
          <span className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm flex items-center">
            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
            {job.timeCommitment}
          </span>
        )}
      </div>
      
      {job.description && (
        <div className="mt-3 sm:mt-4">
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{job.description}</p>
        </div>
      )}

      <div className="mt-3 sm:mt-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </span>
        
        {showApplyButton && (('applicationUrl' in job && job.applicationUrl) || job.externalLink) && (
          <button 
            onClick={handleApplyClick}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            Apply Now
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}
