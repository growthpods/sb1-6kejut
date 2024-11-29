import { useState, useCallback } from 'react';
import type { Candidate } from '../types';

export function useTalentSearch() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const searchCandidates = useCallback((candidates: Candidate[]) => {
    return candidates.filter(candidate => {
      const searchText = `${candidate.name} ${candidate.title} ${candidate.skills.join(' ')} ${candidate.education}`.toLowerCase();
      const matchesQuery = !query || searchText.includes(query.toLowerCase());
      const matchesLocation = !location || candidate.location.toLowerCase().includes(location.toLowerCase());
      
      return matchesQuery && matchesLocation;
    });
  }, [query, location]);

  return {
    query,
    location,
    setQuery,
    setLocation,
    searchCandidates
  };
}