// src/App.js - REPLACE YOUR EXISTING APP.JS WITH THIS INTEGRATED VERSION

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import DoctorSignup from './components/Auth/DoctorSignup';
import DoctorLogin from './components/Auth/DoctorLogin';
import DashboardPage from './pages/DashboardPage';
import DashboardHome from './components/features/dashboard/DashboardHome';
import DoctorDashboard from './components/features/DoctorDashboard/DoctorDashboard';
import DoctorSchedule from './components/features/DoctorDashboard/DoctorSchedule';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from '../src/components/common/ProtectedRoute';
import DoctorProtectedRoute from '../src/components/common/DoctorProtectedRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext'; // Add this import
import './App.css';
import ConsultationRoom from './components/features/consultation/ConsultationRoom';

// Wrapper component to conditionally render Header and Footer
const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/doctor');

  return (
    <div className="app-container">
      {!isDashboard && <Header />}
      <main className={isDashboard ? "dashboard-main" : "main-content"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctorLogin" element={<DoctorLogin />} />
          <Route path="/doctorSignup" element={<DoctorSignup />} />
          <Route path="/register" element={<Signup />} />
          <Route 
            path="/dashboardHome" 
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctorDashboard"
            element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            }
          />

          <Route
            path="/doctor/*"
            element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            }
          />

          <Route path="/doctor/dashboard" element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          } />
          <Route path="/doctor/schedule" element={
            <DoctorProtectedRoute>
              <DoctorSchedule />
            </DoctorProtectedRoute>
          } />
          <Route path="/consultation-room/:roomId" element={<ConsultationRoom />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider> {/* Add SidebarProvider here */}
          <AppLayout />
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;