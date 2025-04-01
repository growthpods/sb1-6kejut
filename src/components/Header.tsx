import { Infinity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-black text-white py-4">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Infinity className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-semibold">InternJobs.ai</span>
        </Link>

        <div className="flex space-x-8">
          <Link to="/jobs" className="hover:text-blue-400">Find Jobs</Link>
          <Link to="/post-job" className="hover:text-blue-400">Post Job</Link>
          <Link to="/about" className="hover:text-blue-400">About us</Link>
        </div>
      </nav>
    </header>
  );
}