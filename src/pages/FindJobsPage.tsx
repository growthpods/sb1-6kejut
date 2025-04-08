import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase';
import type { Job } from '../types';

export function FindJobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Holds all fetched jobs
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  // Added filters state
  const [filters, setFilters] = useState<{ type: string; level: string; datePosted: string }>({ type: '', level: '', datePosted: '' });

  // Fetch jobs from JSON file
  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_at', { ascending: false });

        if (error) throw error;
        
        const jobsWithDates = data.map(job => ({
          ...job,
          postedAt: new Date(job.posted_at)
        }));
        setAllJobs(jobsWithDates);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Memoized filtering logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const queryLower = searchQuery.toLowerCase();
      const locationLower = location.toLowerCase();

      // Search query filter (title or description)
      const matchesSearch = !queryLower ||
        job.title.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower);

      // Location filter
      const matchesLocation = !locationLower ||
        job.location.toLowerCase().includes(locationLower);

      // Type filter
      const matchesType = !filters.type || job.type === filters.type;

      // Level filter
      const matchesLevel = !filters.level || job.level === filters.level;

      // Date Posted filter (Example: last 7 days) - Requires more robust date logic
      const matchesDate = !filters.datePosted || (() => {
        if (!filters.datePosted) return true;
        const now = new Date();
        const jobDate = job.postedAt; // Already a Date object
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filters.datePosted === 'Past 24 hours') return diffDays <= 1;
        if (filters.datePosted === 'Past week') return diffDays <= 7;
        if (filters.datePosted === 'Past month') return diffDays <= 30;
        return true; // Default case if filter value is unexpected
      })();


      return matchesSearch && matchesLocation && matchesType && matchesLevel && matchesDate;
    });
  }, [allJobs, searchQuery, location, filters]);


  const handleSearch = (query: string, loc: string) => {
    setSearchQuery(query);
    setLocation(loc);
    setSearchQuery(query);
    setLocation(loc);
  };

  const handleFilterChange = (newFilters: { type: string; level: string; datePosted: string }) => {
    setFilters(newFilters); // Update filters state
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
                {/* Updated job count */}
                <span className="text-gray-500 text-lg ml-2">
                  ({filteredJobs.length})
                </span>
              </h2>
              {/* TODO: Implement sorting logic if needed */}
              <select className="px-4 py-2 border rounded-lg">
                <option>Most recent</option>
                <option>Most relevant</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map over filtered jobs */}
              {filteredJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <JobCard job={job} />
                </Link>
              ))}
            </div>

            {/* Check filtered jobs length */}
            {filteredJobs.length === 0 && !loading && (
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
