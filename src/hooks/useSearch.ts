import { useState, useCallback } from 'react';
import type { Job } from '../types';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const searchJobs = useCallback((jobs: Job[]) => {
    return jobs.filter(job => {
      const matchesQuery = !query || 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());

      const matchesLocation = !location ||
        job.location.toLowerCase().includes(location.toLowerCase());

      return matchesQuery && matchesLocation;
    });
  }, [query, location]);

  return {
    query,
    location,
    setQuery,
    setLocation,
    searchJobs
  };
}