import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/job/JobFilters';
import { supabase } from '../lib/supabase';
import type { Job } from '../types';
import { Link } from 'react-router-dom';
import { Clock, Briefcase, MapPin, ArrowRight, Search, Building2, GraduationCap } from 'lucide-react';

export function HomePage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<{ 
    type: string; 
    level: string; 
    timeCommitment?: string;
    datePosted: string 
  }>({ 
    type: 'All', 
    level: 'All', 
    timeCommitment: undefined,
    datePosted: 'Any time' 
  });
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
          .limit(6); // Fetch only the 6 most recent jobs for the homepage

        if (error) throw error;

        const jobsWithDates = data.map(job => ({
          ...job,
          postedAt: new Date(job.posted_at || job.postedAt)
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
        ('timeCommitment' in job && job.timeCommitment === filters.timeCommitment);

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

  // Update search state
  const handleSearch = (query: string, loc: string) => {
    setSearchQuery(query);
    setLocation(loc);
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
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Find Your Perfect Job for<br />Evenings, Weekends, or Summer Break!
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Connecting High School Students with Local Employers for Flexible Jobs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              to="/find-jobs"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Jobs
            </Link>
            <Link
              to="/post-job"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Post a Job
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-lg max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} defaultLocation="United States" />
          </div>
        </div>
      </div>

      {/* Time Commitment Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Find Jobs That Fit Your Schedule</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Evening Jobs */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Evening Jobs</h3>
              <p className="text-gray-600 text-center mb-6">
                Perfect for after school hours. Balance your studies with work experience.
              </p>
              <div className="text-center">
<Link 
                  to="/find-jobs" 
                  className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800"
                  onClick={() => setFilters({...filters, timeCommitment: 'Evening'})}
                >
                  Browse Evening Jobs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Weekend Jobs */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Weekend Jobs</h3>
              <p className="text-gray-600 text-center mb-6">
                Keep your weekdays free for school and activities. Work on Saturdays and Sundays.
              </p>
              <div className="text-center">
                <Link 
                  to="/find-jobs" 
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                  onClick={() => setFilters({...filters, timeCommitment: 'Weekend'})}
                >
                  Browse Weekend Jobs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Summer Jobs */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Summer Jobs</h3>
              <p className="text-gray-600 text-center mb-6">
                Make the most of your summer break with full-time opportunities and internships.
              </p>
              <div className="text-center">
                <Link 
                  to="/find-jobs" 
                  className="inline-flex items-center text-green-600 font-medium hover:text-green-800"
                  onClick={() => setFilters({...filters, timeCommitment: 'Summer'})}
                >
                  Browse Summer Jobs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="bg-blue-50 p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800 flex items-center">
                <GraduationCap className="w-6 h-6 mr-2" />
                For Students
              </h3>
              <p className="text-lg mb-4">
                InternJobs.ai makes it easy for high school students to find flexible, part-time jobs without the hassle of sign-ups.
              </p>
              <p className="text-gray-700 mb-6">
                Browse available opportunities by simply clicking on job listings. No account needed – just find, apply, and start working!
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                  <Search className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <span className="block text-center font-medium">Browse Jobs</span>
                </div>
              </div>
            </div>
            
            {/* For Employers */}
            <div className="bg-green-50 p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold mb-4 text-green-800 flex items-center">
                <Building2 className="w-6 h-6 mr-2" />
                For Employers
              </h3>
              <p className="text-lg mb-4">
                Posting a job is quick and simple. Whether you're a small business or large company, you can create job listings with or without logging in.
              </p>
              <p className="text-gray-700 mb-6">
                Just copy and paste your existing job link or create a new job posting in minutes.
              </p>
              <div className="flex justify-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-md text-center">
                    <Building2 className="h-8 w-8 text-green-600 mx-auto" />
                    <span className="text-sm">Post a Job</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="bg-white p-3 rounded-lg shadow-md text-center">
                    <GraduationCap className="h-8 w-8 text-green-600 mx-auto" />
                    <span className="text-sm">Student Applies</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="bg-white p-3 rounded-lg shadow-md text-center">
                    <Briefcase className="h-8 w-8 text-green-600 mx-auto" />
                    <span className="text-sm">Connect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Jobs</h2>
            <Link 
              to="/find-jobs"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All Jobs
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {allJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allJobs.slice(0, 6).map((job) => (
                <Link key={job.id} to={`/find-jobs/${job.id}`} className="h-full">
                  <JobCard job={job} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No jobs found. Check back soon!</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/find-jobs"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Opportunities</h3>
              <p className="text-gray-600">Find jobs that fit your schedule - evenings, weekends, or summer breaks.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Filtering</h3>
              <p className="text-gray-600">Quickly find relevant jobs with our powerful search and filter tools.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-gray-600">Gain valuable experience and kickstart your professional journey while still in high school.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
