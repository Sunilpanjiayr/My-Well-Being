// src/components/features/dashboard/DashboardHome.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../Auth/firebase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import Chatbot from '../chatbot/Chatbot'; // Import the Chatbot component
import '../../../styles/DashboardHome.css';

function DashboardHome() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    // Get current user's display name if available
    const user = auth.currentUser;
    if (user) {
      // Use displayName (username) first, then fall back to email or phone
      setUserName(user.displayName || user.email || user.phoneNumber || 'User');
    } else {
      // If no user is logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Force clear any cached auth tokens
      // This ensures the user will need to login again even if token is cached
      window.localStorage.removeItem('firebase:authUser');
      
      // When successfully logged out, navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  // Dashboard widgets for all 11 features
  const widgets = [
    {
      id: 'health-tracker',
      title: 'Health Tracker',
      description: 'Log and monitor your daily health activities',
      icon: '📊',
      link: '/dashboard/health-tracker',
      color: 'teal'
    },
    {
      id: 'medicine-reminders',
      title: 'Medicine Reminders',
      description: 'Set reminders for your medications',
      icon: '💊',
      link: '/dashboard/medicine-reminders',
      color: 'pink'
    },
    {
      id: 'doctor-consultation',
      title: 'Doctor Consultation',
      description: 'Book appointments with healthcare professionals',
      icon: '👨‍⚕️',
      link: '/dashboard/doctor-consultation',
      color: 'purple'
    },
    {
      id: 'mental-wellness',
      title: 'Mental Wellness',
      description: 'Access resources for mental health and mindfulness',
      icon: '🧠',
      link: '/dashboard/mental-wellness',
      color: 'violet'
    },
    {
      id: 'first-aid',
      title: 'First Aid Guide',
      description: 'Quick access to emergency first aid procedures',
      icon: '🩹',
      link: '/dashboard/first-aid',
      color: 'orange'
    },
    {
      id: 'recipes',
      title: 'Healthy Recipes',
      description: 'Discover nutritious meal ideas and recipes',
      icon: '🥗',
      link: '/dashboard/recipes',
      color: 'cyan'
    },
    {
      id: 'water-tracker',
      title: 'Water Tracker',
      description: 'Monitor your daily water intake',
      icon: '💧',
      link: '/dashboard/water-tracker',
      color: 'blue'
    },
    {
      id: 'exercise',
      title: 'Exercise Routines',
      description: 'Access workout plans and exercise guides',
      icon: '🏋️',
      link: '/dashboard/exercise',
      color: 'green'
    },
    {
      id: 'symptoms',
      title: 'Symptom Checker',
      description: 'Check your symptoms and get guidance',
      icon: '🔍',
      link: '/dashboard/symptoms',
      color: 'amber'
    },
    {
      id: 'forum',
      title: 'Community Forum',
      description: 'Connect with others on health topics',
      icon: '💬',
      link: '/dashboard/forum',
      color: 'indigo'
    },
    {
      id: 'sleep',
      title: 'Sleep Tracker',
      description: 'Track your sleep patterns and get insights',
      icon: '😴',
      link: '/dashboard/sleep',
      color: 'lightblue'
    },
    {
      id: 'challenges',
      title: 'Daily Challenges',
      description: 'Take on health challenges to improve your wellbeing',
      icon: '🏆',
      link: '/dashboard/challenges',
      color: 'red'
    }
  ];

  return (
    <div className={`dashboard-home ${darkMode ? 'dark' : ''}`}>
      <header className="dashboard-welcome">
        <h1>Welcome to Your Health Dashboard</h1>
        <p>
          Track your health metrics, set reminders and achieve your wellness goals.
        </p>
        <div className="user-actions">
          <span className="user-greeting">Hello, {userName}!</span>
          <button 
            onClick={handleLogout} 
            disabled={loading}
            className="logout-button"
          >
            {loading ? (
              <span className="loading-text">
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging out...
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      </header>

      {/* Quick stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon blue">
            <span>👣</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Today's Steps</p>
            <p className="stat-value">3,542</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <span>💧</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Water Intake</p>
            <p className="stat-value">1.2L / 2.5L</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple">
            <span>🏆</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Active Challenges</p>
            <p className="stat-value">2</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orange">
            <span>❤️</span>
          </div>
          <div className="stat-info">
            <p className="stat-label">Heart Rate</p>
            <p className="stat-value">72 bpm</p>
          </div>
        </div>
      </div>
      
      {/* Feature widgets */}
      <div className="widgets-section">
        <h2>Health Features</h2>
        <div className="widgets-container">
          {widgets.map(widget => (
            <Link 
              to={widget.link}
              key={widget.id}
              className="widget-card"
              data-color={widget.color}
            >
              <div className={`widget-icon ${widget.color}`}>
                {widget.icon}
              </div>
              <h3 className="widget-title">{widget.title}</h3>
              <p className="widget-description">{widget.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-card">
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon blue">
                <span>✓</span>
              </div>
              <div className="activity-content">
                <p className="activity-text">Completed daily water intake goal</p>
                <p className="activity-time">Today, 10:24 AM</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon pink">
                <span>⏰</span>
              </div>
              <div className="activity-content">
                <p className="activity-text">Medicine reminder set: Vitamin D</p>
                <p className="activity-time">Yesterday, 8:00 PM</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon green">
                <span>👁️</span>
              </div>
              <div className="activity-content">
                <p className="activity-text">Viewed morning workout routine</p>
                <p className="activity-time">Yesterday, 6:30 AM</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon orange">
                <span>🩺</span>
              </div>
              <div className="activity-content">
                <p className="activity-text">Scheduled doctor appointment</p>
                <p className="activity-time">April 8, 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add the Chatbot component */}
      <Chatbot />
    </div>
  );
}

export default DashboardHome;