import React from 'react';
import { useEducationLevel } from '../contexts/EducationLevelContext';

export function EducationLevelModal() {
  const { educationLevel, setEducationLevel, showModal, setShowModal } = useEducationLevel();

  if (!showModal) {
    return null;
  }

  const handleSelection = (level: string) => {
    setEducationLevel(level);
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome to InternJobs.ai</h2>
        <p className="text-gray-600 text-center mb-8">
          Are you looking for internships for high school or college students?
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelection('High School')}
            className="flex flex-col items-center justify-center p-6 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
            <span className="text-lg font-medium text-green-700">High School</span>
            <span className="text-sm text-gray-500 mt-2 text-center">Find internships for high school students</span>
          </button>
          
          <button
            onClick={() => handleSelection('College')}
            className="flex flex-col items-center justify-center p-6 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
            <span className="text-lg font-medium text-purple-700">College</span>
            <span className="text-sm text-gray-500 mt-2 text-center">Find internships for college students</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-6">
          You can change this selection later
        </p>
      </div>
    </div>
  );
}
