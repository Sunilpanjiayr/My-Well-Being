// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (err) {
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      setError('');
      // In a real app, this would be an API call
      // For now, we'll simulate a successful registration
      const userData = { id: Date.now(), name, email };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setCurrentUser(userData);
      
      return userData;
    } catch (err) {
      setError('Failed to register');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      // In a real app, this would be an API call
      // For now, we'll simulate a successful login
      const userData = { id: Date.now(), name: email.split('@')[0], email };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setCurrentUser(userData);
      
      return userData;
    } catch (err) {
      setError('Failed to login');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}