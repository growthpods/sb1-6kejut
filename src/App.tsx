import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { FindJobsPage } from './pages/FindJobsPage';
import { FindTalentPage } from './pages/FindTalentPage';
import { LoginPage } from './pages/LoginPage';
import { PostJobPage } from './pages/PostJobPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LinkedInCallback } from './pages/LinkedInCallback';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<FindJobsPage />} />
              <Route path="/talent" element={<FindTalentPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/post-job" element={<PostJobPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/linkedin" element={<LinkedInCallback />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}