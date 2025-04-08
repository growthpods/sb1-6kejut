import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { supabase } from '../lib/supabase'; // Import Supabase client
import type { Candidate } from '../types';
import { CandidateCard } from '../components/candidate/CandidateCard'; // Import the new component

export function FindTalentPage() {
  // Initialize candidates state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch candidates on component mount
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming 'profiles' table stores candidates with role 'student'
        // Adjust table/column names if necessary based on your schema
        const { data, error: dbError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            headline,
            location,
            skills,
            education,
            experience,
            profile_picture_url,
            // Add other relevant fields if needed by Candidate type (e.g., graduationYear, major)
          `)
          .eq('role', 'student'); // Filter for students

        if (dbError) {
          throw dbError;
        }

        // Map fetched data to Candidate type
        const mappedCandidates: Candidate[] = (data || []).map((profile: any) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          title: profile.headline || 'N/A', // Map headline to title
          location: profile.location || 'N/A',
          // Assuming these fields are directly compatible or simple strings/arrays
          // Adjust mapping if database types are complex (e.g., JSON objects)
          education: profile.education || 'N/A', // Provide default if null
          skills: Array.isArray(profile.skills) ? profile.skills : [], // Ensure skills is an array
          experience: Array.isArray(profile.experience) ? profile.experience : [], // Ensure experience is an array
          avatar_url: profile.profile_picture_url, // Map profile_picture_url
          // Add mappings for other optional Candidate fields if fetched
        }));

        setCandidates(mappedCandidates);
      } catch (err: any) {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidates. Please try again later.');
        setCandidates([]); // Clear candidates on error
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Implement search handler with Supabase query
  const handleSearch = async (query: string, location: string) => {
    setLoading(true);
    setError(null);
    console.log('Searching candidates with:', { query, location });

    try {
      let supabaseQuery = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          headline,
          location,
          skills,
          education,
          experience,
          profile_picture_url
        `)
        .eq('role', 'student'); // Always filter for students

      // Apply text query filter (searching name, headline)
      // Using 'or' condition for query matching multiple fields
      if (query) {
        const nameQuery = `(first_name.ilike.%${query}%,last_name.ilike.%${query}%)`;
        const headlineQuery = `headline.ilike.%${query}%`;
        // TODO: Add skills search if 'skills' column allows text search (e.g., text array or tsvector)
        // const skillsQuery = `skills::text.ilike.%${query}%`; // Example if skills is text[]
        supabaseQuery = supabaseQuery.or(`${nameQuery},${headlineQuery}`);
      }

      // Apply location filter
      if (location && location !== 'United States') { // Assuming 'United States' means no location filter
        supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
      }

      const { data, error: dbError } = await supabaseQuery;

      if (dbError) {
        throw dbError;
      }

      // Map results to Candidate type (same mapping as in useEffect)
      const mappedCandidates: Candidate[] = (data || []).map((profile: any) => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        title: profile.headline || 'N/A',
        location: profile.location || 'N/A',
        education: profile.education || 'N/A',
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        avatar_url: profile.profile_picture_url,
      }));

      setCandidates(mappedCandidates);

    } catch (err: any) {
      console.error('Error searching candidates:', err);
      setError('Failed to search candidates. Please try again later.');
      setCandidates([]); // Clear candidates on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading candidates...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12 text-center text-red-600">{error}</div>;
  }

  // Placeholder for no candidates found after fetching
  const NoCandidatesPlaceholder = () => (
    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg mt-8">
      <Info className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No Candidates Found</h3>
      <p className="mt-1 text-sm text-gray-500">
        No candidates match your current criteria or are available at this time.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Top Intern Talent</h1>
          <p className="text-xl text-gray-300 mb-12">
            Connect with motivated students ready to contribute to your company
          </p>
          <SearchBar
            onSearch={handleSearch}
            defaultLocation="United States" // Keep default or adjust as needed
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">
            Available Candidates
            <span className="text-gray-500 text-lg ml-2">
              ({candidates.length}) {/* Display actual count */}
            </span>
          </h2>
          {/* TODO: Implement sorting functionality */}
          <select className="px-4 py-2 border rounded-lg bg-white">
            <option>Most relevant</option>
            <option>Graduation year</option>
            <option>GPA</option>
          </select>
        </div>

        {/* Conditional Rendering: Show candidates or placeholder */}
        {candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Use the CandidateCard component */}
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        ) : (
          <NoCandidatesPlaceholder />
        )}
      </div>
    </div>
  );
}
