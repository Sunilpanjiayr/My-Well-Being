// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { darkMode } = useTheme();
  const { logout } = useAuth();

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
        <Link to="/dashboard" className="nav-link active">Dashboard</Link>
        <button className="logout-link" onClick={logout}>Log out</button>
        <button className="theme-toggle">
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;