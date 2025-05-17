import { Infinity, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEducationLevel } from '../contexts/EducationLevelContext';

export function Header() {
  const { educationLevel, setShowModal } = useEducationLevel();
  
  const handleChangeEducationLevel = () => {
    setShowModal(true);
  };
  
  return (
    <header className="bg-black text-white py-4">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Infinity className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-semibold">InternJobs.ai</span>
          </Link>
          
          {educationLevel && (
            <div className="flex items-center ml-4 pl-4 border-l border-gray-700">
              <span className={`text-sm font-medium ${educationLevel === 'High School' ? 'text-green-400' : 'text-purple-400'}`}>
                for {educationLevel}
              </span>
              <button 
                onClick={handleChangeEducationLevel}
                className="ml-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Change education level"
              >
                <Edit2 className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        <div className="flex space-x-8">
          <Link to="/find-jobs" className="hover:text-blue-400">Find Jobs</Link>
          <Link to="/post-job" className="hover:text-blue-400">Post Job</Link>
          <Link to="/about" className="hover:text-blue-400">About us</Link>
        </div>
      </nav>
    </header>
  );
}
