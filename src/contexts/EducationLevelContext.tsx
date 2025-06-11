import React, { createContext, useState, useContext, useEffect } from 'react';

interface EducationLevelContextProps {
  educationLevel: string | null;
  setEducationLevel: (level: string | null) => void;
  clearEducationLevel: () => void; // Function to clear the education level
  isEducationLevelSet: boolean; // Flag to check if education level is set
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const EducationLevelContext = createContext<EducationLevelContextProps>({
  educationLevel: null,
  setEducationLevel: () => {},
  clearEducationLevel: () => {},
  isEducationLevelSet: false,
  showModal: false,
  setShowModal: () => {},
});

interface EducationLevelProviderProps {
  children: React.ReactNode;
}

export const EducationLevelProvider: React.FC<EducationLevelProviderProps> = ({ children }) => {
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [isEducationLevelSet, setIsEducationLevelSet] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const storedLevel = localStorage.getItem('educationLevel');
    if (storedLevel) {
      setEducationLevel(storedLevel);
      setIsEducationLevelSet(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleSetEducationLevel = (level: string | null) => {
    setEducationLevel(level);
    setIsEducationLevelSet(!!level);
    if (level) {
      localStorage.setItem('educationLevel', level);
    } else {
      localStorage.removeItem('educationLevel');
    }
  };

  const clearEducationLevel = () => {
    setEducationLevel(null);
    setIsEducationLevelSet(false);
    localStorage.removeItem('educationLevel');
  };

  return (
    <EducationLevelContext.Provider 
      value={{ 
        educationLevel, 
        setEducationLevel: handleSetEducationLevel, 
        clearEducationLevel,
        isEducationLevelSet,
        showModal, 
        setShowModal 
      }}
    >
      {children}
    </EducationLevelContext.Provider>
  );
};

export const useEducationLevel = () => {
  return useContext(EducationLevelContext);
};
