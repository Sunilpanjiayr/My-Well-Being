// src/components/common/ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../Auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function ProtectedRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    // You can replace this with a loading spinner component
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;