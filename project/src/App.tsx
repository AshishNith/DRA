import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ComplianceMaster from './components/ComplianceMaster';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import WorkLocations from './components/WorkLocations';
import GraphView from './components/GraphView';
import DownloadDetails from './components/DownloadDetails';
import FutureFeature from './components/FutureFeature';
import Progress from './components/Progress';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
// import SignupPage from './components/SignupPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/signup" element={<SignupPage />} /> */}
          <Route path="/sidebar" element={<Sidebar />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="Compliance Master">
                  <ComplianceMaster />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="Manage Users">
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/show-users"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="All Users">
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/initiatives"
            element={
              <ProtectedRoute>
                <Layout title="My Initiatives">
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="Work Locations">
                  <WorkLocations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/graph"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="Analytics Dashboard">
                  <GraphView />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/download"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="Download Details">
                  <DownloadDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/future"
            element={
              <ProtectedRoute requireAdmin>
                <Layout title="Future Features">
                  <FutureFeature />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Layout title="Progress Overview">
                  <Progress />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;