import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase';
import { getGoogleJobsService } from '../lib/googleJobs';
import type { Job } from '../types';

export function FindJobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Holds all fetched jobs
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [useGoogleJobs, setUseGoogleJobs] = useState(false); // Toggle between Supabase and Google Jobs
  const [googleJobsNextPageToken, setGoogleJobsNextPageToken] = useState<string | undefined>(undefined);
  const [hasMoreGoogleJobs, setHasMoreGoogleJobs] = useState(false);
  
  // Filters state including timeCommitment
  const [filters, setFilters] = useState<{ 
    type: string; 
    level: string; 
    timeCommitment?: string;
    datePosted: string 
  }>({ 
    type: '', 
    level: '', 
    timeCommitment: undefined,
    datePosted: '' 
  });

  // Fetch jobs from Supabase or Google Jobs API
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        if (useGoogleJobs) {
          await fetchGoogleJobs();
        } else {
          await fetchSupabaseJobs();
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [useGoogleJobs]);

  // Fetch jobs from Supabase
  async function fetchSupabaseJobs() {
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
      console.error("Failed to fetch jobs from Supabase:", error);
    }
  }

  // Fetch jobs from Google Jobs API
  async function fetchGoogleJobs(pageToken?: string) {
    try {
      const googleJobsService = getGoogleJobsService();
      
      // Create query parameters
      const queryParams: any = {
        pageSize: 20,
        pageToken: pageToken || undefined
      };
      
      // Add filters if they exist
      if (location) queryParams.location = location;
      if (filters.type) queryParams.jobType = filters.type;
      if (filters.level) queryParams.experienceLevel = filters.level;
      if (filters.timeCommitment) queryParams.timeCommitment = filters.timeCommitment;
      
      // Fetch jobs
      let result;
      if (searchQuery) {
        result = await googleJobsService.searchJobs(searchQuery, queryParams);
      } else {
        result = await googleJobsService.listJobs(queryParams);
      }
      
      // Update state
      if (pageToken) {
        setAllJobs(prevJobs => [...prevJobs, ...result.jobs]);
      } else {
        setAllJobs(result.jobs);
      }
      
      // Update pagination state
      setGoogleJobsNextPageToken(result.nextPageToken);
      setHasMoreGoogleJobs(!!result.nextPageToken);
    } catch (error) {
      console.error("Failed to fetch jobs from Google Jobs API:", error);
    }
  }

  // Load more Google Jobs
  const loadMoreGoogleJobs = async () => {
    if (googleJobsNextPageToken) {
      await fetchGoogleJobs(googleJobsNextPageToken);
    }
  };

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
      
      // Time Commitment filter - Handle case where timeCommitment might not exist in the database yet
      const matchesTimeCommitment = !filters.timeCommitment || 
        ('timeCommitment' in job && job.timeCommitment === filters.timeCommitment);

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

      return matchesSearch && matchesLocation && matchesType && 
             matchesLevel && matchesTimeCommitment && matchesDate;
    });
  }, [allJobs, searchQuery, location, filters]);


  const handleSearch = (query: string, loc: string) => {
    setSearchQuery(query);
    setLocation(loc);
    
    // If using Google Jobs API, refetch with new search parameters
    if (useGoogleJobs) {
      fetchGoogleJobs();
    }
  };

  const handleFilterChange = (newFilters: { 
    type: string; 
    level: string; 
    timeCommitment?: string;
    datePosted: string 
  }) => {
    setFilters(newFilters); // Update filters state
    
    // If using Google Jobs API, refetch with new filters
    if (useGoogleJobs) {
      fetchGoogleJobs();
    }
  };

  // Toggle between Supabase and Google Jobs API
  const toggleJobSource = () => {
    setUseGoogleJobs(!useGoogleJobs);
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
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Perfect Job</h1>
          <p className="text-xl text-gray-300 mb-12">
            Browse through flexible jobs for evenings, weekends, or summer breaks
          </p>
          <SearchBar onSearch={handleSearch} />
          
          {/* Toggle between Supabase and Google Jobs */}
          <div className="mt-6 flex justify-center items-center">
            <span className={`mr-2 ${!useGoogleJobs ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}>
              Local Database
            </span>
            <button 
              onClick={toggleJobSource}
              className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
            >
              <span
                className={`${
                  useGoogleJobs ? 'bg-blue-600' : 'bg-gray-600'
                } inline-block h-6 w-11 rounded-full transition-colors`}
              />
              <span
                className={`${
                  useGoogleJobs ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
            <span className={`ml-2 ${useGoogleJobs ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}>
              Google Jobs
            </span>
          </div>
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
                  ({filteredJobs.length})
                </span>
              </h2>
              <select className="px-4 py-2 border rounded-lg">
                <option>Most recent</option>
                <option>Most relevant</option>
              </select>
            </div>

            {filteredJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`}>
                      <JobCard job={job} />
                    </Link>
                  ))}
                </div>
                
                {/* Load more button for Google Jobs */}
                {useGoogleJobs && hasMoreGoogleJobs && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMoreGoogleJobs}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Load More Jobs
                    </button>
                  </div>
                )}
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
