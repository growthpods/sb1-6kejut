import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { JobCard } from '../components/JobCard';
import { supabase } from '../lib/supabase';
import type { Job } from '../types';
import { useEducationLevel } from '../contexts/EducationLevelContext';

export function FindJobsPage() {
  const { educationLevel, clearEducationLevel } = useEducationLevel();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const jobsPerPage = 20;
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch jobs in batches for infinite scroll
  useEffect(() => {
    setJobs([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);
    fetchJobs(0, true);
    // eslint-disable-next-line
  }, [educationLevel]);

  async function fetchJobs(pageNum: number, replace = false) {
    try {
      const query = supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false })
        .range(pageNum * jobsPerPage, (pageNum + 1) * jobsPerPage - 1);
      if (educationLevel) {
        query.eq('education_level', educationLevel);
      }
      const { data, error } = await query;
      if (error) throw error;
      const jobsWithDates = data.map(job => ({
        ...job,
        postedAt: new Date(job.posted_at || job.postedAt),
        timeCommitment: job.time_commitment,
        educationLevel: job.education_level,
      }));
      if (replace) {
        setJobs(jobsWithDates);
      } else {
        setJobs(prev => [...prev, ...jobsWithDates]);
      }
      setHasMore(jobsWithDates.length === jobsPerPage);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Infinite scroll handler
  useEffect(() => {
    function handleScroll() {
      if (!listRef.current || loadingMore || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setLoadingMore(true);
        fetchJobs(page + 1);
        setPage(prev => prev + 1);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, loadingMore, hasMore]);

  if (loading && jobs.length === 0) {
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
            <SearchBar onSearch={() => {}} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12" ref={listRef}>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0">
            <h2 className="text-xl md:text-2xl font-semibold">
              {educationLevel 
                ? `${educationLevel} Internships` 
                : 'Available Positions'}
              <span className="text-gray-500 text-base md:text-lg ml-2">
                ({jobs.length})
              </span>
              {educationLevel && (
                <button 
                  onClick={() => clearEducationLevel()} 
                  className="ml-4 text-sm text-blue-500 hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {jobs.map((job) => (
              <Link key={job.id} to={`/find-jobs/${job.id}`} className="block h-full">
                <JobCard job={job} />
              </Link>
            ))}
          </div>
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading more jobs...</span>
            </div>
          )}
          {!hasMore && jobs.length > 0 && (
            <div className="text-center text-gray-400 py-8">No more jobs to load.</div>
          )}
        </div>
      </div>
    </div>
  );
}
