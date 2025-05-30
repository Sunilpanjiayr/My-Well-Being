// src/App.js - UPDATED WITH FORUM ROUTES

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
import { SidebarProvider } from './contexts/SidebarContext';
import './App.css';
import ConsultationRoom from './components/features/consultation/ConsultationRoom';


// Import Forum Components
import CommunityForum from './components/features/forum/CommunityForum';
import TopicDetailView from './components/features/forum/TopicDetailView';

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

          
          {/* Forum Routes for Patients */}
          <Route path="/forum/topic/:topicId" element={<TopicDetailView />} />
          <Route path="/forum/bookmarks" element={<CommunityForum />} />
          <Route path="/forum/my-topics" element={<CommunityForum />} />
          <Route path="/forum" element={<CommunityForum />} />

          {/* Forum Routes for Doctors */}
          <Route path="/doctor/forum/topic/:topicId" element={
            <DoctorProtectedRoute>
              <TopicDetailView />
            </DoctorProtectedRoute>
          } />
          <Route path="/doctor/forum/bookmarks" element={
            <DoctorProtectedRoute>
              <CommunityForum />
            </DoctorProtectedRoute>
          } />
          <Route path="/doctor/forum/my-topics" element={
            <DoctorProtectedRoute>
              <CommunityForum />
            </DoctorProtectedRoute>
          } />
          <Route path="/doctor/forum" element={
            <DoctorProtectedRoute>
              <CommunityForum />
            </DoctorProtectedRoute>
          } />
          
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
        <SidebarProvider>
          <AppLayout />
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;