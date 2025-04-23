// src/pages/RegisterPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// Import logo
import logo from '../components/layout/logo.png';
// Import CSS
import '../styles/AuthPages.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, error } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Password strength analyzer
  const analyzePasswordStrength = useCallback((pass) => {
    if (!pass) {
      return 0;
    }

    let strength = 0;
    // Length check
    if (pass.length >= 8) strength += 1;
    // Contains uppercase letter
    if (/[A-Z]/.test(pass)) strength += 1;
    // Contains lowercase letter
    if (/[a-z]/.test(pass)) strength += 1;
    // Contains number
    if (/[0-9]/.test(pass)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

    return strength;
  }, []);

  // Update password strength on password change
  useEffect(() => {
    setPasswordStrength(analyzePasswordStrength(password));
  }, [password, analyzePasswordStrength]);

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'var(--color-neutral)';
    if (passwordStrength <= 2) return 'var(--color-danger)';
    if (passwordStrength <= 4) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      errors.password = 'Please use a stronger password with mixed characters';
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    // Terms agreement validation
    if (!agreeTerms) {
      errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      // Redirect to onboarding or dashboard
      navigate('/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      setFormErrors({ 
        general: err.message || 'Failed to create an account. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="logo-link">
              <img src={logo} alt="My Well Being Logo" className="auth-logo" />
            </Link>
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Join thousands of users on their wellness journey</p>
          </div>
          
          {(error || formErrors.general) && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error || formErrors.general}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className={`form-input ${formErrors.name ? 'form-input-error' : ''}`}
                  autoComplete="name"
                />
              </div>
              {formErrors.name && <p className="form-error">{formErrors.name}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={`form-input ${formErrors.email ? 'form-input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {formErrors.email && <p className="form-error">{formErrors.email}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className={`form-input ${formErrors.password ? 'form-input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              
              {password && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div 
                      className="strength-meter-fill" 
                      style={{ 
                        backgroundColor: getStrengthColor(), 
                        width: `${(passwordStrength / 5) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthLabel()}
                  </span>
                </div>
              )}
              
              {formErrors.password && <p className="form-error">{formErrors.password}</p>}
              
              {password && !formErrors.password && (
                <div className="password-criteria">
                  <p className="password-criteria-title">Password requirements:</p>
                  <ul className="password-criteria-list">
                    <li className={password.length >= 8 ? 'criteria-met' : ''}>
                      {password.length >= 8 ? <span className="criteria-icon success">✓</span> : <span className="criteria-icon">✗</span>}
                      <span>At least 8 characters</span>
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'criteria-met' : ''}>
                      {/[A-Z]/.test(password) ? <span className="criteria-icon success">✓</span> : <span className="criteria-icon">✗</span>}
                      <span>One uppercase letter</span>
                    </li>
                    <li className={/[a-z]/.test(password) ? 'criteria-met' : ''}>
                      {/[a-z]/.test(password) ? <span className="criteria-icon success">✓</span> : <span className="criteria-icon">✗</span>}
                      <span>One lowercase letter</span>
                    </li>
                    <li className={/[0-9]/.test(password) ? 'criteria-met' : ''}>
                      {/[0-9]/.test(password) ? <span className="criteria-icon success">✓</span> : <span className="criteria-icon">✗</span>}
                      <span>One number</span>
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? 'criteria-met' : ''}>
                      {/[^A-Za-z0-9]/.test(password) ? <span className="criteria-icon success">✓</span> : <span className="criteria-icon">✗</span>}
                      <span>One special character</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className={`form-input ${formErrors.confirmPassword ? 'form-input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="form-error">{formErrors.confirmPassword}</p>
              )}
            </div>
            
            <div className={`terms-agreement ${formErrors.terms ? 'terms-error' : ''}`}>
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="agreeTerms" 
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                  className="terms-checkbox" 
                />
                <span className="checkbox-label">
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </span>
              </label>
              {formErrors.terms && <p className="form-error">{formErrors.terms}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`auth-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="social-auth">
            <div className="social-divider">
              <div className="social-divider-line"></div>
              <span className="social-divider-text">or sign up with</span>
              <div className="social-divider-line"></div>
            </div>
            <div className="social-buttons">
              <button className="social-button">
                <span className="social-icon social-icon-google">G</span>
                <span>Google</span>
              </button>
              <button className="social-button">
                <span className="social-icon social-icon-apple">A</span>
                <span>Apple</span>
              </button>
            </div>
          </div>
          
          <p className="auth-link">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;