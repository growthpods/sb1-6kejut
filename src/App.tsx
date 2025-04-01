import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FindJobsPage } from './pages/FindJobsPage';
import { PostJobPage } from './pages/PostJobPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<FindJobsPage />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}