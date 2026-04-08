import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RoleSelection from './pages/RoleSelection';
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile from './pages/ClientProfile';
import ConnectWallet from './pages/ConnectWallet';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import ClientGigs from './pages/ClientGigs';
import Dashboard from './pages/Dashboard';
import FreelancerGigs from './pages/FreelancerGigs';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="font-sans antialiased min-h-screen text-slate-800 bg-[#f4f6fc] dark:bg-[#0b0f19] dark:text-slate-200 transition-colors duration-200">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Private Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/freelancer-gigs" element={<FreelancerGigs />} />
                  <Route path="/post-job" element={<PostJob />} />
                  <Route path="/client-gigs" element={<ClientGigs />} />
                  <Route path="/freelancer-profile" element={<FreelancerProfile />} />
                  <Route path="/client-profile" element={<ClientProfile />} />
                  <Route path="/connect-wallet" element={<ConnectWallet />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Routes>
        </div>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
