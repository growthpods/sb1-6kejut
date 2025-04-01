import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { SAMPLE_JOBS } from '../data/sampleJobs';
import type { Job } from '../types';

export function FindJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSearch = (query: string, loc: string) => {
    setSearchQuery(query);
    setLocation(loc);
  };

  const handleFilterChange = (filters: { type: string; level: string; datePosted: string }) => {
    // Implement filter logic here
    console.log(filters);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Perfect Internship</h1>
          <p className="text-xl text-gray-300 mb-12">
            Browse through thousands of internship opportunities
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="lg:flex gap-8">
          <div className="mb-6 lg:mb-0 lg:w-64 lg:flex-shrink-0">
            <JobFilters onFilterChange={handleFilterChange} />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">
                Available Positions
                <span className="text-gray-500 text-lg ml-2">
                  (1k+)
                </span>
              </h2>
              <select className="px-4 py-2 border rounded-lg">
                <option>Most recent</option>
                <option>Most relevant</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <JobCard job={job} />
                </Link>
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}