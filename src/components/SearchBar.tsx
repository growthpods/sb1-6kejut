import { Search, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { LOCATIONS } from '../data/locations';

interface SearchBarProps {
  onSearch: (query: string, location: string) => void;
  defaultLocation?: string;
  query?: string;
  location?: string;
  setQuery?: (q: string) => void;
  setLocation?: (l: string) => void;
}

export function SearchBar({ onSearch, defaultLocation = 'Texas', query: controlledQuery, location: controlledLocation, setQuery: setControlledQuery, setLocation: setControlledLocation }: SearchBarProps) {
  const [uncontrolledQuery, setUncontrolledQuery] = useState('');
  const [uncontrolledLocation, setUncontrolledLocation] = useState(defaultLocation);
  const query = controlledQuery !== undefined ? controlledQuery : uncontrolledQuery;
  const location = controlledLocation !== undefined ? controlledLocation : uncontrolledLocation;
  const setQuery = setControlledQuery || setUncontrolledQuery;
  const setLocation = setControlledLocation || setUncontrolledLocation;
  const [showLocations, setShowLocations] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(LOCATIONS);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    'Software Engineer Intern',
    'UX Design Intern',
    'Marketing Intern',
    'Data Science Intern',
    'Product Manager Intern'
  ];

  useEffect(() => {
    // Auto-focus the search input
    searchInputRef.current?.focus();

    // Animate placeholder text
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowLocations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const filtered = LOCATIONS.filter(loc => 
      loc.toLowerCase().includes(location.toLowerCase())
    ).slice(0, 5);
    setFilteredLocations(filtered);
  }, [location]);

  // Debounced real-time search for controlled mode
  useEffect(() => {
    if (setControlledQuery && setControlledLocation) {
      const handler = setTimeout(() => {
        onSearch(query, location);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [query, location, setControlledQuery, setControlledLocation, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
  };

  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setShowLocations(false);
    onSearch(query, loc);
  };

  return (
    <div ref={searchContainerRef} className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full bg-white rounded-2xl sm:rounded-full overflow-hidden shadow-lg">
        <div className="flex-1 flex items-center px-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            style={{ background: 'transparent' }}
          />
        </div>
        <div className="flex-1 flex items-center px-4 sm:px-6 relative">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocations(true);
            }}
            onFocus={() => setShowLocations(true)}
            placeholder="Add country or city"
            className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            style={{ background: 'transparent' }}
          />
          {showLocations && filteredLocations.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full px-4 sm:px-6 py-3 text-left hover:bg-gray-50 focus:outline-none text-gray-900"
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          type="submit"
          className="bg-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>
    </div>
  );
}
