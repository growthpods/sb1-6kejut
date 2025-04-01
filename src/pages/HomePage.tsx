import { useState, useEffect, useRef } from 'react';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase';
import { initializeDatabase } from '../lib/initDatabase';
import type { Job } from '../types';
import { Link } from 'react-router-dom';
import { SAMPLE_JOBS } from '../data/sampleJobs';

export function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const jobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        await initializeDatabase();
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          setJobs(SAMPLE_JOBS);
          setFilteredJobs(SAMPLE_JOBS);
        } else if (data) {
          const formattedJobs = data.map(job => ({
            ...job,
            postedAt: new Date(job.posted_at),
            requirements: job.requirements || []
          }));
          setJobs(formattedJobs);
          setFilteredJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error in fetchJobs:', error);
        setJobs(SAMPLE_JOBS);
        setFilteredJobs(SAMPLE_JOBS);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const handleSearch = (query: string, location: string) => {
    let filtered = jobs;
    
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(job => {
        const searchText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }
    
    if (location && location !== 'United States') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filters: { type: string; level: string; datePosted: string }) => {
    let filtered = jobs;
    
    if (filters.type !== 'All') {
      filtered = filtered.filter(job => job.type === filters.type);
    }
    
    if (filters.level !== 'All') {
      filtered = filtered.filter(job => job.level === filters.level);
    }
    
    if (filters.datePosted !== 'Any time') {
      const now = new Date();
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.postedAt);
        const diffInDays = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (filters.datePosted) {
          case 'Past 24 hours':
            return diffInDays <= 1;
          case 'Past week':
            return diffInDays <= 7;
          case 'Past month':
            return diffInDays <= 30;
          default:
            return true;
        }
      });
    }
    
    setFilteredJobs(filtered);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Dream Internship Here</h1>
          <p className="text-xl text-gray-300 mb-12">
            Connect with amazing companies offering valuable internship opportunities
          </p>
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} defaultLocation="United States" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="lg:flex gap-8">
          <div className="mb-6 lg:mb-0 lg:w-64 lg:flex-shrink-0">
            <JobFilters onFilterChange={handleFilterChange} />
          </div>

          <div className="flex-1" ref={jobsRef}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">
                {filteredJobs.length === jobs.length ? 'Recommended jobs' : 'Search Results'}
                <span className="text-gray-500 text-lg ml-2">
                  (1k+)
                </span>
              </h2>
              <select className="px-4 py-2 border rounded-lg">
                <option>Most recent</option>
                <option>Most relevant</option>
                <option>Most applicants</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <JobCard job={job} />
                </Link>
              ))}
            </div>

            {filteredJobs.length === 0 && (
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