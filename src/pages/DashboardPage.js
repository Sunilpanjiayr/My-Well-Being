// src/pages/DashboardPage.js - REPLACE YOUR EXISTING DASHBOARDPAGE WITH THIS

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import DashboardHome from '../components/features/dashboard/DashboardHome';
import HealthTracker from '../components/features/healthTracker/HealthTracker';
import MedicineReminders from '../components/features/medicineReminders/MedicineReminders';
import DoctorConsultation from '../components/features/doctorConsultation/DoctorConsultation';
import MentalWellness from '../components/features/mentalWellness/MentalWellness';
import FirstAidGuide from '../components/features/firstAid/FirstAidGuide';
import HealthyRecipes from '../components/features/recipes/HealthyRecipes';
import WaterTracker from '../components/features/waterTracker/WaterTracker';
import ExerciseRoutines from '../components/features/exercise/ExerciseRoutines';
import SymptomChecker from '../components/features/symptoms/SymptomChecker';
import CommunityForum from '../components/features/forum/CommunityForum';
import SleepTracker from '../components/features/sleep/SleepTracker';
import DailyChallenges from '../components/features/challenges/DailyChallenges';
import { useTheme } from '../contexts/ThemeContext';
import { useSidebar } from '../contexts/SidebarContext'; // Import sidebar context
import '../styles/Dashboard.css';

function DashboardPage() {
  const { darkMode } = useTheme();
  const { sidebarWidth } = useSidebar(); // Get the dynamic sidebar width

  return (
    <div className={`dashboard-page ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content - dynamically adjusts to sidebar width */}
      <div 
        className="dashboard-content" 
        style={{ 
          marginLeft: `${sidebarWidth}px`, // Dynamic margin based on sidebar state
          width: `calc(100% - ${sidebarWidth}px)`, // Dynamic width
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease, width 0.3s ease' // Smooth transition
        }}
      >
        {/* Navbar */}
        <Navbar />
        
        {/* Content wrapper */}
        <div 
          className="content-wrapper" 
          style={{
            flex: 1,
            padding: '20px',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'auto' // Allow scrolling if needed
          }}
        >
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="health-tracker" element={<HealthTracker />} />
            <Route path="medicine-reminders" element={<MedicineReminders />} />
            <Route path="doctor-consultation" element={<DoctorConsultation />} />
            <Route path="mental-wellness" element={<MentalWellness />} />
            <Route path="first-aid" element={<FirstAidGuide />} />
            <Route path="recipes" element={<HealthyRecipes />} />
            <Route path="water-tracker" element={<WaterTracker />} />
            <Route path="exercise" element={<ExerciseRoutines />} />
            <Route path="symptoms" element={<SymptomChecker />} />
            <Route path="forum" element={<CommunityForum />} />
            <Route path="sleep" element={<SleepTracker />} />
            <Route path="challenges" element={<DailyChallenges />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;