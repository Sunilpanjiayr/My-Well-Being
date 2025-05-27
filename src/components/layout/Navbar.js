// src/components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { auth } from '../Auth/firebase'; // Adjust path as needed
import { signOut } from 'firebase/auth';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

    useEffect(() => {
    // Get current user's display name if available
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email || user.phoneNumber || 'User');
    } else {
      // If no user is logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : ''}`}>
      <div className="navbar-brand">
        <div className="logo">
          <span className="logo-icon">💚</span>
          <h1>My Well Being</h1>
        </div>
      </div>
      
           <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/features" className="nav-link">Features</Link>
        <Link to="/dashboardHome" className="nav-link active">Dashboard</Link>
        <button className="logout-link" onClick={handleLogout}>Log out</button>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;