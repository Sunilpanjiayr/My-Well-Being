// src/components/common/CustomRouteLink.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// You can import icons from a library like react-icons or create your own
// For example: import { FaWater, FaRunning, etc. } from 'react-icons/fa';

const getIconForPath = (path) => {
  // This would normally return an icon component based on the path
  // For now, we'll return a simple placeholder
  return <span className="route-icon">•</span>;
};

const CustomRouteLink = ({ path, label, isActive = false }) => {
  const { darkMode } = useTheme();
  const icon = getIconForPath(path);
  
  return (
    <Link 
      to={`/dashboard/${path}`} 
      className={`custom-route ${isActive ? 'active' : ''} ${darkMode ? 'dark' : ''}`}
    >
      <div className="route-content">
        {icon}
        <span className="route-label">{label}</span>
      </div>
    </Link>
  );
};

export default CustomRouteLink;