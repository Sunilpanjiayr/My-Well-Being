// src/components/features/dashboard/DashboardHome.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import Chatbot from '../chatbot/Chatbot'; // Import the Chatbot component
import '../../../styles/DashboardHome.css';

function DashboardHome() {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  
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
      <div className="dashboard-welcome">
        <h1>Welcome back, {currentUser?.name || 'User'}</h1>
        <p>
          Track your health metrics, set reminders, and achieve your wellness goals.
        </p>
      </div>
      
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