import { Bell, Infinity, UserCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function Header() {
  const { user, signOut, isEmployer } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-black text-white py-4">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Infinity className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-semibold">InternJobs.ai</span>
        </Link>

        <div className="flex space-x-8">
          <Link to="/jobs" className="hover:text-blue-400">Find Jobs</Link>
          <Link to="/talent" className="hover:text-blue-400">Find Talent</Link>
          {isEmployer && (
            <Link to="/post-job" className="hover:text-blue-400">Post Job</Link>
          )}
          <Link to="/about" className="hover:text-blue-400">About us</Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Bell className="w-5 h-5 cursor-pointer hover:text-blue-400" />
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:text-blue-400"
                >
                  <UserCircle className="w-6 h-6" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-400">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}