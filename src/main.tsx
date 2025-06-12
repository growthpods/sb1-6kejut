import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import "@copilotkit/react-ui/styles.css";
import { JobFilterProvider } from './contexts/JobFilterContext';
import { EducationLevelProvider } from './contexts/EducationLevelContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <EducationLevelProvider>
      <JobFilterProvider>
        <App />
      </JobFilterProvider>
    </EducationLevelProvider>
  </StrictMode>
);
