import React, { useState, useEffect, useRef, useMemo } from 'react'; // Added React, useMemo
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase'; // Import supabase
import type { Job } from '../types';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Renamed from jobs to allJobs
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Added state for search query
  const [location, setLocation] = useState(''); // Added state for location
  const [filters, setFilters] = useState<{ type: string; level: string; datePosted: string }>({ type: 'All', level: 'All', datePosted: 'Any time' }); // Added state for filters
  const jobsRef = useRef<HTMLDivElement>(null);

  // Fetch recent jobs from Supabase for the homepage
  useEffect(() => {
    async function fetchRecentJobs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_at', { ascending: false })
          .limit(20); // Fetch only the 20 most recent jobs for the homepage

        if (error) throw error;

        const jobsWithDates = data.map(job => ({
          ...job,
          postedAt: new Date(job.posted_at || job.postedAt) // Ensure Date object
        }));
        setAllJobs(jobsWithDates as Job[]); // Cast to Job[]
      } catch (error) {
        console.error("Failed to fetch recent jobs:", error);
        setAllJobs([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    }
    fetchRecentJobs();
  }, []);

  // Memoized filtering logic (similar to FindJobsPage)
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const queryLower = searchQuery.toLowerCase();
      const locationLower = location.toLowerCase();

      // Search query filter (title, company, or description)
      const matchesSearch = !queryLower ||
        job.title.toLowerCase().includes(queryLower) ||
        job.company.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower);

      // Location filter
      const matchesLocation = !locationLower || location === 'United States' || // Handle default "United States"
        job.location.toLowerCase().includes(locationLower);

      // Type filter
      const matchesType = filters.type === 'All' || job.type === filters.type;

      // Level filter
      const matchesLevel = filters.level === 'All' || job.level === filters.level;

      // Date Posted filter
      const matchesDate = filters.datePosted === 'Any time' || (() => {
        if (filters.datePosted === 'Any time') return true;
        const now = new Date();
        const jobDate = job.postedAt; // Already a Date object
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filters.datePosted === 'Past 24 hours') return diffDays <= 1;
        if (filters.datePosted === 'Past week') return diffDays <= 7;
        if (filters.datePosted === 'Past month') return diffDays <= 30;
        return true;
      })();

      return matchesSearch && matchesLocation && matchesType && matchesLevel && matchesDate;
    });
  }, [allJobs, searchQuery, location, filters]);

  // Update search state
  const handleSearch = (query: string, loc: string) => {
    setSearchQuery(query);
    setLocation(loc);
  };

  // Update filter state
  const handleFilterChange = (newFilters: { type: string; level: string; datePosted: string }) => {
    setFilters(newFilters);
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

  // Determine featured jobs (e.g., first 4 from the filtered list or allJobs if no filters active)
  const featuredJobs = filteredJobs.length > 0 ? filteredJobs.slice(0, 4) : allJobs.slice(0, 4);

  return (
    <div className="relative">
      {/* Header */}
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

      {/* Main Content with Filters and Jobs */}
      <div className="container mx-auto px-4 py-12">
        <div className="lg:flex gap-8">
          {/* Filters Sidebar */}
          <div className="mb-6 lg:mb-0 lg:w-64 lg:flex-shrink-0">
            <JobFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Job Listings Area */}
          <div className="flex-1" ref={jobsRef}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">
                {/* Adjust title based on filtering */}
                {searchQuery || location !== 'United States' || filters.type !== 'All' || filters.level !== 'All' || filters.datePosted !== 'Any time'
                  ? 'Search Results'
                  : 'Available Internships'}
                <span className="text-gray-500 text-lg ml-2">
                  ({filteredJobs.length}) {/* Show count of filtered jobs */}
                </span>
              </h2>
              {/* Sorting Dropdown (functionality not implemented) */}
              <select className="px-4 py-2 border rounded-lg">
                <option>Most recent</option>
                <option>Most relevant</option>
                {/* <option>Most applicants</option> */}
              </select>
            </div>

            {/* Display Featured/Filtered Jobs */}
            {filteredJobs.length > 0 ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Display first few featured jobs if no filters/search active */}
                 {/* Or display all filtered jobs */}
                 {(searchQuery || location !== 'United States' || filters.type !== 'All' || filters.level !== 'All' || filters.datePosted !== 'Any time' ? filteredJobs : featuredJobs).map((job) => (
                   <Link key={job.id} to={`/jobs/${job.id}`}>
                     <JobCard job={job} />
                   </Link>
                 ))}
               </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No jobs found matching your criteria</p>
              </div>
            )}

             {/* View All Button - Link to the main jobs page */}
             <div className="text-center mt-12">
               <Link
                 to="/jobs"
                 className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
               >
                 View All Internships
               </Link>
             </div>

          </div>
        </div>
      </div>

       {/* Why Choose Us Section (Optional - kept from original) */}
       <div className="bg-gray-100 py-16">
         <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl font-semibold mb-6">Why Choose Us?</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div>
               <h3 className="text-xl font-semibold mb-2">Vast Opportunities</h3>
               <p className="text-gray-600">Access scraped internships focused on your needs.</p>
             </div>
             <div>
               <h3 className="text-xl font-semibold mb-2">Easy Filtering</h3>
               <p className="text-gray-600">Quickly find relevant internships with functional filters.</p>
             </div>
             <div>
               <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
               <p className="text-gray-600">Gain valuable experience and kickstart your professional journey.</p>
             </div>
           </div>
         </div>
       </div>

    </div>
  );
}
