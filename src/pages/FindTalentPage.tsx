import { useState, useEffect } from 'react';
import { MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { EmployerSignIn } from '../components/auth/EmployerSignIn';
import { useAuth } from '../contexts/AuthContext';
import { SAMPLE_CANDIDATES } from '../data/sampleCandidates';
import type { Candidate } from '../types';

export function FindTalentPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(SAMPLE_CANDIDATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSearch = (query: string, location: string) => {
    let filtered = [...SAMPLE_CANDIDATES];
    
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(candidate => {
        const searchText = `${candidate.name} ${candidate.title} ${candidate.skills.join(' ')} ${candidate.education}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }
    
    if (location && location !== 'United States') {
      filtered = filtered.filter(candidate =>
        candidate.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    setCandidates(filtered);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  const CandidateList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <img
              src={candidate.avatar_url || `https://ui-avatars.com/api/?name=${candidate.name}`}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">{candidate.name}</h3>
              <p className="text-gray-600">{candidate.title}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {candidate.location}
            </div>
            <div className="flex items-center text-gray-600">
              <GraduationCap className="w-4 h-4 mr-2" />
              {candidate.education}
            </div>
            <div className="flex items-center text-gray-600">
              <Briefcase className="w-4 h-4 mr-2" />
              {candidate.experience[0]}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
                  +{candidate.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Class of {candidate.graduationYear}</span>
            <span>GPA: {candidate.gpa}</span>
          </div>

          <button className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Profile
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Top Intern Talent</h1>
          <p className="text-xl text-gray-300 mb-12">
            Connect with motivated students ready to contribute to your company
          </p>
          <SearchBar 
            onSearch={handleSearch}
            defaultLocation="United States"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">
            Available Candidates
            <span className="text-gray-500 text-lg ml-2">
              (1k+)
            </span>
          </h2>
          <select className="px-4 py-2 border rounded-lg">
            <option>Most relevant</option>
            <option>Graduation year</option>
            <option>GPA</option>
          </select>
        </div>

        {!user ? (
          <div className="relative">
            <div className="absolute inset-0 backdrop-blur-md bg-white/30 z-10 flex items-center justify-center">
              <div className="max-w-md w-full">
                <EmployerSignIn />
              </div>
            </div>
            <div className="filter blur-sm">
              <CandidateList />
            </div>
          </div>
        ) : (
          <CandidateList />
        )}

        {candidates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No candidates found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}