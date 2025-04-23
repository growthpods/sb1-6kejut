import { useState } from 'react';
import { X, SlidersHorizontal, Clock } from 'lucide-react';

const jobTypes = ['All', 'Full-Time', 'Part-Time', 'Remote'];
const experienceLevels = ['All', 'Entry Level', 'Intermediate', 'Expert'];
const timeCommitments = ['All', 'Evening', 'Weekend', 'Summer'];
const datePosted = ['Any time', 'Past 24 hours', 'Past week', 'Past month'];

interface JobFiltersProps {
  onFilterChange: (filters: {
    type: string;
    level: string;
    timeCommitment?: string;
    datePosted: string;
  }) => void;
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState('All');
  const [selectedDate, setSelectedDate] = useState('Any time');

  const handleFilterChange = (
    type: string | null = null,
    level: string | null = null,
    timeCommitment: string | null = null,
    date: string | null = null
  ) => {
    const newType = type ?? selectedType;
    const newLevel = level ?? selectedLevel;
    const newTimeCommitment = timeCommitment ?? selectedTimeCommitment;
    const newDate = date ?? selectedDate;

    setSelectedType(newType);
    setSelectedLevel(newLevel);
    setSelectedTimeCommitment(newTimeCommitment);
    setSelectedDate(newDate);

    onFilterChange({
      type: newType,
      level: newLevel,
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
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={selectedType === type}
                onChange={(e) => handleFilterChange(e.target.value, null, null, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Level</h3>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level} className="flex items-center">
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={selectedLevel === level}
                onChange={(e) => handleFilterChange(null, e.target.value, null, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Time Commitment
        </h3>
        <div className="space-y-2">
          {timeCommitments.map((time) => (
            <label key={time} className="flex items-center">
              <input
                type="radio"
                name="timeCommitment"
                value={time}
                checked={selectedTimeCommitment === time}
                onChange={(e) => handleFilterChange(null, null, e.target.value, null)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{time}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Date Posted</h3>
        <div className="space-y-2">
          {datePosted.map((date) => (
            <label key={date} className="flex items-center">
              <input
                type="radio"
                name="datePosted"
                value={date}
                checked={selectedDate === date}
                onChange={(e) => handleFilterChange(null, null, null, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{date}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <SlidersHorizontal className="w-5 h-5" />
        Filters
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile sliding panel */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 transition-transform ${
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
