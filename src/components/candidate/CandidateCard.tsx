import type { Candidate } from '../../types';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div key={candidate.id} className="border p-4 rounded-lg bg-white shadow hover:shadow-md transition-shadow duration-200 flex flex-col">
      {candidate.avatar_url && (
        <img
          src={candidate.avatar_url}
          alt={`${candidate.name}'s profile`}
          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border" // Slightly larger avatar
        />
      )}
      {!candidate.avatar_url && (
         <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-300 flex items-center justify-center text-gray-500 text-2xl font-semibold border">
           {candidate.name.split(' ').map(n => n[0]).join('')} {/* Placeholder initials */}
         </div>
      )}
      <h3 className="font-semibold text-lg text-center mb-1">{candidate.name}</h3>
      <p className="text-sm text-gray-600 text-center mb-2">{candidate.title}</p>
      <p className="text-sm text-gray-500 text-center mb-3">{candidate.location}</p>

      {/* Display Skills (limited) */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 mb-1 font-medium">Top Skills:</p>
          <div className="flex flex-wrap justify-center gap-1">
            {candidate.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-xs text-gray-500">+{candidate.skills.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* TODO: Add button/link to view full profile - Placeholder Link */}
      <div className="mt-auto pt-3 text-center">
        {/* Replace '#' with actual profile link path e.g., `/profile/${candidate.id}` */}
        <Link
          to={`#`} // Placeholder link
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
