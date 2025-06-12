import React, { createContext, useContext, useState } from 'react';

export interface JobFilters {
  type: string;
  level: string;
  educationLevel?: string;
  timeCommitment?: string;
  datePosted: string;
  searchQuery: string;
  location: string;
}

interface JobFilterContextProps {
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  updateFilter: (key: keyof JobFilters, value: string) => void;
}

const defaultFilters: JobFilters = {
  type: 'All',
  level: 'All',
  educationLevel: 'All',
  timeCommitment: 'All',
  datePosted: 'Any time',
  searchQuery: '',
  location: '',
};

const JobFilterContext = createContext<JobFilterContextProps>({
  filters: defaultFilters,
  setFilters: () => {},
  updateFilter: () => {},
});

export const JobFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);

  const updateFilter = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <JobFilterContext.Provider value={{ filters, setFilters, updateFilter }}>
      {children}
    </JobFilterContext.Provider>
  );
};

export const useJobFilters = () => useContext(JobFilterContext); 