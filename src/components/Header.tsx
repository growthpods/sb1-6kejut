import { Bell, Infinity, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, signOut, isEmployer } = useAuth();

  return (
    <header className="bg-black text-white py-4">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Infinity className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-semibold">InternMatch</span>
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
          {user && <Bell className="w-5 h-5 cursor-pointer hover:text-blue-400" />}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <UserCircle className="w-6 h-6 cursor-pointer hover:text-blue-400" />
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm hover:text-blue-400"
              >
                Sign Out
              </button>
            </div>
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