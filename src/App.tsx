import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FindJobsPage } from './pages/FindJobsPage';
import { PostJobPage } from './pages/PostJobPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth
import { CopilotKit } from '@copilotkit/react-core';
import { EducationLevelProvider } from './contexts/EducationLevelContext';
import { EducationLevelModal } from './components/EducationLevelModal';

// Component to provide CopilotKit to the app
function CopilotKitAppContent() {
  return (
    <CopilotKit 
      publicApiKey="ck_pub_72cd57d7c553541743eedfba18fa94e8"
      guardrails_c={{
        // Topics to explicitly block
        invalidTopics: ["politics", "explicit-content", "harmful-content"],
        // Topics to explicitly allow
        validTopics: ["business", "technology", "general-assistance", "job-posting", "internships"],
      }}
      // Using CopilotKit Cloud with public API key and guardrails
    >
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <EducationLevelModal />
        <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/find-jobs" element={<FindJobsPage />} />
              <Route path="/post-job" element={<PostJobPage />} />
              <Route path="/find-jobs/:id" element={<JobDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div> {/* This div closes here, inside CopilotKit */}
    </CopilotKit> 
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <EducationLevelProvider>
          <CopilotKitAppContent />
        </EducationLevelProvider>
      </AuthProvider>
    </Router>
  );
}
