import { useState, useCallback } from 'react';
import type { Job } from '../types';

interface Filters {
  type: string;
  level: string;
  datePosted: string;
}

export function useJobFilters(initialJobs: Job[]) {
  const [filters, setFilters] = useState<Filters>({
    type: 'All',
    level: 'All',
    datePosted: 'Any time'
  });

  const applyFilters = useCallback((jobs: Job[]) => {
    return jobs.filter(job => {
      if (filters.type !== 'All' && job.type !== filters.type) {
        return false;
      }
      
      if (filters.level !== 'All' && job.level !== filters.level) {
        return false;
      }

      if (filters.datePosted !== 'Any time') {
        const jobDate = new Date(job.postedAt);
        const now = new Date();
        const diffInHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);

        switch (filters.datePosted) {
          case 'Past 24 hours':
            if (diffInHours > 24) return false;
            break;
          case 'Past week':
            if (diffInHours > 24 * 7) return false;
            break;
          case 'Past month':
            if (diffInHours > 24 * 30) return false;
            break;
        }
      }

      return true;
    });
  }, [filters]);

  return {
    filters,
    setFilters,
    applyFilters
  };
}