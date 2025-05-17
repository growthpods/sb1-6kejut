import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Clock } from 'lucide-react';
import { useEducationLevel } from '../../contexts/EducationLevelContext';

const jobTypes = ['All', 'Full-Time', 'Part-Time', 'Remote'];
const experienceLevels = ['All', 'Entry Level', 'Intermediate', 'Expert'];
const educationLevels = ['All', 'High School', 'College'];
const timeCommitments = ['All', 'Evening', 'Weekend', 'Summer'];
const datePosted = ['Any time', 'Past 24 hours', 'Past week', 'Past month'];

interface JobFiltersProps {
  onFilterChange: (filters: {
    type: string;
    level: string;
    educationLevel?: string;
    timeCommitment?: string;
    datePosted: string;
  }) => void;
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const { educationLevel } = useEducationLevel();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState(educationLevel || 'All');
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState('All');
  const [selectedDate, setSelectedDate] = useState('Any time');
  
  // Update selected education level when the global context changes
  useEffect(() => {
    if (educationLevel) {
      setSelectedEducationLevel(educationLevel);
      handleFilterChange(null, null, educationLevel, null, null);
    }
  }, [educationLevel]);

  const handleFilterChange = (
    type: string | null = null,
    level: string | null = null,
    educationLevel: string | null = null,
    timeCommitment: string | null = null,
    date: string | null = null
  ) => {
    const newType = type ?? selectedType;
    const newLevel = level ?? selectedLevel;
    const newEducationLevel = educationLevel ?? selectedEducationLevel;
    const newTimeCommitment = timeCommitment ?? selectedTimeCommitment;
    const newDate = date ?? selectedDate;

    setSelectedType(newType);
    setSelectedLevel(newLevel);
    setSelectedEducationLevel(newEducationLevel);
    setSelectedTimeCommitment(newTimeCommitment);
    setSelectedDate(newDate);

    onFilterChange({
      type: newType,
      level: newLevel,
      educationLevel: newEducationLevel !== 'All' ? newEducationLevel : undefined,
      timeCommitment: newTimeCommitment !== 'All' ? newTimeCommitment : undefined,
      datePosted: newDate,
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center lg:hidden">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Close filters"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={selectedType === type}
                onChange={(e) => handleFilterChange(e.target.value, null, null, null, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Experience Level</h3>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={selectedLevel === level}
                onChange={(e) => handleFilterChange(null, e.target.value, null, null, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Education Level</h3>
        <div className="space-y-2">
          {educationLevels.map((level) => (
            <label key={level} className={`flex items-center cursor-pointer ${level !== 'All' ? 'p-1 rounded' : ''} ${level === 'High School' ? 'bg-green-50' : level === 'College' ? 'bg-purple-50' : ''}`}>
              <input
                type="radio"
                name="educationLevel"
                value={level}
                checked={selectedEducationLevel === level}
                onChange={(e) => handleFilterChange(null, null, e.target.value, null, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className={`ml-2 ${level === 'High School' ? 'text-green-600 font-medium' : level === 'College' ? 'text-purple-600 font-medium' : 'text-gray-700'}`}>{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Time Commitment
        </h3>
        <div className="space-y-2">
          {timeCommitments.map((commitment) => (
            <label key={commitment} className={`flex items-center cursor-pointer ${commitment !== 'All' ? 'p-1 rounded' : ''} ${commitment === 'Summer' ? 'bg-blue-50' : ''}`}>
              <input
                type="radio"
                name="timeCommitment"
                value={commitment}
                checked={selectedTimeCommitment === commitment}
                onChange={(e) => handleFilterChange(null, null, null, e.target.value, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className={`ml-2 ${commitment === 'Summer' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>{commitment}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Date Posted</h3>
        <div className="space-y-2">
          {datePosted.map((date) => (
            <label key={date} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="datePosted"
                value={date}
                checked={selectedDate === date}
                onChange={(e) => handleFilterChange(null, null, null, null, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{date}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply button for mobile */}
      <div className="mt-6 lg:hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-5 h-5" />
        Filters
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block bg-white p-5 rounded-lg shadow-sm">
        <FilterContent />
      </div>

      {/* Mobile sliding panel */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-xs bg-white p-5 overflow-y-auto transition-transform ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <FilterContent />
        </div>
      </div>
    </>
  );
}
