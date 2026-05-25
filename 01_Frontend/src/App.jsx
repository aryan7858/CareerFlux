import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// ── Public Pages ──────────────────────────────────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';

// ── Dashboard Pages ───────────────────────────────────────────────────────────
import SeekerDashboard from './pages/dashboard/SeekerDashboard';
import EmployerDashboard from './pages/dashboard/EmployerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// ── Employer Pages ────────────────────────────────────────────────────────────
import PostJob from './pages/employer/PostJob';
import ViewApplicants from './pages/employer/ViewApplicants';

export default function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* Jobseeker Routes */}
            <Route
                path="/dashboard"
                element={<ProtectedRoute roles={['jobseeker']}><SeekerDashboard /></ProtectedRoute>}
            />
            <Route
                path="/resume-builder"
                element={<ProtectedRoute roles={['jobseeker']}><ResumeBuilder /></ProtectedRoute>}
            />
            <Route
                path="/profile"
                element={<ProtectedRoute roles={['jobseeker', 'employer']}><Profile /></ProtectedRoute>}
            />

            {/* Employer Routes */}
            <Route
                path="/employer/dashboard"
                element={<ProtectedRoute roles={['employer']}><EmployerDashboard /></ProtectedRoute>}
            />
            <Route
                path="/employer/post-job"
                element={<ProtectedRoute roles={['employer']}><PostJob /></ProtectedRoute>}
            />
            <Route
                path="/employer/edit-job/:jobId"
                element={<ProtectedRoute roles={['employer']}><PostJob /></ProtectedRoute>}
            />
            <Route
                path="/employer/jobs/:jobId/applicants"
                element={<ProtectedRoute roles={['employer']}><ViewApplicants /></ProtectedRoute>}
            />

            {/* Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
            />

            {/* Catch-all */}
            <Route path="*" element={<Home />} />
        </Routes>
    );
}
