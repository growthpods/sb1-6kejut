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

// New component to access auth context and provide it to CopilotKit
function CopilotKitAppContent() {
  const { user } = useAuth();
  const copilotKitProperties = user ? { userId: user.id } : {};

  return (
    <CopilotKit 
      runtimeUrl="/.netlify/functions/copilotkit-runtime"
      properties={copilotKitProperties} // Pass userId if available
    >
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
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
        <CopilotKitAppContent />
      </AuthProvider>
    </Router>
  );
}
