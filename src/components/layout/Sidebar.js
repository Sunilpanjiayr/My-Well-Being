// src/components/layout/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Sidebar.css';

const Sidebar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  
  // Define feature categories
  const mainFeatures = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: 'health-tracker', label: 'Health Tracker', icon: '📈' },
    { path: 'water-tracker', label: 'Water Tracker', icon: '💧' },
    { path: 'exercise', label: 'Exercise Routines', icon: '🏋️' },
    { path: 'sleep', label: 'Sleep Tracker', icon: '😴' }
  ];
  
  const medicalFeatures = [
    { path: 'medicine-reminders', label: 'Medicine Reminders', icon: '💊' },
    { path: 'doctor-consultation', label: 'Doctor Consultation', icon: '👨‍⚕️' },
    { path: 'symptoms', label: 'Symptom Checker', icon: '🔍' },
    { path: 'first-aid', label: 'First Aid Guide', icon: '🩹' }
  ];
  
  const wellnessFeatures = [
    { path: 'mental-wellness', label: 'Mental Wellness', icon: '🧠' },
    { path: 'recipes', label: 'Healthy Recipes', icon: '🥗' },
    { path: 'forum', label: 'Community Forum', icon: '💬' },
    { path: 'challenges', label: 'Daily Challenges', icon: '🏆' }
  ];

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const isActive = (path) => {
    if (path === '') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.includes(`/dashboard/${path}`);
  };

  return (
    <div className={`sidebar ${darkMode ? 'dark' : ''} ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <span className="logo-icon">❤️</span>
          {expanded && <h1>My Well Being</h1>}
        </div>
        <button className="toggle-button" onClick={toggleSidebar}>
          {expanded ? '◀' : '▶'}
        </button>
      </div>
      
      {expanded && (
        <div className="user-profile">
          <div className="avatar">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <h3>{currentUser?.name || 'User'}</h3>
            <p>{currentUser?.email || 'user@example.com'}</p>
          </div>
        </div>
      )}
      
      <div className="sidebar-content">
        <div className="menu-category">
          {expanded && <h4>Main Features</h4>}
          <div className="menu-items">
            {mainFeatures.map((item) => (
              <NavLink
                key={item.path}
                to={`/dashboard/${item.path}`}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <div className="menu-icon">{item.icon}</div>
                {expanded && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
        
        <div className="menu-category">
          {expanded && <h4>Medical</h4>}
          <div className="menu-items">
            {medicalFeatures.map((item) => (
              <NavLink
                key={item.path}
                to={`/dashboard/${item.path}`}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <div className="menu-icon">{item.icon}</div>
                {expanded && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
        
        <div className="menu-category">
          {expanded && <h4>Wellness</h4>}
          <div className="menu-items">
            {wellnessFeatures.map((item) => (
              <NavLink
                key={item.path}
                to={`/dashboard/${item.path}`}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <div className="menu-icon">{item.icon}</div>
                {expanded && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="menu-icon">
            {darkMode ? '☀️' : '🌙'}
          </div>
          {expanded && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        
        <button 
          className="logout-button" 
          onClick={logout}
          title="Logout"
        >
          <div className="menu-icon">🚪</div>
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;