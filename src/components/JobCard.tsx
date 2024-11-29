import { Heart } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
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
      </div>

      <div className="mt-4 text-sm text-gray-500 text-right">
        <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}