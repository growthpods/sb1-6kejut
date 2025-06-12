import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase';
import type { Job } from '../types';
import { useEducationLevel } from '../contexts/EducationLevelContext';
import { useJobFilters } from '../contexts/JobFilterContext';

export function FindJobsPage() {
  const { educationLevel, clearEducationLevel } = useEducationLevel();
  const { filters, setFilters, updateFilter } = useJobFilters();
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Holds all fetched jobs
  const [loading, setLoading] = useState(true);
  const [supabaseJobs, setSupabaseJobs] = useState<Job[]>([]); // Holds jobs from Supabase
  
  // Update filters when educationLevel changes
  useEffect(() => {
    setFilters({ ...filters, educationLevel: educationLevel || 'All' });
    // eslint-disable-next-line
  }, [educationLevel]);

  useEffect(() => {
    async function fetchAllJobs() {
      setLoading(true);
      try {
        await fetchSupabaseJobs();
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllJobs();
  }, [filters.educationLevel]);

  async function fetchSupabaseJobs() {
    try {
      let query = supabase
        .from('jobs')
        .select('*');

      // Apply search query filter if provided
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.type && filters.type !== 'All') {
        query = query.eq('type', filters.type);
      }
      if (filters.level && filters.level !== 'All') {
        query = query.eq('level', filters.level);
      }
      if (filters.educationLevel && filters.educationLevel !== 'All') {
        query = query.eq('education_level', filters.educationLevel);
      }
      if (filters.timeCommitment && filters.timeCommitment !== 'All') {
        query = query.eq('time_commitment', filters.timeCommitment);
      }
      if (filters.datePosted && filters.datePosted !== 'Any time') {
        const now = new Date();
        let dateFilter = now;
        if (filters.datePosted === 'Past 24 hours') {
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (filters.datePosted === 'Past week') {
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (filters.datePosted === 'Past month') {
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        query = query.gte('posted_at', dateFilter.toISOString());
      }
      const { data, error } = await query.order('posted_at', { ascending: false });
      if (error) throw error;
      const jobsWithDates = data.map(job => ({
        ...job,
        postedAt: new Date(job.posted_at),
        timeCommitment: job.time_commitment,
        educationLevel: job.manual_education_level || job.education_level,
        source: job.source || 'supabase'
      }));
      setSupabaseJobs(jobsWithDates);
      setAllJobs(jobsWithDates);
      console.log(`Fetched ${jobsWithDates.length} jobs with applied filters`);
    } catch (error) {
      console.error("Failed to fetch jobs from Supabase:", error);
    }
  }

  // Memoized filtering logic
  const filteredJobs = useMemo(() => {
    console.log(`Filtering ${allJobs.length} jobs with filters:`, filters);
    return allJobs.filter(job => {
      const queryLower = filters.searchQuery.toLowerCase();
      const locationLower = filters.location.toLowerCase();
      const matchesSearch = !queryLower ||
        job.title.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower);
      const matchesLocation = !locationLower ||
        job.location.toLowerCase().includes(locationLower);
      const matchesType = filters.type === 'All' || job.type === filters.type;
      const matchesLevel = filters.level === 'All' || job.level === filters.level;
      const matchesEducationLevel = !filters.educationLevel || 
        filters.educationLevel === 'All' || 
        (job.educationLevel && job.educationLevel === filters.educationLevel);
      const matchesTimeCommitment = !filters.timeCommitment || 
        filters.timeCommitment === 'All' || 
        (job.timeCommitment && job.timeCommitment === filters.timeCommitment);
      const matchesDate = filters.datePosted === 'Any time' || (() => {
        const now = new Date();
        const jobDate = job.postedAt;
        if (!jobDate) return true;
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (filters.datePosted === 'Past 24 hours') return diffDays <= 1;
        if (filters.datePosted === 'Past week') return diffDays <= 7;
        if (filters.datePosted === 'Past month') return diffDays <= 30;
        return true;
      })();
      return matchesSearch && matchesLocation && matchesType && 
             matchesLevel && matchesEducationLevel && matchesTimeCommitment && matchesDate;
    });
  }, [allJobs, filters]);

  const handleSearch = (query: string, loc: string) => {
    setFilters({ ...filters, searchQuery: query, location: loc });
    fetchSupabaseJobs();
  };

  const handleFilterChange = (newFilters: { 
    type: string; 
    level: string; 
    educationLevel?: string;
    timeCommitment?: string;
    datePosted: string 
  }) => {
    setFilters({ ...filters, ...newFilters });
    fetchSupabaseJobs();
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
    <div className="min-h-screen bg-gray-50">
      <div className={`${
        educationLevel === 'High School' 
          ? 'bg-gradient-to-r from-green-900 to-green-700' 
          : educationLevel === 'College'
            ? 'bg-gradient-to-r from-purple-900 to-purple-700'
            : 'bg-black'
      } text-white py-12 md:py-20`}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {educationLevel 
              ? `Find Your Perfect ${educationLevel} Internship` 
              : 'Find Your Perfect Internship'}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12">
            {educationLevel === 'High School' 
              ? 'Browse through flexible high school internships for evenings, weekends, or summer breaks'
              : educationLevel === 'College'
                ? 'Browse through college internships to build your professional experience'
                : 'Browse through flexible jobs for evenings, weekends, or summer breaks'}
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="lg:flex gap-8">
          <div className="mb-6 lg:mb-0 lg:w-64 lg:flex-shrink-0">
            <JobFilters onFilterChange={handleFilterChange} />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-semibold">
                {educationLevel 
                  ? `${educationLevel} Internships` 
                  : 'Available Positions'}
                <span className="text-gray-500 text-base md:text-lg ml-2">
                  ({filteredJobs.length})
                </span>
                {educationLevel && (
                  <button 
                    onClick={() => clearEducationLevel()} 
                    className="ml-4 text-sm text-blue-500 hover:underline"
                  >
                    (Clear Filter)
                  </button>
                )}
              </h2>
              <select className="w-full sm:w-auto px-3 py-2 md:px-4 md:py-2 border rounded-lg bg-white">
                <option>Most recent</option>
                <option>Most relevant</option>
              </select>
            </div>

            {filteredJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {filteredJobs.map((job) => (
                    <Link key={job.id} to={`/find-jobs/${job.id}`} className="block h-full">
                      <JobCard job={job} />
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
                <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
