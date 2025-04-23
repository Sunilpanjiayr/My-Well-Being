// src/components/layout/Footer.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/Footer.css';
// Import logo
import logo from '../layout/logo.png';

function Footer() {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Don't render footer on dashboard pages
  if (location.pathname.includes('/dashboard')) {
    return null;
  }
  
  return (
    <footer className={`site-footer ${darkMode ? 'dark' : ''}`}>
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-about">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="My Well Being Logo" />
              <span>My Well Being</span>
            </Link>
            
            <p className="footer-tagline">
              Your comprehensive platform for health tracking, medication management, and wellness optimization.
            </p>
            
            <div className="social-links">
              <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path>
                </svg>
              </a>
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" stroke="currentColor" fill="none"></rect>
                  <circle cx="12" cy="12" r="4" strokeWidth="2" stroke="currentColor" fill="none"></circle>
                  <circle cx="18" cy="6" r="1" fill="currentColor"></circle>
                </svg>
              </a>
              <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12" fill="currentColor"></rect>
                  <circle cx="4" cy="4" r="2" fill="currentColor"></circle>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="footer-links-section">
            <div className="footer-links-column">
              <h3>Company</h3>
              <Link to="/about" className="footer-link">About Us</Link>
              <Link to="/team" className="footer-link">Our Team</Link>
              <Link to="/careers" className="footer-link">Careers</Link>
              <Link to="/blog" className="footer-link">Blog</Link>
            </div>
            
           
            
            <div className="footer-links-column">
              <h3>Support</h3>
              <Link to="/help" className="footer-link">Help Center</Link>
              <Link to="/contact" className="footer-link">Contact Us</Link>
              <Link to="/faq" className="footer-link">FAQ</Link>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            </div>
          </div>
          
          <div className="footer-newsletter">
            <h3>Stay Updated</h3>
            <p className="footer-tagline">Subscribe to our newsletter for health tips and updates.</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="newsletter-input" 
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="newsletter-button">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} My Well Being. All rights reserved.
          </p>
          
          <div className="footer-badges">
            <span className="footer-badge">HIPAA Compliant</span>
            <span className="footer-badge">Doctor Approved</span>
            <span className="footer-badge">SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;