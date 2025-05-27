// src/components/common/DoctorProtectedRoute.js
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../Auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const DoctorProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Check if the user is a healthcare professional
            const doctorRef = doc(db, 'doctors', user.uid);
            const doctorSnap = await getDoc(doctorRef);
            
            if (doctorSnap.exists()) {
              // User is a doctor
              setIsAuthenticated(true);
              setIsDoctor(true);
            } else {
              // User is authenticated but not a doctor
              setIsAuthenticated(true);
              setIsDoctor(false);
            }
          } else {
            // User is not authenticated
            setIsAuthenticated(false);
            setIsDoctor(false);
          }
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error in doctor protected route:", error);
        setIsAuthenticated(false);
        setIsDoctor(false);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (loading) {
    // While checking authentication, show a loading indicator
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // If not authenticated, redirect to doctor login page
    return <Navigate to="/doctor-login" replace />;
  }
  
  if (!isDoctor) {
    // If authenticated but not a doctor, redirect to patient dashboard
    // This prevents regular patients from accessing doctor routes
    return <Navigate to="/dashboardHome" replace />;
  }
  
  // If doctor is authenticated, render the protected content
  return children;
};

export default DoctorProtectedRoute;