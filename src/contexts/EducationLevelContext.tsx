import React, { createContext, useState, useContext, useEffect } from 'react';

interface EducationLevelContextProps {
  educationLevel: string | null;
  setEducationLevel: (level: string | null) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const EducationLevelContext = createContext<EducationLevelContextProps>({
  educationLevel: null,
  setEducationLevel: () => {},
  showModal: false,
  setShowModal: () => {},
});

interface EducationLevelProviderProps {
  children: React.ReactNode;
}

export const EducationLevelProvider: React.FC<EducationLevelProviderProps> = ({ children }) => {
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if education level is stored in localStorage
    const storedLevel = localStorage.getItem('educationLevel');
    if (storedLevel) {
      setEducationLevel(storedLevel);
    } else {
      // If no education level is stored, show the modal
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    // Update localStorage when education level changes
    if (educationLevel) {
      localStorage.setItem('educationLevel', educationLevel);
    } else {
      localStorage.removeItem('educationLevel');
    }
  }, [educationLevel]);

  return (
    <EducationLevelContext.Provider value={{ educationLevel, setEducationLevel, showModal, setShowModal }}>
      {children}
    </EducationLevelContext.Provider>
  );
};

export const useEducationLevel = () => {
  return useContext(EducationLevelContext);
};
