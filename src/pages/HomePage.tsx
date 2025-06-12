import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase';
import type { Job } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Briefcase, MapPin, ArrowRight, Search, Building2, GraduationCap } from 'lucide-react';
import { useEducationLevel } from '../contexts/EducationLevelContext';

export function HomePage() {
  const { educationLevel } = useEducationLevel();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<{ 
    type: string; 
    level: string; 
    educationLevel?: string;
    timeCommitment?: string;
    datePosted: string 
  }>({ 
    type: 'All', 
    level: 'All', 
    educationLevel: educationLevel || undefined,
    timeCommitment: undefined,
    datePosted: 'Any time' 
  });
  const jobsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Update filters when educationLevel changes
  useEffect(() => {
    if (educationLevel) {
      setFilters(prevFilters => ({
        ...prevFilters,
        educationLevel
      }));
    }
  }, [educationLevel]);

  // Fetch recent jobs from Supabase for the homepage
  useEffect(() => {
    async function fetchRecentJobs() {
      try {
        setLoading(true);
        let query = supabase
          .from('jobs')
          .select('*')
          .order('posted_at', { ascending: false });
          
        // Apply education level filter if selected
        if (educationLevel) {
          query = query.eq('education_level', educationLevel);
        }
        
        // Limit to 6 jobs for homepage
        const { data, error } = await query.limit(6);

        if (error) throw error;

        const jobsWithDates = data.map(job => ({
          ...job,
          postedAt: new Date(job.posted_at || job.postedAt),
          timeCommitment: job.time_commitment, // Map from snake_case to camelCase
          educationLevel: job.education_level, // Map from snake_case to camelCase
        }));
        setAllJobs(jobsWithDates as Job[]);
      } catch (error) {
        console.error("Failed to fetch recent jobs:", error);
        setAllJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentJobs();
  }, []);

  // Memoized filtering logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const queryLower = searchQuery.toLowerCase();
      const locationLower = location.toLowerCase();

      // Search query filter
      const matchesSearch = !queryLower ||
        job.title.toLowerCase().includes(queryLower) ||
        job.company.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower);

      // Location filter
      const matchesLocation = !locationLower || location === 'United States' ||
        job.location.toLowerCase().includes(locationLower);

      // Type filter
      const matchesType = filters.type === 'All' || job.type === filters.type;

      // Level filter
      const matchesLevel = filters.level === 'All' || job.level === filters.level;

      // Time Commitment filter - Handle case where timeCommitment might not exist in the database yet
      const matchesTimeCommitment = !filters.timeCommitment ||
        (job.timeCommitment && job.timeCommitment === filters.timeCommitment);

      // Date Posted filter
      const matchesDate = filters.datePosted === 'Any time' || (() => {
        if (filters.datePosted === 'Any time') return true;
        const now = new Date();
        const jobDate = job.postedAt;
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filters.datePosted === 'Past 24 hours') return diffDays <= 1;
        if (filters.datePosted === 'Past week') return diffDays <= 7;
        if (filters.datePosted === 'Past month') return diffDays <= 30;
        return true;
      })();

      return matchesSearch && matchesLocation && matchesType &&
        matchesLevel && matchesTimeCommitment && matchesDate;
    });
  }, [allJobs, searchQuery, location, filters]);

  // Update search state: now redirects to /find-jobs with params
  const handleSearch = (query: string, loc: string) => {
    navigate(`/find-jobs?search=${encodeURIComponent(query)}&location=${encodeURIComponent(loc)}`);
  };

  // Update filter state
  const handleFilterChange = (newFilters: { 
    type: string; 
    level: string; 
    timeCommitment?: string;
    datePosted: string 
  }) => {
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

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className={`${
        educationLevel === 'High School' 
          ? 'bg-gradient-to-r from-green-900 to-green-700' 
          : educationLevel === 'College'
            ? 'bg-gradient-to-r from-purple-900 to-purple-700'
            : 'bg-gradient-to-r from-blue-900 to-indigo-800'
      } text-white py-20 md:py-28`}> {/* Increased padding */}
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"> {/* Responsive text size */}
            {educationLevel 
              ? `${educationLevel} Internships That Fit Your Schedule` 
              : 'Jobs That Fit Your Student Life'}
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            {educationLevel === 'High School' 
              ? 'Discover flexible high school internships for evenings, weekends, or summer breaks to gain valuable experience.'
              : educationLevel === 'College'
                ? 'Find college internships that build your resume and professional skills while working around your class schedule.'
                : 'Discover flexible part-time jobs, evening shifts, weekend gigs, and summer opportunities perfect for high school and college students.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-16"> {/* Increased bottom margin */}
            <Link
              to="/find-jobs"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-lg transition-colors duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-lg shadow-lg" // Enhanced primary CTA
            >
              <Search className="w-5 h-5 mr-2" />
              Find Student Jobs
            </Link>
            <Link
              to="/post-job"
              className="bg-transparent hover:bg-green-500 border-2 border-green-400 text-green-300 hover:text-white font-bold py-4 px-10 rounded-lg transition-colors duration-300 ease-in-out flex items-center justify-center text-lg" // Secondary CTA style
            >
              <Building2 className="w-5 h-5 mr-2" />
              Post a Job
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto"> {/* Increased padding and shadow */}
            <SearchBar onSearch={handleSearch} defaultLocation="Texas" />
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10"> {/* Increased bottom margin */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
              {educationLevel 
                ? `Latest ${educationLevel} Internships` 
                : 'Latest Opportunities'}
            </h2>
            <Link 
              to="/find-jobs"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center group text-lg" // Enhanced link
            >
              Explore All Jobs
              <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
          
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased gap */}
              {filteredJobs.slice(0, 6).map((job) => (
                <Link key={job.id} to={`/find-jobs/${job.id}`} className="h-full group"> {/* Added group for card hover effects if any */}
                  <JobCard job={job} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md"> {/* Increased padding */}
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found Right Now</h3>
              <p className="text-gray-500">Please check back later or broaden your search.</p>
            </div>
          )}
          
          <div className="text-center mt-16"> {/* Increased top margin */}
            <Link
              to="/find-jobs"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-lg" // Enhanced button
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 md:py-24 bg-white"> {/* Increased padding */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">Simple Steps to Get Started</h2> {/* Changed text, increased bottom margin */}
          
          <div className="grid md:grid-cols-2 gap-10 md:gap-16"> {/* Increased gap */}
            {/* For Students */}
            <div className="bg-blue-50 p-8 md:p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"> {/* Enhanced shadow and hover */}
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-700 flex items-center">
                <GraduationCap className="w-8 h-8 mr-3" /> {/* Increased icon size and margin */}
                Students: Find Your Fit
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Effortlessly browse flexible jobs. No sign-up needed to explore opportunities.
              </p>
              <p className="text-gray-600 mb-8">
                Simply click, discover, and apply directly. Your next job is just a few clicks away!
              </p>
              <div className="flex justify-center">
                <Link to="/find-jobs" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center text-md">
                  <Search className="w-5 h-5 mr-2" />
                  Start Browsing
                </Link>
              </div>
            </div>
            
            {/* For Employers */}
            <div className="bg-green-50 p-8 md:p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"> {/* Enhanced shadow and hover */}
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-green-700 flex items-center">
                <Building2 className="w-8 h-8 mr-3" /> {/* Increased icon size and margin */}
                Employers: Post with Ease
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Reach talented students quickly. Post jobs with or without an account.
              </p>
              <p className="text-gray-600 mb-8">
                Use our AI assistant or paste a job link. Connecting with candidates is simple.
              </p>
              <div className="flex justify-center">
                 <Link to="/post-job" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center text-md">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Post a Job Opening
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-100 py-16 md:py-24"> {/* Changed background, increased padding */}
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-800">Why InternJobs.ai?</h2> {/* Changed text, increased bottom margin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"> {/* Increased gap */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"> {/* Enhanced card */}
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"> {/* Larger icon container */}
                <Briefcase className="h-10 w-10 text-blue-600" /> {/* Larger icon */}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Flexible for You</h3>
              <p className="text-gray-600">Discover jobs that perfectly fit your student schedule—evenings, weekends, or summer breaks.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"> {/* Enhanced card */}
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"> {/* Larger icon container, different color */}
                <Search className="h-10 w-10 text-green-600" /> {/* Larger icon */}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Simple & Direct</h3>
              <p className="text-gray-600">No lengthy sign-ups. Find and apply for jobs quickly and easily.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"> {/* Enhanced card */}
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"> {/* Larger icon container, different color */}
                <GraduationCap className="h-10 w-10 text-purple-600" /> {/* Larger icon */}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Gain Experience</h3>
              <p className="text-gray-600">Kickstart your career with valuable work experience while you're still in school.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
