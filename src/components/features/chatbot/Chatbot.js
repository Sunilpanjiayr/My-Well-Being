import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './Chatbot.css';

/**
 * Dr. Health - Advanced AI Health Assistant
 * 
 * A comprehensive AI-powered medical assistant chatbot with advanced natural language processing capabilities,
 * intelligent context awareness, personalized health guidance, and enhanced user experience features.
 * 
 * Features:
 * - Natural Language Understanding with medical terminology comprehension
 * - Symptom analysis and preliminary assessment
 * - Personalized health information based on user profile
 * - Context-aware conversation memory
 * - Emergency situation detection with prioritized responses
 * - Accessibility optimizations (screen reader support, high contrast mode, text sizing)
 * - Voice input and speech output capabilities
 * - Rich UI with dynamic health cards, suggested queries, and interactive elements
 * - Multi-language support for international users
 * - Export chat history for sharing with healthcare providers
 * - Location-based healthcare provider recommendations
 * - Medication reminders and scheduling assistant
 */
// ====================================================================================
// MEDICAL THEMED ICON COMPONENTS
// ====================================================================================

const Icons = {
  // Main Chat Icon (with professional medical styling)
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#0065A3" strokeWidth="1.5" fill="#e6f7ff" />
      <path 
        d="M12 6V4M12 4C10.8954 4 10 4.89543 10 6V8C10 9.10457 10.8954 10 12 10C13.1046 10 14 9.10457 14 8V6C14 4.89543 13.1046 4 12 4Z" 
        stroke="#0065A3" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M8 10H16M12 10V16M12 19V16M16 16H8" 
        stroke="#0065A3" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="18" cy="6" r="2.5" fill="#E53935" stroke="white" strokeWidth="0.5" />
      <path d="M18.8 4.5l-1.6 3M17.2 4.5l1.6 3" stroke="white" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  ),

  // UI Icons - Medical themed and professional
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 2L11 13" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Clear: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 6H21M5 6V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 6L6 18" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6L18 18" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  // Doctor icon for the AI Assistant
  Assistant: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#E3F2FD" stroke="#0065A3" strokeWidth="1.5" />
      <path d="M8 14C8 14 9 16 12 16C15 16 16 14 16 14" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1" fill="#0065A3" />
      <circle cx="15" cy="10" r="1" fill="#0065A3" />
      <path d="M12 6C10 6 9.5 7 9.5 7.5" stroke="#0065A3" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 6C14 6 14.5 7 14.5 7.5" stroke="#0065A3" strokeWidth="1" strokeLinecap="round" />
      <path d="M10 17.5C10 17.5 10.5 19 12 19C13.5 19 14 17.5 14 17.5" stroke="#0065A3" strokeWidth="1" strokeLinecap="round" />
      <path d="M9 7.5V9" stroke="#0065A3" strokeWidth="1" strokeLinecap="round" />
      <path d="M15 7.5V9" stroke="#0065A3" strokeWidth="1" strokeLinecap="round" />
      <path d="M8 13.5c0-2.5 2-4.5 4-4.5s4 2 4 4.5" stroke="#0065A3" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  
  // Patient icon for the User
  User: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#f0f4f8" stroke="#5A67D8" strokeWidth="1.5" />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="#E8EDFB" stroke="#5A67D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 21V19C18 16.7909 15.3137 15 12 15C8.68629 15 6 16.7909 6 19V21" fill="#E8EDFB" stroke="#5A67D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  // Emergency icon with clear medical styling
  Emergency: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fed7d7"/>
      <path d="M12 8V12" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 16H12.01" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.93 19.07L19.07 4.93" stroke="#e53e3e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  // Medical themed heart icon
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20.84 4.61C20.3336 4.1017 19.7372 3.69545 19.0871 3.4188C18.437 3.14215 17.7439 3 17.0423 3C16.3407 3 15.6476 3.14215 14.9975 3.4188C14.3474 3.69545 13.751 4.1017 13.2447 4.61L12.0001 5.86L10.7554 4.61C9.7307 3.58107 8.3444 3.00001 6.9578 3.00001C5.5712 3.00001 4.1849 3.58107 3.1602 4.61C2.1355 5.63894 1.5579 7.03332 1.5579 8.42C1.5579 9.80667 2.1355 11.2011 3.1602 12.23L4.4049 13.48L12.0001 21.09L19.5953 13.48L20.84 12.23C21.3483 11.7237 21.7545 11.1272 22.0312 10.4771C22.3078 9.82698 22.45 9.1339 22.45 8.43225C22.45 7.7306 22.3078 7.03752 22.0312 6.38743C21.7545 5.73734 21.3483 5.14086 20.84 4.63452V4.61Z" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#fed7d7"/>
      <path d="M9 15C9 15 10 17 12 17C14 17 15 15 15 15" stroke="#e53e3e" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  
  // Medical information icon
  Info: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#ebf8ff"/>
      <line x1="12" y1="16" x2="12" y2="12" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="8" x2="12.01" y2="8" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7V4" stroke="#4299e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 20V17" stroke="#4299e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  // Medical settings icon
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 5H7" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 3V7" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 5H21" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 9H21" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 7V11" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 12H7" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 19H7" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 17V21" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 19H21" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="5" r="2" stroke="#0065A3" strokeWidth="1.5"/>
      <circle cx="11" cy="19" r="2" stroke="#0065A3" strokeWidth="1.5"/>
      <circle cx="19" cy="12" r="2" stroke="#0065A3" strokeWidth="1.5"/>
    </svg>
  ),
  
  // Accessibility icon with medical theme
  Accessibility: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#805AD5" strokeWidth="1.5"/>
      <circle cx="12" cy="7" r="2" fill="#805AD5"/>
      <path d="M10 14H14M12 10V18" stroke="#805AD5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 9H5" stroke="#805AD5" strokeWidth="1" strokeLinecap="round"/>
      <path d="M19 9H17" stroke="#805AD5" strokeWidth="1" strokeLinecap="round"/>
      <path d="M7 15H5" stroke="#805AD5" strokeWidth="1" strokeLinecap="round"/>
      <path d="M19 15H17" stroke="#805AD5" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  
  // Voice input icon with medical styling
  Voice: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="#0065A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 7h6M9 11h6" stroke="#0065A3" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  
  // AI Brain icon with medical certification styling
  AIBrain: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#e6f7ff"/>
      <path d="M8 14C9.10457 14 10 13.1046 10 12C10 10.8954 9.10457 10 8 10C6.89543 10 6 10.8954 6 12C6 13.1046 6.89543 14 8 14Z" fill="#0065A3"/>
      <path d="M16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14Z" fill="#0065A3"/>
      <path d="M7 17C9 19 15 19 17 17" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 7L12 10L15 7" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2C12 2 14 5 12 7" stroke="#0065A3" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 22C12 22 10 19 12 17" stroke="#0065A3" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  
  // Medical certificate icon for verified medical information
  Certificate: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="#0065A3" strokeWidth="1.5" fill="#e6f7ff"/>
      <path d="M12 8v8M8 12h8" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 3v2M18 3v2" stroke="#0065A3" strokeWidth="1" strokeLinecap="round"/>
      <path d="M9.5 15.5L8 17M14.5 15.5L16 17" stroke="#0065A3" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  
  // New pulse icon for health monitoring
  Pulse: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 12h-4l-3-9-4 18-3-9H2" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="9" stroke="#0065A3" strokeWidth="1" strokeDasharray="2 2" fill="none"/>
    </svg>
  ),
  
  // New stethoscope icon for medical consultation
  Stethoscope: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.5 12V16C4.5 18.4853 6.51472 20.5 9 20.5C11.4853 20.5 13.5 18.4853 13.5 16V12" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 20.5H13C15.4853 20.5 17.5 18.4853 17.5 16V12" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.5 13V3.5H13.5V13" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17.5" cy="10" r="2" stroke="#0065A3" strokeWidth="1.5"/>
      <path d="M9 3.5V7.5" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  
  // New clipboard icon for medical records
  Clipboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="8" y="2" width="8" height="4" rx="1" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10h8M8 14h8M8 18h5" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  
  // New export icon for sharing medical records
  Export: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 12H6C4.89543 12 4 12.8954 4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14C20 12.8954 19.1046 12 18 12H16" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // New language icon for multilingual support
  Language: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#e6f7ff"/>
      <path d="M2 12H22" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // New reminder icon for medication scheduling
  Reminder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#e6f7ff"/>
      <path d="M12 6V12L16 14" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 3L3 5" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 3L21 5" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17H15" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // New location icon for healthcare provider recommendations
  Location: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#e6f7ff"/>
      <circle cx="12" cy="10" r="3" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // New heartbeat icon for health monitoring
  Heartbeat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2"/>
    </svg>
  )
};
// ====================================================================================
// DR. HEALTH NATURAL LANGUAGE PROCESSING MODULE
// ====================================================================================

const DrHealth = {
  // Comprehensive medical entity recognition
  extractEntities: (text) => {
    // Initialize the entity structure
    const entities = {
      symptoms: [],
      conditions: [],
      bodyParts: [],
      medications: [],
      demographics: { age: null, gender: null },
      vitals: { temperature: null, bloodPressure: null, heartRate: null, respiratoryRate: null },
      urgency: 'normal',
      lifestyle: {
        diet: null,
        exercise: null,
        smoking: null,
        alcohol: null
      },
      timing: {
        onset: null,
        duration: null,
        frequency: null,
        pattern: null
      },
      // New fields for enhanced functionality
      allergies: [],
      familyHistory: [],
      proceduresHistory: [],
      location: null,
      preferredLanguage: null,
      insuranceInfo: null
    };
    
    // Comprehensive medical dictionaries
    const symptomsDict = [
      // Pain symptoms
      'pain', 'ache', 'soreness', 'discomfort', 'burning', 'stabbing', 'throbbing', 'cramping', 'tenderness',
      // Respiratory symptoms
      'cough', 'shortness of breath', 'difficulty breathing', 'wheezing', 'congestion', 
      // General symptoms
      'fever', 'chills', 'fatigue', 'weakness', 'tired', 'exhausted', 'dizzy', 'dizziness', 'fainting',
      'headache', 'migraine', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating',
      // Skin symptoms
      'rash', 'itching', 'swelling', 'hives', 'bruising', 'discoloration',
      // Neurological symptoms
      'numbness', 'tingling', 'paralysis', 'tremor', 'seizure', 'confusion', 'memory loss',
      // Cardiovascular symptoms
      'chest pain', 'palpitations', 'irregular heartbeat', 'rapid heartbeat',
      // Urinary symptoms
      'frequent urination', 'painful urination', 'blood in urine', 'incontinence',
      // Mental health symptoms
      'anxiety', 'depression', 'panic attack', 'stress', 'mood swings', 'insomnia', 'suicidal thoughts',
      // Sensory symptoms
      'blurred vision', 'double vision', 'hearing loss', 'ringing in ears', 'loss of taste', 'loss of smell',
      // Additional symptoms
      'weight loss', 'weight gain', 'loss of appetite', 'increased appetite', 'night sweats', 'snoring',
      'sleepwalking', 'hair loss', 'brittle nails', 'dry skin', 'excessive thirst', 'frequent infections',
      'delayed healing', 'muscle cramps', 'joint stiffness', 'back pain', 'neck pain', 'shoulder pain',
      'knee pain', 'hip pain', 'elbow pain', 'wrist pain', 'ankle pain', 'foot pain', 'chest tightness',
      'difficulty swallowing', 'hoarseness', 'coughing up blood', 'bloody stool', 'dark urine',
      'excessive urination', 'reduced urination', 'runny nose', 'stuffy nose', 'sore throat',
      'skin lesions', 'mole changes', 'balance problems', 'coordination issues', 'speech problems'
    ];
    
    const conditionsDict = [
      // Common conditions
      'diabetes', 'hypertension', 'high blood pressure', 'asthma', 'copd', 'heart disease', 'arthritis',
      'migraine', 'allergies', 'flu', 'common cold', 'covid', 'pneumonia', 'bronchitis',
      // Chronic conditions
      'cancer', 'multiple sclerosis', 'parkinsons', 'alzheimers', 'chronic fatigue', 'fibromyalgia',
      'irritable bowel syndrome', 'crohns disease', 'ulcerative colitis', 'lupus', 'psoriasis', 'eczema',
      // Mental health conditions
      'depression', 'anxiety disorder', 'bipolar disorder', 'schizophrenia', 'ptsd', 'adhd', 'ocd',
      // Cardiovascular conditions
      'coronary artery disease', 'arrhythmia', 'heart failure', 'stroke', 'aneurysm', 'heart attack',
      'angina', 'atherosclerosis', 'peripheral artery disease', 'deep vein thrombosis', 'varicose veins',
      // Infectious diseases
      'influenza', 'covid-19', 'bacterial infection', 'viral infection', 'strep throat', 'tuberculosis',
      'HIV', 'AIDS', 'hepatitis', 'meningitis', 'malaria', 'zika', 'dengue', 'lyme disease',
      // Respiratory conditions
      'asthma', 'copd', 'emphysema', 'pulmonary fibrosis', 'cystic fibrosis', 'pneumonia',
      'bronchitis', 'sinusitis', 'rhinitis', 'sleep apnea', 'pulmonary hypertension',
      // Gastrointestinal conditions
      'GERD', 'peptic ulcer', 'irritable bowel syndrome', 'crohn\'s disease', 'ulcerative colitis',
      'gallstones', 'pancreatitis', 'celiac disease', 'diverticulitis', 'hemorrhoids',
      // Endocrine conditions
      'hypothyroidism', 'hyperthyroidism', 'diabetes', 'polycystic ovary syndrome', 'adrenal insufficiency',
      'cushing\'s syndrome', 'hyperparathyroidism', 'hypoparathyroidism',
      // Musculoskeletal conditions
      'osteoarthritis', 'rheumatoid arthritis', 'osteoporosis', 'gout', 'bursitis', 'tendinitis',
      'carpal tunnel syndrome', 'sciatica', 'herniated disc', 'fibromyalgia', 'ankylosing spondylitis',
      // Neurological conditions
      'migraine', 'epilepsy', 'multiple sclerosis', 'parkinson\'s disease', 'alzheimer\'s disease',
      'huntington\'s disease', 'amyotrophic lateral sclerosis', 'bell\'s palsy', 'myasthenia gravis',
      // Other conditions
      'obesity', 'sleep apnea', 'thyroid disorder', 'anemia', 'osteoporosis', 'gerd'
    ];
    
    const bodyPartsDict = [
      // Head and neck
      'head', 'scalp', 'face', 'forehead', 'eye', 'eyes', 'ear', 'ears', 'nose', 'mouth', 'lips',
      'tongue', 'teeth', 'throat', 'neck', 'jaw',
      // Torso
      'chest', 'breast', 'ribs', 'abdomen', 'stomach', 'back', 'lower back', 'spine', 'waist', 
      'shoulder', 'shoulders', 'armpit',
      // Upper extremities
      'arm', 'arms', 'elbow', 'elbows', 'wrist', 'wrists', 'hand', 'hands', 'finger', 'fingers', 'thumb',
      // Lower extremities
      'hip', 'hips', 'leg', 'legs', 'thigh', 'thighs', 'knee', 'knees', 'ankle', 'ankles', 'foot', 'feet',
      'toe', 'toes', 'heel', 'heels',
      // Internal organs
      'heart', 'lung', 'lungs', 'liver', 'kidney', 'kidneys', 'bladder', 'intestine', 'intestines',
      'colon', 'brain', 'muscle', 'muscles', 'bone', 'bones', 'joint', 'joints', 'skin',
      'blood vessel', 'artery', 'vein', 'lymph node',
      // Specific internal organs
      'esophagus', 'stomach', 'small intestine', 'large intestine', 'pancreas', 'gallbladder', 'spleen',
      'thyroid', 'adrenal gland', 'pituitary gland', 'ovary', 'ovaries', 'uterus', 'vagina', 'cervix',
      'testis', 'testes', 'prostate', 'penis', 'retina', 'cornea', 'trachea', 'bronchi', 'diaphragm',
      // Additional body parts
      'forehead', 'temples', 'cheek', 'cheeks', 'eyebrow', 'eyebrows', 'eyelid', 'eyelids',
      'earlobe', 'earlobes', 'nostril', 'nostrils', 'gums', 'palate', 'uvula', 'tonsil', 'tonsils',
      'larynx', 'vocal cords', 'collarbone', 'clavicle', 'sternum', 'rib cage', 'breastbone', 
      'navel', 'bellybutton', 'groin', 'buttocks', 'tailbone', 'coccyx', 'forearm', 'bicep', 'tricep',
      'knuckle', 'knuckles', 'fingernail', 'fingernails', 'palm', 'palms', 'shin', 'calf', 'calves',
      'achilles tendon', 'hamstring', 'quadriceps', 'toenail', 'toenails', 'sole', 'soles'
    ];
    
    const medicationsDict = [
      // Pain medications
      'aspirin', 'ibuprofen', 'tylenol', 'acetaminophen', 'naproxen', 'advil', 'motrin', 'aleve',
      'paracetamol', 'codeine', 'oxycodone', 'hydrocodone', 'tramadol',
      // Cardiovascular medications
      'lisinopril', 'metoprolol', 'atenolol', 'amlodipine', 'atorvastatin', 'simvastatin', 'warfarin', 
      'clopidogrel', 'aspirin', 'nitroglycerin', 'losartan', 'valsartan', 'carvedilol', 'digoxin',
      'furosemide', 'hydrochlorothiazide', 'spironolactone', 'amiodarone', 'diltiazem', 'verapamil',
      // Respiratory medications
      'albuterol', 'fluticasone', 'montelukast', 'prednisone', 'loratadine', 'cetirizine',
      'ipratropium', 'tiotropium', 'budesonide', 'formoterol', 'salmeterol', 'theophylline',
      // Gastrointestinal medications
      'omeprazole', 'ranitidine', 'famotidine', 'pepto bismol', 'loperamide', 'simethicone',
      'esomeprazole', 'pantoprazole', 'lansoprazole', 'ondansetron', 'metoclopramide', 'docusate',
      // Antibiotics
      'amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline', 'penicillin', 'antibiotic',
      'cephalexin', 'trimethoprim', 'sulfamethoxazole', 'metronidazole', 'clindamycin', 'vancomycin',
      // Mental health medications
      'sertraline', 'fluoxetine', 'escitalopram', 'bupropion', 'alprazolam', 'lorazepam', 'antidepressant',
      'anti-anxiety', 'benzodiazepine', 'venlafaxine', 'duloxetine', 'paroxetine', 'citalopram',
      'trazodone', 'mirtazapine', 'lithium', 'lamotrigine', 'quetiapine', 'risperidone', 'olanzapine',
      // Diabetes medications
      'metformin', 'insulin', 'glipizide', 'glyburide', 'glimepiride', 'pioglitazone', 'sitagliptin',
      'empagliflozin', 'canagliflozin', 'liraglutide', 'dulaglutide', 'semaglutide',
      // Anticoagulants and antiplatelets
      'warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'clopidogrel', 'prasugrel',
      'ticagrelor', 'dipyridamole', 'heparin', 'enoxaparin',
      // Thyroid medications
      'levothyroxine', 'liothyronine', 'methimazole', 'propylthiouracil',
      // Corticosteroids
      'prednisone', 'prednisolone', 'methylprednisolone', 'dexamethasone', 'hydrocortisone',
      'triamcinolone', 'fluticasone', 'budesonide', 'beclomethasone',
      // Other medications
      'antihistamine', 'corticosteroid', 'multivitamin', 'supplement', 'medication', 'prescription',
      'pill', 'capsule', 'tablet', 'injection', 'inhaler', 'patch', 'cream', 'ointment'
    ];
    
    const emergencyKeywords = [
      // Critical symptoms
      'emergency', 'severe', 'extreme', 'unbearable', 'worst', 'excruciating',
      // Emergency actions
      'call 911', 'call ambulance', 'go to hospital', 'go to ER', 'emergency room',
      // Life-threatening conditions
      'stroke', 'heart attack', 'seizure', 'unconscious', 'not breathing', 'difficulty breathing',
      'anaphylaxis', 'allergic reaction', 'bleeding heavily', 'cannot stop bleeding',
      // Urgent language
      'help', 'urgent', 'immediately', 'right now', 'critical'
    ];
    
    // Normalize text for processing
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\W+/);
    
    // Extract entities using advanced pattern matching
    
    // 1. Extract symptoms with context
    for (const symptom of symptomsDict) {
      if (lowerText.includes(symptom)) {
        // Check for negation patterns - "no headache", "don't have pain", etc.
        const negationPattern = new RegExp(`(no|not|don'?t have|without|absence of|free from|negative for)\\s+(?:\\w+\\s+){0,3}${symptom}`, 'i');
        if (!negationPattern.test(lowerText)) {
          // Check for severity modifiers
          const severePattern = new RegExp(`(severe|intense|extreme|worst|unbearable|excruciating)\\s+(?:\\w+\\s+){0,2}${symptom}`, 'i');
          const moderatePattern = new RegExp(`(moderate|significant|substantial)\\s+(?:\\w+\\s+){0,2}${symptom}`, 'i');
          const mildPattern = new RegExp(`(mild|slight|minor|little)\\s+(?:\\w+\\s+){0,2}${symptom}`, 'i');
          
          let symptomWithSeverity = symptom;
          
          if (severePattern.test(lowerText)) {
            symptomWithSeverity = `severe ${symptom}`;
            // Update urgency if severe symptom detected
            if (entities.urgency === 'normal') entities.urgency = 'high';
          } else if (moderatePattern.test(lowerText)) {
            symptomWithSeverity = `moderate ${symptom}`;
          } else if (mildPattern.test(lowerText)) {
            symptomWithSeverity = `mild ${symptom}`;
          }
          
          if (!entities.symptoms.some(s => s.includes(symptom))) {
            entities.symptoms.push(symptomWithSeverity);
          }
        }
      }
    }
    
    // 2. Extract medical conditions with context
    for (const condition of conditionsDict) {
      if (lowerText.includes(condition)) {
        // Check for context: diagnosed, history of, suspected, etc.
        const diagnosedPattern = new RegExp(`(diagnosed|confirmed|have|suffering from)\\s+(?:\\w+\\s+){0,3}${condition}`, 'i');
        const historicalPattern = new RegExp(`(history|had|previous|past)\\s+(?:\\w+\\s+){0,3}${condition}`, 'i');
        const suspectedPattern = new RegExp(`(suspect|possible|might have|could be|think I have)\\s+(?:\\w+\\s+){0,3}${condition}`, 'i');
        const familyPattern = new RegExp(`(family|parent|mother|father|sibling|brother|sister|grandparent)\\s+(?:\\w+\\s+){0,5}${condition}`, 'i');
        
        let conditionWithContext = condition;
        
        if (diagnosedPattern.test(lowerText)) {
          conditionWithContext = `diagnosed ${condition}`;
        } else if (historicalPattern.test(lowerText)) {
          conditionWithContext = `history of ${condition}`;
        } else if (suspectedPattern.test(lowerText)) {
          conditionWithContext = `suspected ${condition}`;
        } else if (familyPattern.test(lowerText)) {
          // Add to family history instead of personal conditions
          const familyMatch = lowerText.match(familyPattern);
          if (familyMatch && !entities.familyHistory.some(f => f.includes(condition))) {
            entities.familyHistory.push(`${familyMatch[1]} history of ${condition}`);
          }
          continue; // Skip adding to conditions since it's family history
        }
        
        if (!entities.conditions.some(c => c.includes(condition))) {
          entities.conditions.push(conditionWithContext);
        }
      }
    }
    
    // 3. Extract body parts
    for (const bodyPart of bodyPartsDict) {
      if (lowerText.includes(bodyPart) && !entities.bodyParts.includes(bodyPart)) {
        entities.bodyParts.push(bodyPart);
      }
    }
    
    // 4. Extract medications with dosage and frequency if available
    for (const medication of medicationsDict) {
      if (lowerText.includes(medication)) {
        // Check for dosage pattern
        const dosagePattern = new RegExp(`${medication}\\s+(?:\\w+\\s+){0,3}(\\d+)\\s*(mg|mcg|ml|g)`, 'i');
        const dosageMatch = lowerText.match(dosagePattern);
        
        // Check for frequency pattern
        const frequencyPattern = new RegExp(`${medication}\\s+(?:\\w+\\s+){0,5}(once|twice|three times|\\d+\\s+times)\\s+(?:a|per|every)\\s+(day|daily|week|month)`, 'i');
        const frequencyMatch = lowerText.match(frequencyPattern);
        
        let medicationWithContext = medication;
        
        if (dosageMatch && frequencyMatch) {
          medicationWithContext = `${medication} ${dosageMatch[1]}${dosageMatch[2]} ${frequencyMatch[1]} ${frequencyMatch[2]}`;
        } else if (dosageMatch) {
          medicationWithContext = `${medication} ${dosageMatch[1]}${dosageMatch[2]}`;
        } else if (frequencyMatch) {
          medicationWithContext = `${medication} ${frequencyMatch[1]} ${frequencyMatch[2]}`;
        }
        
        if (!entities.medications.some(m => m.includes(medication))) {
          entities.medications.push(medicationWithContext);
        }
      }
    }
    
    // 5. Extract demographic information
    
    // Age detection with various patterns
    const agePatterns = [
      /\b(\d+)[ -]*(year|yr|years|yo|y\.o\.|y\/o)\s*(old)?\b/i,  // Standard format: 35 years old
      /\b(I am|I'm)\s+(\d+)(\s+years?\s+old)?\b/i,               // First person: I am 42
      /\bage\s+(?:is|of)\s+(\d+)\b/i,                           // Age statement: age is 29
      /\b(\d+)[ -]*(month|week|day)s?\s+old\b/i                 // Infant age: 6 months old
    ];
    
    for (const pattern of agePatterns) {
      const ageMatch = lowerText.match(pattern);
      if (ageMatch) {
        // Extract the age value from the appropriate capture group
        const ageValue = pattern === agePatterns[1] ? ageMatch[2] : ageMatch[1];
        entities.demographics.age = parseInt(ageValue);
        break;
      }
    }
    
    // Gender detection with comprehensive patterns
    if (/\b(male|man|boy|gentleman|father|son|husband|m)\b/i.test(lowerText) && 
        !/\b(female|woman|girl|lady|mother|daughter|wife|f)\b/i.test(lowerText)) {
      entities.demographics.gender = 'male';
    } else if (/\b(female|woman|girl|lady|mother|daughter|wife|f)\b/i.test(lowerText) && 
              !/\b(male|man|boy|gentleman|father|son|husband|m)\b/i.test(lowerText)) {
      entities.demographics.gender = 'female';
    } else if (/\b(non-binary|nonbinary|enby|genderfluid|genderqueer|transgender|nb)\b/i.test(lowerText)) {
      entities.demographics.gender = 'non-binary';
    }
    
    // 6. Extract vital signs if mentioned
    
    // Temperature
    const tempPattern = /(temperature|temp|fever) of (\d+\.?\d*)( degrees| °[CF])?/i;
    const tempMatch = lowerText.match(tempPattern);
    if (tempMatch) {
      entities.vitals.temperature = parseFloat(tempMatch[2]);
    }
    
    // Blood pressure
    const bpPattern = /(blood pressure|bp) (of|is|was) (\d+)\/(\d+)/i;
    const bpMatch = lowerText.match(bpPattern);
    if (bpMatch) {
      entities.vitals.bloodPressure = {
        systolic: parseInt(bpMatch[3]),
        diastolic: parseInt(bpMatch[4])
      };
    }
    
    // Heart rate
    const hrPattern = /(heart rate|pulse|hr) (of|is|was) (\d+)/i;
    const hrMatch = lowerText.match(hrPattern);
    if (hrMatch) {
      entities.vitals.heartRate = parseInt(hrMatch[3]);
    }
    
    // Respiratory rate
    const rrPattern = /(respiratory rate|breathing rate|respiration|breaths per minute) (of|is|was) (\d+)/i;
    const rrMatch = lowerText.match(rrPattern);
    if (rrMatch) {
      entities.vitals.respiratoryRate = parseInt(rrMatch[3]);
    }
    
    // 7. Extract lifestyle factors
    
    // Diet patterns
    if (/\b(vegetarian|vegan|pescatarian|keto|ketogenic|paleo|mediterranean|gluten[- ]free|dairy[- ]free)\b/i.test(lowerText)) {
      const dietMatch = lowerText.match(/\b(vegetarian|vegan|pescatarian|keto|ketogenic|paleo|mediterranean|gluten[- ]free|dairy[- ]free)\b/i);
      entities.lifestyle.diet = dietMatch[1].toLowerCase();
    }
    
    // Exercise patterns
    if (/\b(exercise|work ?out|run|jog|swim|yoga|gym)\b/i.test(lowerText)) {
      // Check for frequency
      const exerciseFrequencyPattern = /\b(exercise|work ?out|run|jog|swim|yoga|gym)\s+(?:\w+\s+){0,3}(daily|every day|(\d+) times a week|once a week|rarely|never)\b/i;
      const exerciseFrequencyMatch = lowerText.match(exerciseFrequencyPattern);
      
      if (exerciseFrequencyMatch) {
        entities.lifestyle.exercise = exerciseFrequencyMatch[2].toLowerCase();
      } else {
        entities.lifestyle.exercise = 'mentioned';
      }
    }
    
    // Smoking patterns
    if (/\b(smok(e|ing)|cigarette|tobacco)\b/i.test(lowerText)) {
      if (/\b(don't smoke|do not smoke|non[- ]smoker|never smoked)\b/i.test(lowerText)) {
        entities.lifestyle.smoking = 'non-smoker';
      } else if (/\b(former smoker|quit smoking|stopped smoking|used to smoke)\b/i.test(lowerText)) {
        entities.lifestyle.smoking = 'former smoker';
      } else {
        entities.lifestyle.smoking = 'smoker';
      }
    }
    
    // Alcohol patterns
    if (/\b(alcohol|drink|drinking|beer|wine|liquor)\b/i.test(lowerText)) {
      if (/\b(don't drink|do not drink|non[- ]drinker|never drink|abstain)\b/i.test(lowerText)) {
        entities.lifestyle.alcohol = 'non-drinker';
      } else if (/\b(occasional|socially|sometimes|rarely)\s+(?:\w+\s+){0,3}(drink|alcohol)\b/i.test(lowerText)) {
        entities.lifestyle.alcohol = 'occasional drinker';
      } else if (/\b(moderate|weekly|few times)\s+(?:\w+\s+){0,3}(drink|alcohol)\b/i.test(lowerText)) {
        entities.lifestyle.alcohol = 'moderate drinker';
      } else if (/\b(heavy|daily|frequent|problem|too much)\s+(?:\w+\s+){0,3}(drink|alcohol)\b/i.test(lowerText)) {
        entities.lifestyle.alcohol = 'heavy drinker';
      } else {
        entities.lifestyle.alcohol = 'drinker';
      }
    }
    
    // 8. Extract timing information
    
    // Onset patterns
    const onsetPatterns = [
      /\bstarted\s+(?:\w+\s+){0,3}(today|yesterday|last night|this morning|(\d+)\s+(hour|day|week|month|year)s? ago)\b/i,
      /\bbegan\s+(?:\w+\s+){0,3}(today|yesterday|last night|this morning|(\d+)\s+(hour|day|week|month|year)s? ago)\b/i,
      /\bnoted\s+(?:\w+\s+){0,3}(today|yesterday|last night|this morning|(\d+)\s+(hour|day|week|month|year)s? ago)\b/i,
      /\bfirst\s+(?:\w+\s+){0,3}(today|yesterday|last night|this morning|(\d+)\s+(hour|day|week|month|year)s? ago)\b/i
    ];
    
    for (const pattern of onsetPatterns) {
      const onsetMatch = lowerText.match(pattern);
      if (onsetMatch) {
        entities.timing.onset = onsetMatch[1];
        break;
      }
    }
    
    // Duration patterns
    const durationPatterns = [
      /\b(lasted|has been|been going|continuing|persisting)(?:\s+\w+){0,3}\s+for\s+(\d+)\s+(minute|hour|day|week|month|year)s?\b/i,
      /\bfor\s+(\d+)\s+(minute|hour|day|week|month|year)s?\b/i,
      /\bsince\s+(yesterday|last night|last week|last month|(\d+)\s+(hour|day|week|month|year)s? ago)\b/i
    ];
    
    for (const pattern of durationPatterns) {
      const durationMatch = lowerText.match(pattern);
      if (durationMatch) {
        if (pattern === durationPatterns[0]) {
          entities.timing.duration = `${durationMatch[2]} ${durationMatch[3]}`;
        } else if (pattern === durationPatterns[1]) {
          entities.timing.duration = `${durationMatch[1]} ${durationMatch[2]}`;
        } else {
          entities.timing.duration = durationMatch[1];
        }
        break;
      }
    }
    
    // Frequency patterns
    const frequencyPatterns = [
      /\b(happens|occurs|comes|returns)\s+(?:\w+\s+){0,3}(constantly|continuously|intermittently|occasionally|rarely|(\d+)\s+times\s+(a day|daily|a week|weekly|a month|monthly))\b/i,
      /\b(every|each)\s+(\d+)\s+(minute|hour|day|week|month)s?\b/i,
      /\b(\d+)\s+times\s+(a day|daily|a week|weekly|a month|monthly)\b/i
    ];
    
    for (const pattern of frequencyPatterns) {
      const frequencyMatch = lowerText.match(pattern);
      if (frequencyMatch) {
        if (pattern === frequencyPatterns[0]) {
          entities.timing.frequency = frequencyMatch[2];
        } else if (pattern === frequencyPatterns[1]) {
          entities.timing.frequency = `every ${frequencyMatch[2]} ${frequencyMatch[3]}`;
        } else {
          entities.timing.frequency = `${frequencyMatch[1]} times ${frequencyMatch[2]}`;
        }
        break;
      }
    }
    
    // 9. Extract allergies
    const allergyPattern = /\b(?:allerg(?:y|ic|ies)\s+(?:to|from)?|sensitive\s+to)\s+([a-z0-9\s,]+)/i;
    const allergyMatch = lowerText.match(allergyPattern);
    if (allergyMatch) {
      // Split multiple allergies by commas or 'and'
      const allergies = allergyMatch[1].split(/(?:,|\s+and\s+)/);
      allergies.forEach(allergy => {
        const trimmedAllergy = allergy.trim();
        if (trimmedAllergy && !entities.allergies.includes(trimmedAllergy)) {
          entities.allergies.push(trimmedAllergy);
        }
      });
    }
    
    // 10. Extract medical procedures history
    const procedureKeywords = ['surgery', 'operation', 'procedure', 'transplant', 'implant', 
                              'bypass', 'replacement', 'removal', 'biopsy', 'colonoscopy', 'endoscopy'];
    for (const keyword of procedureKeywords) {
      if (lowerText.includes(keyword)) {
        const procedurePattern = new RegExp(`(had|underwent|received|got)\\s+(?:\\w+\\s+){0,3}(\\w+\\s+)?${keyword}\\s+(?:on|for|to|in)\\s+(?:\\w+\\s+){0,5}([a-z0-9\\s]+)`, 'i');
        const procedureMatch = lowerText.match(procedurePattern);
        if (procedureMatch && procedureMatch[3]) {
          const procedure = `${procedureMatch[2] || ''}${keyword} for ${procedureMatch[3].trim()}`;
          if (!entities.proceduresHistory.some(p => p.includes(keyword))) {
            entities.proceduresHistory.push(procedure);
          }
        } else if (!entities.proceduresHistory.some(p => p.includes(keyword))) {
          // If no specific context, just record the mention
          entities.proceduresHistory.push(`${keyword} mentioned`);
        }
      }
    }
    
    // 11. Extract location information for healthcare recommendations
    const locationPattern = /\b(?:I(?:'m| am) (?:in|from|near)|I live in) ([a-z\s,]+)(?:,\s*([a-z]{2}))?\b/i;
    const locationMatch = lowerText.match(locationPattern);
    if (locationMatch) {
      const city = locationMatch[1].trim();
      const state = locationMatch[2] ? locationMatch[2].toUpperCase() : '';
      entities.location = state ? `${city}, ${state}` : city;
    }
    
    // 12. Extract preferred language
    const langPattern = /\b(?:speak|understand|prefer)\s+(?:to speak in|to use|using)?\s+(spanish|french|german|italian|chinese|japanese|korean|russian|arabic|hindi|portuguese|bengali|urdu)\b/i;
    const langMatch = lowerText.match(langPattern);
    if (langMatch) {
      entities.preferredLanguage = langMatch[1].toLowerCase();
    }
    
    // 13. Extract insurance information
    const insurancePattern = /\b(?:I have|my|using|with|covered by)\s+(\w+)(?:\s+\w+){0,2}\s+(?:health )?insurance\b/i;
    const insuranceMatch = lowerText.match(insurancePattern);
    if (insuranceMatch) {
      entities.insuranceInfo = insuranceMatch[1].toLowerCase();
    }
    
    // 14. Assess urgency level
    
    // Check for emergency keywords
    for (const keyword of emergencyKeywords) {
      if (lowerText.includes(keyword)) {
        entities.urgency = 'high';
        // For certain critical keywords, immediate elevation to critical
        if (['heart attack', 'stroke', 'not breathing', 'anaphylaxis', 'unconscious', 'bleeding heavily'].some(term => keyword.includes(term))) {
          entities.urgency = 'critical';
          break;
        }
      }
    }
    
    // Check for critical combinations of symptoms
    const criticalCombinations = [
      /chest\s+(?:\w+\s+){0,3}pain/i,
      /difficulty\s+(?:\w+\s+){0,3}breathing/i,
      /can'?t\s+(?:\w+\s+){0,3}breathe/i,
      /severe\s+(?:\w+\s+){0,3}bleeding/i,
      /sudden\s+(?:\w+\s+){0,3}(weakness|numbness|vision loss|speech)/i,
      /face\s+(?:\w+\s+){0,3}drooping/i,
      /arm\s+(?:\w+\s+){0,3}weakness/i,
      /slurred\s+(?:\w+\s+){0,3}speech/i
    ];
    
    for (const pattern of criticalCombinations) {
      if (pattern.test(lowerText)) {
        entities.urgency = 'critical';
        break;
      }
    }
    
    // Check for suicide-related urgency
    if (/\b(suicid|kill myself|end my life|don't want to live|no reason to live|wanting to die)\b/i.test(lowerText)) {
      entities.urgency = 'critical';
    }
    
    return entities;
  },
  // Advanced intent recognition system
  determineIntent: (text) => {
    // Initialize intent structure with weighted confidence scores
    const intents = {
      greeting: 0,
      emergency: 0,
      symptomCheck: 0,
      medicationInfo: 0,
      nutritionAdvice: 0,
      exerciseAdvice: 0,
      mentalHealthSupport: 0,
      preventiveCare: 0,
      conditionManagement: 0,
      diagnosticQuery: 0,
      treatmentOptions: 0,
      followUp: 0,
      farewell: 0,
      // Additional intents for enhanced functionality
      medicationReminder: 0,
      findProvider: 0,
      exportData: 0,
      setPreferences: 0,
      wellnessCheck: 0,
      sleepAdvice: 0,
      nutritionPlan: 0,
      exercisePlan: 0,
      babyHealth: 0,
      pregnancyHealth: 0,
      seniorHealth: 0,
      chronicPainManagement: 0,
      travelHealth: 0,
      skinConditions: 0,
      allergies: 0,
      weightManagement: 0
    };
    
    const lowerText = text.toLowerCase();
    
    // 1. Greeting intent patterns
    if (/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening|how are you)\b/i.test(lowerText)) {
      intents.greeting = 0.9;
      
      // Lower greeting confidence if medical terms are present
      if (/\b(pain|symptom|condition|medication|treatment|doctor)\b/i.test(lowerText)) {
        intents.greeting = 0.3;
      }
    }
    
    // 2. Emergency intent patterns with higher weightage
    if (/\b(emergency|urgent|help|critical|severe|911|108|ambulance|now)\b/i.test(lowerText)) {
      intents.emergency = 0.7;
      
      // Increase emergency confidence for critical symptoms
      if (/\b(heart attack|stroke|breathing|unconscious|bleeding heavily|anaphylaxis)\b/i.test(lowerText)) {
        intents.emergency = 0.95;
      }
    }
    
    // 3. Symptom check intent with contextual understanding
    const symptomPatterns = [
      /\b(symptom|pain|feeling|hurt|ache|sick|ill|unwell|fever|cough|rash)\b/i,
      /\bwhat('s| is) wrong\b/i,
      /\bwhy (do|am) I\b/i,
      /\bhave (a|an|this|these)\b/i,
      /\b(experiencing|suffering from)\b/i
    ];
    
    for (const pattern of symptomPatterns) {
      if (pattern.test(lowerText)) {
        intents.symptomCheck += 0.2;  // Cumulative confidence
      }
    }
    
    // Cap the confidence at 0.9
    intents.symptomCheck = Math.min(intents.symptomCheck, 0.9);
    
    // 4. Medication information intent
    if (/\b(medicine|medication|drug|pill|dose|prescription|tablet|capsule|side effect)\b/i.test(lowerText)) {
      intents.medicationInfo = 0.8;
      
      // Increase confidence for specific medication questions
      if (/\b(how (to|do) (take|use)|what are the (side effects|interactions)|is it safe)\b/i.test(lowerText)) {
        intents.medicationInfo = 0.9;
      }
    }
    
    // 5. Nutrition advice intent
    if (/\b(food|diet|nutrition|eat|meal|vitamin|supplement|healthy eating)\b/i.test(lowerText)) {
      intents.nutritionAdvice = 0.7;
      
      // Increase confidence for specific nutrition questions
      if (/\b(what should I eat|best foods|nutrition plan|meal plan|dietary advice)\b/i.test(lowerText)) {
        intents.nutritionAdvice = 0.9;
      }
      
      // Check for nutrition plan request specifically
      if (/\b(create|make|design|give me|need)(?:\s+\w+){0,3}\s+(?:a|detailed|customized|personalized)(?:\s+\w+){0,3}\s+(?:nutrition|diet|meal|eating)\s+plan\b/i.test(lowerText)) {
        intents.nutritionPlan = 0.95;
      }
    }
    
    // 6. Exercise advice intent
    if (/\b(exercise|workout|fitness|physical activity|training|sport|run|walk|gym)\b/i.test(lowerText)) {
      intents.exerciseAdvice = 0.7;
      
      // Increase confidence for specific exercise questions
      if (/\b(how (much|often|to) exercise|workout plan|fitness routine|best exercises)\b/i.test(lowerText)) {
        intents.exerciseAdvice = 0.9;
      }
      
      // Check for exercise plan request specifically
      if (/\b(create|make|design|give me|need)(?:\s+\w+){0,3}\s+(?:a|detailed|customized|personalized)(?:\s+\w+){0,3}\s+(?:exercise|workout|fitness|training)\s+plan\b/i.test(lowerText)) {
        intents.exercisePlan = 0.95;
      }
    }
    
    // 7. Mental health support intent
    if (/\b(stress|anxiety|depression|mental health|therapy|counseling|mood|feel sad|worried)\b/i.test(lowerText)) {
      intents.mentalHealthSupport = 0.8;
      
      // Increase confidence for specific mental health questions
      if (/\b(how to (cope|deal|manage)|feeling (overwhelmed|down|anxious)|panic attack)\b/i.test(lowerText)) {
        intents.mentalHealthSupport = 0.9;
      }
    }
    
    // 8. Preventive care intent
    if (/\b(prevention|check-up|screening|exam|vaccine|immunization|routine|annual)\b/i.test(lowerText)) {
      intents.preventiveCare = 0.7;
      
      // Increase confidence for specific preventive questions
      if (/\b(when should I get|how often|screening test|preventive measure|reduce risk)\b/i.test(lowerText)) {
        intents.preventiveCare = 0.85;
      }
    }
    
    // 9. Condition management intent
    if (/\b(manage|control|live with|chronic|long-term|treatment plan)\b/i.test(lowerText)) {
      intents.conditionManagement = 0.7;
      
      // Increase confidence for specific management questions
      if (/\b(how to (manage|control|monitor)|treatment options|lifestyle changes|self-care)\b/i.test(lowerText)) {
        intents.conditionManagement = 0.85;
      }
    }
    
    // 10. Diagnostic query intent
    if (/\b(diagnose|diagnosis|test|testing|results|causes|why|what is|could it be)\b/i.test(lowerText)) {
      intents.diagnosticQuery = 0.7;
      
      // Increase confidence for specific diagnostic questions
      if (/\b(what (causes|is causing)|reasons for|diagnostic test|blood test|scan|mri|xray|ultrasound)\b/i.test(lowerText)) {
        intents.diagnosticQuery = 0.85;
      }
    }
    
    // 11. Treatment options intent
    if (/\b(treat|treatment|therapy|cure|heal|remedy|option|alternative|surgery)\b/i.test(lowerText)) {
      intents.treatmentOptions = 0.75;
      
      // Increase confidence for specific treatment questions
      if (/\b(how to treat|treatment options|best treatment|surgery for|therapy for|home remedy)\b/i.test(lowerText)) {
        intents.treatmentOptions = 0.9;
      }
    }
    
    // 12. Follow-up intent
    if (/\b(follow up|follow-up|next step|what now|next visit|should I see|when to return)\b/i.test(lowerText)) {
      intents.followUp = 0.8;
    }
    
    // 13. Farewell intent
    if (/\b(bye|goodbye|thank you|thanks|end|quit|exit)\b/i.test(lowerText)) {
      intents.farewell = 0.7;
      
      // Increase confidence for clear farewells
      if (/\b(thank you|thanks)\b/i.test(lowerText) && 
          !/\b(can you|could you|what|how|why)\b/i.test(lowerText)) {
        intents.farewell = 0.9;
      }
    }
    
    // 14. Medication reminder intent
    if (/\b(remind|reminder|remember|schedule|take|medication|medicine|dose|pill|timing)\b/i.test(lowerText)) {
      if (/\b(set|create|make|schedule|add|need)(?:\s+\w+){0,3}\s+(?:a|medication|medicine|pill|reminder|alert)\b/i.test(lowerText)) {
        intents.medicationReminder = 0.9;
      }
    }
    
    // 15. Find healthcare provider intent
    if (/\b(find|locate|search|recommend|suggest|nearby|close|area|doctor|specialist|clinic|hospital|pharmacy)\b/i.test(lowerText)) {
      if (/\b(find|locate|search|recommend|where)(?:\s+\w+){0,3}\s+(?:a|the|some|good|best|nearby|closest)(?:\s+\w+){0,3}\s+(?:doctor|physician|specialist|clinic|hospital|pharmacy|dentist|therapist)\b/i.test(lowerText)) {
        intents.findProvider = 0.9;
      }
    }
    
    // 16. Export data intent
    if (/\b(export|download|save|share|send|email|print|record|history|conversation|chat|log)\b/i.test(lowerText)) {
      if (/\b(export|download|save|share|send|email|print)(?:\s+\w+){0,3}\s+(?:this|the|our|my|health|medical|chat|conversation|history|log|record)\b/i.test(lowerText)) {
        intents.exportData = 0.9;
      }
    }
    
    // 17. Set preferences intent
    if (/\b(settings|preferences|customize|personalize|change|update|language|theme|notification|alert|privacy)\b/i.test(lowerText)) {
      if (/\b(change|update|set|modify|adjust)(?:\s+\w+){0,3}\s+(?:my|the|settings|preferences|options|language|theme|mode|notifications|alerts)\b/i.test(lowerText)) {
        intents.setPreferences = 0.9;
      }
    }
    
    // 18. Wellness check intent
    if (/\b(wellness|health|checkup|status|assessment|evaluation|review|check)\b/i.test(lowerText)) {
      if (/\b(overall|general|basic|wellness|health)(?:\s+\w+){0,3}\s+(?:check|checkup|assessment|evaluation|status|review)\b/i.test(lowerText)) {
        intents.wellnessCheck = 0.9;
      }
    }
    
    // 19. Sleep advice intent
    if (/\b(sleep|insomnia|rest|tired|fatigue|drowsy|awake|night|bed|nap)\b/i.test(lowerText)) {
      if (/\b(sleep|insomnia|trouble sleeping|can't sleep|difficulty sleeping|poor sleep|quality sleep|better sleep)\b/i.test(lowerText)) {
        intents.sleepAdvice = 0.9;
      }
    }
    
    // 20. Baby health intent
    if (/\b(baby|infant|newborn|toddler|child|kid|pediatric|teething|diaper|breastfeeding|formula|colic)\b/i.test(lowerText)) {
      intents.babyHealth = 0.8;
      
      // Increase confidence for specific baby health questions
      if (/\b(my baby|my infant|my newborn|my toddler|my child)\b/i.test(lowerText)) {
        intents.babyHealth = 0.9;
      }
    }
    
    // 21. Pregnancy health intent
    if (/\b(pregnant|pregnancy|expecting|prenatal|trimester|birth|labor|delivery|fertility|conception)\b/i.test(lowerText)) {
      intents.pregnancyHealth = 0.9;
    }
    
    // 22. Senior health intent
    if (/\b(senior|elderly|aging|older adult|geriatric|retirement|medicare)\b/i.test(lowerText)) {
      intents.seniorHealth = 0.8;
      
      // Increase confidence for specific senior health questions
      if (/\b(elderly care|senior health|aging health|geriatric|older adults)\b/i.test(lowerText)) {
        intents.seniorHealth = 0.9;
      }
    }
    
    // 23. Chronic pain management intent
    if (/\b(chronic|persistent|ongoing|continuous|constant|long-term|lasting)\s+(?:\w+\s+){0,3}\s+(pain|ache|discomfort)\b/i.test(lowerText)) {
      intents.chronicPainManagement = 0.9;
    }
    
    // 24. Travel health intent
    if (/\b(travel|trip|vacation|overseas|abroad|international|foreign|flying|jet lag|malaria|vaccine)\b/i.test(lowerText)) {
      if (/\b(travel|trip|vacation|visiting|going to)(?:\s+\w+){0,3}\s+(?:health|medical|safety|precautions|advice|tips|vaccines|medications)\b/i.test(lowerText)) {
        intents.travelHealth = 0.9;
      }
    }
    
    // 25. Skin conditions intent
    if (/\b(skin|rash|acne|eczema|psoriasis|dermatitis|mole|wart|hives|itchy|spots|lesion|dermatology)\b/i.test(lowerText)) {
      intents.skinConditions = 0.85;
    }
    
    // 26. Allergies intent
    if (/\b(allergy|allergies|allergic|antihistamine|reaction|hay fever|sensitive|intolerance)\b/i.test(lowerText)) {
      intents.allergies = 0.85;
    }
    
    // 27. Weight management intent
    if (/\b(weight|obesity|overweight|bmi|body mass|diet|calorie|fat|slim|thin|lose weight|gain weight)\b/i.test(lowerText)) {
      if (/\b(lose|losing|reduce|drop|shed|manage|control|gain)\s+(?:\w+\s+){0,2}\s+weight\b/i.test(lowerText)) {
        intents.weightManagement = 0.9;
      }
    }
    
    // Find the highest confidence intent
    let highestConfidence = 0;
    let primaryIntent = 'general';
    
    for (const [intent, confidence] of Object.entries(intents)) {
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        primaryIntent = intent;
      }
    }
    
    // If we don't have a clear intent above threshold, default to general
    if (highestConfidence < 0.4) {
      primaryIntent = 'general';
    }
    
    // Handling questions explicitly
    if (text.includes('?')) {
      // If it's a question but no clear intent, mark as general query
      if (primaryIntent === 'general') {
        primaryIntent = 'generalQuery';
        highestConfidence = 0.6;
      }
    }
    
    return {
      primary: primaryIntent,
      confidence: highestConfidence,
      all: intents
    };
  },
  // Advanced sentiment and emotion analysis
  analyzeSentiment: (text) => {
    const lowerText = text.toLowerCase();
    
    // Comprehensive emotional lexicons
    const emotionLexicon = {
      joy: ['happy', 'glad', 'excited', 'delighted', 'pleased', 'thrilled', 'content', 'cheerful', 'joy', 'wonderful', 'great', 'optimistic', 'hopeful', 'satisfied', 'relieved', 'enthusiastic', 'jubilant', 'ecstatic', 'elated', 'overjoyed'],
      sadness: ['sad', 'unhappy', 'depressed', 'gloomy', 'miserable', 'heartbroken', 'down', 'blue', 'upset', 'discouraged', 'despairing', 'despondent', 'sorrowful', 'grieving', 'somber', 'melancholic', 'disappointed', 'disheartened', 'low', 'devastated'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'outraged', 'enraged', 'hostile', 'bitter', 'indignant', 'resentful', 'exasperated', 'irate', 'livid', 'incensed', 'infuriated', 'seething', 'fuming', 'frustrated', 'agitated'],
      fear: ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried', 'nervous', 'panicked', 'alarmed', 'uneasy', 'apprehensive', 'dread', 'fearful', 'horrified', 'paranoid', 'distressed', 'troubled', 'overwhelmed', 'stressed', 'tense'],
      disgust: ['disgusted', 'repulsed', 'revolted', 'sickened', 'appalled', 'nauseous', 'distaste', 'aversion', 'loathing', 'contempt', 'dislike', 'horrified', 'hateful', 'offended', 'grossed out'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled', 'stunned', 'unexpected', 'sudden', 'bewildered', 'dumbfounded', 'flabbergasted', 'astounded', 'speechless', 'taken aback', 'thunderstruck'],
      trust: ['trust', 'confident', 'secure', 'assured', 'reliable', 'dependable', 'faithful', 'hopeful', 'believed', 'trustworthy', 'credible', 'honest', 'loyal', 'devoted', 'committed'],
      confusion: ['confused', 'puzzled', 'perplexed', 'bewildered', 'uncertain', 'unsure', 'lost', 'doubtful', 'ambivalent', 'undecided', 'unclear', 'disoriented', 'mixed up', 'muddled', 'confounded']
    };
    
    // Enhanced sentiment lexicons
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific', 'outstanding',
      'helpful', 'beneficial', 'positive', 'effective', 'valuable', 'useful', 'efficient',
      'better', 'best', 'improve', 'improved', 'improving', 'recovery', 'recovering',
      'relief', 'relieved', 'comfortable', 'comfort', 'ease', 'easy', 'progress',
      'hope', 'hopeful', 'optimistic', 'confident', 'encouraged', 'encouraging',
      'success', 'successful', 'well', 'healthy', 'normal', 'stable', 'steady',
      'perfect', 'ideal', 'exceptional', 'superb', 'splendid', 'marvelous', 'exquisite',
      'delightful', 'pleasant', 'satisfying', 'gratifying', 'rewarding', 'fulfilling',
      'promising', 'favorable', 'positive', 'fortunate', 'lucky', 'blessed', 'glad',
      'happy', 'joyful', 'pleased', 'content', 'thrilled', 'elated', 'jubilant',
      'cheerful', 'merry', 'lively', 'vibrant', 'energetic', 'active', 'dynamic',
      'strong', 'powerful', 'robust', 'vigorous', 'tough', 'resilient', 'enduring',
      'safe', 'secure', 'protected', 'sheltered', 'reliable', 'dependable', 'trustworthy'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'horrible', 'awful', 'dreadful', 'poor', 'inadequate', 'disappointing',
      'pain', 'painful', 'hurt', 'hurting', 'ache', 'aching', 'sore', 'tender', 'burning',
      'sick', 'ill', 'unwell', 'disease', 'disorder', 'condition', 'infection', 'infected',
      'worse', 'worst', 'deteriorate', 'deteriorating', 'decline', 'declining',
      'problem', 'issue', 'complication', 'difficult', 'hard', 'challenge', 'challenging',
      'concern', 'concerned', 'worry', 'worried', 'anxious', 'anxiety', 'stress', 'stressed',
      'fear', 'afraid', 'scared', 'frightened', 'terror', 'terrified', 'dread', 'panic',
      'suffer', 'suffering', 'agony', 'misery', 'distress', 'discomfort', 'uncomfortable',
      'terrible', 'horrific', 'appalling', 'atrocious', 'abysmal', 'ghastly', 'grim',
      'dire', 'severe', 'grave', 'serious', 'critical', 'dangerous', 'hazardous',
      'harmful', 'damaging', 'destructive', 'detrimental', 'injurious', 'pernicious',
      'fatal', 'deadly', 'lethal', 'mortal', 'murderous', 'killing', 'toxic'
    ];
    
    const intensifiers = [
      'very', 'extremely', 'incredibly', 'exceedingly', 'exceptionally', 'enormously',
      'immensely', 'tremendously', 'excessively', 'severely', 'intensely', 'terribly',
      'awfully', 'utterly', 'absolutely', 'completely', 'totally', 'wholly', 'entirely',
      'highly', 'especially', 'particularly', 'remarkably', 'unusually', 'crucially',
      'desperately', 'dreadfully', 'drastically', 'greatly', 'significantly'
    ];
    
    const diminishers = [
      'slightly', 'somewhat', 'relatively', 'fairly', 'rather', 'moderately',
      'mildly', 'partly', 'partially', 'barely', 'hardly', 'scarcely', 'a little',
      'a bit', 'kind of', 'sort of', 'not very', 'not too', 'not particularly',
      'not especially', 'not entirely', 'not completely', 'occasionally', 'sometimes',
      'a tad', 'to some extent', 'to a degree', 'marginally', 'nominally', 'faintly',
      'vaguely', 'lightly', 'softly', 'gently', 'subtly', 'delicately'
    ];
    
    // Process text for sentiment analysis
    const words = lowerText.split(/\W+/).filter(word => word.length > 0);
    let positiveCount = 0;
    let negativeCount = 0;
    let dominantEmotion = null;
    let dominantEmotionScore = 0;
    
    // Emotion analysis
    const emotionScores = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      disgust: 0,
      surprise: 0,
      trust: 0,
      confusion: 0
    };
    
    // Track detected intensifiers and diminishers
    let hasIntensifier = false;
    let hasDiminisher = false;
    
    // Track negation for context-aware sentiment
    let negationActive = false;
    let negationScope = 0;  // Tracking words after negation
    const negationMax = 4;  // How many words negation affects
    
    // Analyze each word
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check for negation words
      if (/\b(not|no|never|neither|nor|without|hardly|barely|scarcely|doesn't|don't|didn't|isn't|aren't|wasn't|weren't|won't|wouldn't|shouldn't|couldn't|can't)\b/i.test(word)) {
        negationActive = true;
        negationScope = 0;
        continue;
      }
      
      // Check for intensifiers/diminishers
      if (intensifiers.includes(word)) {
        hasIntensifier = true;
        continue;
      }
      
      if (diminishers.includes(word)) {
        hasDiminisher = true;
        continue;
      }
      
      // Score emotions
      for (const [emotion, emotionWords] of Object.entries(emotionLexicon)) {
        if (emotionWords.includes(word)) {
          // Apply negation if active
          if (negationActive && negationScope < negationMax) {
            // Negating emotion creates opposite or different emotion
            if (emotion === 'joy') {
              emotionScores.sadness += 1;
            } else if (emotion === 'sadness') {
              emotionScores.joy += 0.5;  // Less strong when negating sadness
            } else if (emotion === 'anger') {
              emotionScores.trust += 0.5;
            } else if (emotion === 'fear') {
              emotionScores.trust += 0.5;
            } else if (emotion === 'trust') {
              emotionScores.fear += 0.5;
            } else {
              // Default negation diminishes the emotion
              emotionScores[emotion] -= 0.5;
            }
          } else {
            // Normal emotion scoring
            emotionScores[emotion] += 1;
            
            // Apply intensifiers/diminishers if present in proximity
            if (i > 0 && intensifiers.includes(words[i-1])) {
              emotionScores[emotion] += 0.5;
            } else if (i > 0 && diminishers.includes(words[i-1])) {
              emotionScores[emotion] -= 0.5;
            }
          }
        }
      }
      
      // Score sentiment
      if (positiveWords.includes(word)) {
        // Check for negation
        if (negationActive && negationScope < negationMax) {
          negativeCount += 1;
        } else {
          positiveCount += 1;
          // Apply intensifiers if present
          if (i > 0 && intensifiers.includes(words[i-1])) {
            positiveCount += 0.5;
          } else if (i > 0 && diminishers.includes(words[i-1])) {
            positiveCount -= 0.5;
          }
        }
      }
      
      if (negativeWords.includes(word)) {
        // Check for negation
        if (negationActive && negationScope < negationMax) {
          positiveCount += 0.5;  // Negating negative isn't as strong as positive
        } else {
          negativeCount += 1;
          // Apply intensifiers if present
          if (i > 0 && intensifiers.includes(words[i-1])) {
            negativeCount += 0.5;
          } else if (i > 0 && diminishers.includes(words[i-1])) {
            negativeCount -= 0.5;
          }
        }
      }
      
      // Update negation scope
      if (negationActive) {
        negationScope++;
        if (negationScope >= negationMax) {
          negationActive = false;
        }
      }
    }
    
    // Find dominant emotion
    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (score > dominantEmotionScore) {
        dominantEmotionScore = score;
        dominantEmotion = emotion;
      }
    }
    
    // Calculate overall sentiment score: -1 (very negative) to 1 (very positive)
    const totalWords = Math.max(words.length, 1);
    const raw_score = (positiveCount - negativeCount) / totalWords;
    
    // Apply scaling to make the score more pronounced
    let sentimentScore = Math.tanh(raw_score * 2);  // tanh for smoother scaling between -1 and 1
    
    // Classify sentiment more granularly
    let sentiment = 'neutral';
    if (sentimentScore <= -0.6) sentiment = 'very negative';
    else if (sentimentScore <= -0.2) sentiment = 'negative';
    else if (sentimentScore <= -0.05) sentiment = 'slightly negative';
    else if (sentimentScore < 0.05) sentiment = 'neutral';
    else if (sentimentScore < 0.2) sentiment = 'slightly positive';
    else if (sentimentScore < 0.6) sentiment = 'positive';
    else sentiment = 'very positive';
    
    // Detect uncertainty
    const uncertaintyWords = ['maybe', 'perhaps', 'possibly', 'not sure', 'uncertain', 'doubt', 'unclear', 'unsure', 'might', 'could be', 'potentially', 'questionable', 'ambiguous', 'undecided', 'undetermined', 'debatable'];
    let uncertaintyScore = 0;
    
    for (const word of uncertaintyWords) {
      if (lowerText.includes(word)) {
        uncertaintyScore += 0.2;
      }
    }
    
    // Cap uncertainty score at 1
    uncertaintyScore = Math.min(uncertaintyScore, 1);
    
    // Enhanced analysis of medical anxiety and distress
    let medicalAnxiety = 0;
    const medicalAnxietyTriggers = [
      'worried about', 'concerned about', 'scared of', 'fear of', 'afraid of', 'terrified of',
      'anxious about', 'stressing about', 'panicking about', 'dread', 'frightened of',
      'diagnosis', 'prognosis', 'terminal', 'chronic', 'incurable', 'untreatable',
      'serious condition', 'life-threatening', 'fatal', 'deadly', 'grave', 'severe',
      'cancer', 'tumor', 'heart attack', 'stroke', 'death', 'dying'
    ];
    
    for (const trigger of medicalAnxietyTriggers) {
      if (lowerText.includes(trigger)) {
        medicalAnxiety += 0.25;
      }
    }
    
    // Cap medical anxiety score at 1
    medicalAnxiety = Math.min(medicalAnxiety, 1);
    
    return {
      score: sentimentScore,
      sentiment: sentiment,
      dominant_emotion: dominantEmotion,
      emotion_scores: emotionScores,
      uncertainty: uncertaintyScore,
      medical_anxiety: medicalAnxiety,
      has_intensifiers: hasIntensifier,
      has_diminishers: hasDiminisher,
      positive_words: positiveCount,
      negative_words: negativeCount
    };
  },
  // Generate contextually relevant follow-up questions
  generateFollowUpQuestions: (userInput, entities, intent, conversationHistory) => {
    const questions = [];
    
    // Base question generation on medical history gaps
    if (!entities.demographics.age && intent.primary !== 'farewell') {
      questions.push("May I ask your age to provide more relevant health information?");
    }
    
    // For symptom checking
    if (intent.primary === 'symptomCheck' && entities.symptoms.length > 0) {
      // If no timing information, ask about onset
      if (!entities.timing.onset) {
        questions.push(`When did your ${entities.symptoms.join(', ')} begin?`);
      }
      
      // If no body part mentioned but symptoms are present
      if (entities.bodyParts.length === 0 && entities.symptoms.some(s => ['pain', 'ache', 'discomfort', 'numbness', 'tingling', 'swelling', 'rash'].some(term => s.includes(term)))) {
        questions.push("Which part of your body is experiencing these symptoms?");
      }
      
      // If single symptom with no severity mentioned
      if (entities.symptoms.length === 1 && !entities.symptoms[0].match(/(mild|moderate|severe|extreme)/)) {
        questions.push(`On a scale of 1-10, how would you rate your ${entities.symptoms[0]}?`);
      }
      
      // Ask about alleviating/worsening factors
      questions.push("Is there anything that makes your symptoms better or worse?");
      
      // If fever is mentioned
      if (entities.symptoms.some(s => s.includes('fever'))) {
        questions.push("Have you measured your temperature? If so, what was the reading?");
      }
      
      // If pain is mentioned, ask about its character
      if (entities.symptoms.some(s => s.includes('pain'))) {
        questions.push("How would you describe the pain? Is it sharp, dull, throbbing, burning, or something else?");
      }
      
      // If multiple symptoms, ask if they started together
      if (entities.symptoms.length > 1) {
        questions.push("Did all these symptoms start at the same time, or did some appear before others?");
      }
      
      // Ask about similar past episodes
      questions.push("Have you experienced similar symptoms in the past?");
    }
    
    // For medication info
    if (intent.primary === 'medicationInfo' && entities.medications.length > 0) {
      // If medication mentioned but no dosage
      if (!entities.medications.some(m => m.match(/\d+\s*(mg|mcg|ml|g)/))) {
        questions.push(`What dosage of ${entities.medications[0]} are you taking?`);
      }
      
      // Ask about side effects
      questions.push("Have you noticed any side effects from your medication?");
      
      // Ask about other medications
      questions.push("Are you currently taking any other medications or supplements?");
      
      // Ask about effectiveness
      questions.push(`How effective has ${entities.medications[0]} been for your condition?`);
      
      // Ask about adherence
      questions.push("Do you ever miss doses or take the medication differently than prescribed?");
      
      // Ask about duration
      questions.push("How long have you been taking this medication?");
    }
    
    // For nutrition advice
    if (intent.primary === 'nutritionAdvice') {
      if (!entities.lifestyle.diet) {
        questions.push("Do you follow any specific diet or have dietary restrictions?");
      }
      
      if (entities.conditions.length > 0) {
        questions.push(`Are you looking for dietary recommendations specific to your ${entities.conditions.join(', ')}?`);
      } else {
        questions.push("Do you have any specific health goals related to your diet?");
      }
      
      // Ask about food preferences
      questions.push("Are there particular foods you enjoy or dislike?");
      
      // Ask about meal preparation habits
      questions.push("Do you typically cook at home or eat out more frequently?");
      
      // Ask about food allergies or intolerances
      questions.push("Do you have any food allergies or intolerances I should consider?");
    }
    
    // For exercise advice
    if (intent.primary === 'exerciseAdvice') {
      if (!entities.lifestyle.exercise) {
        questions.push("What type of physical activity do you currently engage in, and how often?");
      }
      
      if (entities.conditions.length > 0) {
        questions.push(`Do you have any limitations with exercise due to your ${entities.conditions.join(', ')}?`);
      } else {
        questions.push("Do you have any physical limitations I should know about?");
      }
      
      // Ask about exercise preferences
      questions.push("What types of physical activities do you enjoy most?");
      
      // Ask about fitness goals
      questions.push("What are your main fitness goals - strength, flexibility, cardiovascular health, weight management, or something else?");
      
      // Ask about exercise environment
      questions.push("Do you prefer exercising at home, outdoors, or at a gym?");
    }
    
    // For mental health
    if (intent.primary === 'mentalHealthSupport') {
      questions.push("How long have you been experiencing these feelings?");
      questions.push("Are you currently receiving any professional support for your mental health?");
      questions.push("What coping strategies have you tried so far?");
      
      // Ask about triggers
      questions.push("Have you noticed any particular triggers or patterns to these feelings?");
      
      // Ask about sleep and self-care
      questions.push("How has your sleep and overall self-care been recently?");
      
      // Ask about support system
      questions.push("Do you have supportive people in your life you can talk to?");
    }
    
    // For condition management
    if (intent.primary === 'conditionManagement' && entities.conditions.length > 0) {
      questions.push(`How long have you been managing your ${entities.conditions.join(', ')}?`);
      questions.push("What treatments or approaches have you tried so far?");
      questions.push("Are there specific aspects of managing your condition that you find challenging?");
      
      // Ask about healthcare team
      questions.push("Do you have regular follow-ups with your healthcare providers?");
      
      // Ask about impact on daily life
      questions.push("How does this condition impact your daily activities or quality of life?");
      
      // Ask about tracking
      questions.push("Do you currently track any symptoms or metrics related to your condition?");
    }
    
    // For preventive care
    if (intent.primary === 'preventiveCare') {
      if (!entities.demographics.age) {
        questions.push("What age group are you interested in preventive care recommendations for?");
      } else {
        questions.push("When was your last comprehensive health check-up?");
      }
      questions.push("Are there specific health concerns you'd like to prevent?");
      
      // Ask about family history
      questions.push("Do you have a family history of specific health conditions?");
      
      // Ask about current preventive measures
      questions.push("What preventive health measures do you currently practice?");
      
      // Ask about immunizations
      questions.push("Are your immunizations up to date?");
    }
    
    // For diagnostic queries
    if (intent.primary === 'diagnosticQuery') {
      if (entities.symptoms.length > 0) {
        questions.push("Have you consulted a healthcare provider about these symptoms?");
        questions.push("Have you had any diagnostic tests related to these symptoms?");
      }
      
      // Ask about health history
      questions.push("Do you have any existing medical conditions?");
      
      // Ask about recent changes
      questions.push("Have you made any recent lifestyle changes or started new medications?");
      
      // Ask about impact on daily life
      questions.push("How are these symptoms affecting your daily activities?");
    }
    
    // For treatment options
    if (intent.primary === 'treatmentOptions') {
      if (entities.conditions.length > 0) {
        questions.push("What treatments have you already tried for this condition?");
        questions.push("Are you interested in medical treatments, lifestyle approaches, or both?");
      }
      
      // Ask about treatment preferences
      questions.push("Do you prefer more conservative approaches first, or are you open to all treatment options?");
      
      // Ask about concerns
      questions.push("Do you have any concerns or preferences regarding potential treatments?");
      
      // Ask about access
      questions.push("Do you have any constraints in terms of insurance coverage or access to specialists?");
    }
    
    // For sleep advice
    if (intent.primary === 'sleepAdvice') {
      questions.push("How many hours of sleep do you typically get each night?");
      questions.push("What time do you usually go to bed and wake up?");
      questions.push("Do you have trouble falling asleep, staying asleep, or both?");
      questions.push("Do you use electronic devices before bedtime?");
      questions.push("Do you consume caffeine or alcohol in the hours before sleep?");
    }
    
    // For baby health
    if (intent.primary === 'babyHealth') {
      questions.push("How old is your baby or child?");
      questions.push("Are they meeting their developmental milestones?");
      questions.push("Are they up to date on their immunizations?");
      questions.push("How is their appetite and eating pattern?");
    }
    
    // For pregnancy health
    if (intent.primary === 'pregnancyHealth') {
      questions.push("How far along are you in your pregnancy?");
      questions.push("Is this your first pregnancy?");
      questions.push("Are you receiving regular prenatal care?");
      questions.push("Do you have any specific pregnancy concerns you'd like to discuss?");
    }
    
    // Contextual questions based on conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      // If user has mentioned improving but not details
      const recentMessages = conversationHistory.slice(-3);
      if (recentMessages.some(msg => msg.text.toLowerCase().includes('better') || msg.text.toLowerCase().includes('improve'))) {
        questions.push("What specific improvements have you noticed?");
      }
      
      // If user has mentioned seeing a doctor
      if (recentMessages.some(msg => msg.text.toLowerCase().includes('doctor') || msg.text.toLowerCase().includes('appointment'))) {
        questions.push("What did your healthcare provider recommend?");
      }
      
      // If user has mentioned stress or anxiety
      if (recentMessages.some(msg => msg.text.toLowerCase().includes('stress') || msg.text.toLowerCase().includes('anxiety') || msg.text.toLowerCase().includes('worried'))) {
        questions.push("Have you tried any relaxation techniques or stress management strategies?");
      }
      
      // If user has mentioned pain
      if (recentMessages.some(msg => msg.text.toLowerCase().includes('pain') || msg.text.toLowerCase().includes('hurt') || msg.text.toLowerCase().includes('ache'))) {
        questions.push("Have you found anything that helps relieve your pain?");
      }
    }
    
    // Shuffle all questions to avoid predictability
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    
    // Limit to 2 questions maximum to avoid overwhelming
    return shuffled.slice(0, 2);
  },
  // Generate dynamically contextual suggested queries
  generateContextualSuggestions: (userInput, entities, intent, conversationHistory) => {
    const suggestions = [];
    
    // Based on detected health topics
    if (entities.conditions.length > 0) {
      entities.conditions.forEach(condition => {
        const cleanCondition = condition.replace(/diagnosed |history of |suspected /, '');
        suggestions.push(`${cleanCondition} management tips`);
        suggestions.push(`Latest research on ${cleanCondition}`);
        suggestions.push(`Living well with ${cleanCondition}`);
      });
    }
    
    if (entities.symptoms.length > 0) {
      entities.symptoms.forEach(symptom => {
        const cleanSymptom = symptom.replace(/severe |moderate |mild /, '');
        suggestions.push(`Causes of ${cleanSymptom}`);
        suggestions.push(`Home relief for ${cleanSymptom}`);
        suggestions.push(`When to see doctor for ${cleanSymptom}`);
      });
    }
    
    if (entities.medications.length > 0) {
      const medication = entities.medications[0].split(' ')[0]; // Get just the medication name
      suggestions.push(`${medication} side effects`);
      suggestions.push(`${medication} interactions`);
      suggestions.push(`Tips for taking ${medication}`);
    }
    
    // Based on detected intent
    switch (intent.primary) {
      case 'nutritionAdvice':
        suggestions.push("Anti-inflammatory foods");
        suggestions.push("Meal planning for beginners");
        suggestions.push("Reading nutrition labels");
        suggestions.push("Balancing macronutrients");
        suggestions.push("Healthy eating on a budget");
        suggestions.push("Heart-healthy diet guidelines");
        suggestions.push("Foods for immune support");
        suggestions.push("Managing food cravings");
        break;
        
      case 'exerciseAdvice':
        suggestions.push("Low-impact exercise options");
        suggestions.push("Building an exercise routine");
        suggestions.push("Home workout without equipment");
        suggestions.push("Exercise for stress relief");
        suggestions.push("Proper stretching techniques");
        suggestions.push("Strength training fundamentals");
        suggestions.push("Preventing exercise injuries");
        suggestions.push("Best exercises for back health");
        break;
        
      case 'mentalHealthSupport':
        suggestions.push("Mindfulness for beginners");
        suggestions.push("Quick anxiety relief techniques");
        suggestions.push("Improving sleep quality");
        suggestions.push("Building mental resilience");
        suggestions.push("Finding mental health resources");
        suggestions.push("Recognizing depression symptoms");
        suggestions.push("Stress management strategies");
        suggestions.push("Digital mental health tools");
        break;
        
      case 'preventiveCare':
        suggestions.push("Important health screenings");
        suggestions.push("Building healthy habits");
        suggestions.push("Family health history importance");
        suggestions.push("Immunization schedule");
        suggestions.push("Heart disease prevention");
        suggestions.push("Cancer prevention strategies");
        suggestions.push("Early detection screenings");
        suggestions.push("Preventive care by age group");
        break;
        
      case 'medicationInfo':
        suggestions.push("Medication organization systems");
        suggestions.push("Questions for your pharmacist");
        suggestions.push("Prescription cost savings");
        suggestions.push("Medication adherence tips");
        suggestions.push("Managing medication side effects");
        suggestions.push("Understanding drug classifications");
        suggestions.push("Medication safety at home");
        suggestions.push("Travel tips for medication");
        break;
        
      case 'symptomCheck':
        suggestions.push("Creating a symptom journal");
        suggestions.push("Preparing for doctor visits");
        suggestions.push("Questions to ask your doctor");
        suggestions.push("Understanding medical tests");
        suggestions.push("Finding medical specialists");
        suggestions.push("When symptoms are emergencies");
        suggestions.push("Second opinion guidelines");
        suggestions.push("Telemedicine for symptom assessment");
        break;
        
      case 'babyHealth':
        suggestions.push("Baby developmental milestones");
        suggestions.push("Infant feeding guidelines");
        suggestions.push("Baby sleep strategies");
        suggestions.push("Common baby illnesses");
        suggestions.push("Childproofing your home");
        suggestions.push("Baby vaccination schedule");
        suggestions.push("Signs of illness in babies");
        suggestions.push("First aid for infants");
        break;
        
      case 'pregnancyHealth':
        suggestions.push("Pregnancy nutrition guidelines");
        suggestions.push("Safe exercise during pregnancy");
        suggestions.push("Managing pregnancy discomfort");
        suggestions.push("Prenatal vitamin information");
        suggestions.push("Pregnancy trimester guide");
        suggestions.push("Signs of pregnancy complications");
        suggestions.push("Preparing for childbirth");
        suggestions.push("Postpartum health planning");
        break;
        
      case 'sleepAdvice':
        suggestions.push("Creating a sleep-friendly bedroom");
        suggestions.push("Evening routine for better sleep");
        suggestions.push("Natural sleep aids");
        suggestions.push("Managing insomnia without medication");
        suggestions.push("Sleep tracking methods");
        suggestions.push("Impact of screens on sleep");
        suggestions.push("Sleep and mental health connection");
        suggestions.push("Chronotherapy for sleep disorders");
        break;
        
      case 'chronicPainManagement':
        suggestions.push("Non-medication pain relief");
        suggestions.push("Understanding pain signals");
        suggestions.push("Mind-body approaches for pain");
        suggestions.push("Tracking pain patterns");
        suggestions.push("Ergonomic adjustments for pain");
        suggestions.push("Pain management specialists");
        suggestions.push("Nutrition for chronic pain");
        suggestions.push("Exercise approaches for chronic pain");
        break;
        
      case 'skinConditions':
        suggestions.push("Daily skincare routine");
        suggestions.push("Identifying skin conditions");
        suggestions.push("Sun protection guidelines");
        suggestions.push("Managing sensitive skin");
        suggestions.push("Acne treatment options");
        suggestions.push("Eczema management strategies");
        suggestions.push("When to see a dermatologist");
        suggestions.push("Natural remedies for skin issues");
        break;
        
      case 'allergies':
        suggestions.push("Seasonal allergy management");
        suggestions.push("Allergy-proofing your home");
        suggestions.push("Food allergy vs. intolerance");
        suggestions.push("Allergy testing explained");
        suggestions.push("Over-the-counter allergy treatments");
        suggestions.push("Allergy immunotherapy information");
        suggestions.push("Managing allergies while traveling");
        suggestions.push("Preparing for allergy season");
        break;
        
      case 'weightManagement':
        suggestions.push("Sustainable weight management");
        suggestions.push("Healthy rate of weight change");
        suggestions.push("Balanced meal planning");
        suggestions.push("Understanding metabolism");
        suggestions.push("Exercise for weight management");
        suggestions.push("Emotional aspects of eating");
        suggestions.push("Setting realistic health goals");
        suggestions.push("Tracking progress beyond the scale");
        break;
    }
    
    // If conversation history is available, look for patterns
    if (conversationHistory && conversationHistory.length > 0) {
      // Get the last 5 messages
      const recentMessages = conversationHistory.slice(-5);
      
      // Check for recurring topics
      const topicMentions = {
        sleep: 0,
        pain: 0,
        diet: 0,
        stress: 0,
        exercise: 0,
        medication: 0,
        mental: 0,
        doctor: 0
      };
      
      recentMessages.forEach(msg => {
        const text = msg.text.toLowerCase();
        if (text.includes('sleep') || text.includes('tired') || text.includes('fatigue') || text.includes('insomnia')) topicMentions.sleep++;
        if (text.includes('pain') || text.includes('hurt') || text.includes('ache') || text.includes('sore')) topicMentions.pain++;
        if (text.includes('food') || text.includes('diet') || text.includes('nutrition') || text.includes('eat')) topicMentions.diet++;
        if (text.includes('stress') || text.includes('anxiety') || text.includes('worry') || text.includes('nervous')) topicMentions.stress++;
        if (text.includes('exercise') || text.includes('workout') || text.includes('activity') || text.includes('fitness')) topicMentions.exercise++;
        if (text.includes('medication') || text.includes('medicine') || text.includes('drug') || text.includes('pill')) topicMentions.medication++;
        if (text.includes('mental') || text.includes('mood') || text.includes('emotion') || text.includes('feel')) topicMentions.mental++;
        if (text.includes('doctor') || text.includes('hospital') || text.includes('appointment') || text.includes('provider')) topicMentions.doctor++;
      });
      
      // Add suggestions for frequently mentioned topics
      if (topicMentions.sleep >= 2) {
        suggestions.push("Sleep improvement strategies");
        suggestions.push("Creating a sleep-friendly bedroom");
        suggestions.push("Understanding sleep cycles");
      }
      
      if (topicMentions.pain >= 2) {
        suggestions.push("Pain management techniques");
        suggestions.push("Understanding chronic pain");
        suggestions.push("Alternative pain therapies");
      }
      
      if (topicMentions.diet >= 2) {
        suggestions.push("Balanced meal principles");
        suggestions.push("Nutrition myths debunked");
        suggestions.push("Mindful eating strategies");
      }
      
      if (topicMentions.stress >= 2) {
        suggestions.push("Stress reduction techniques");
        suggestions.push("Building emotional resilience");
        suggestions.push("Meditation for beginners");
      }
      
      if (topicMentions.exercise >= 2) {
        suggestions.push("Exercise benefits for health");
        suggestions.push("Finding physical activities you enjoy");
        suggestions.push("Creating a balanced workout routine");
      }
      
      if (topicMentions.medication >= 2) {
        suggestions.push("Medication adherence strategies");
        suggestions.push("Understanding medication interactions");
        suggestions.push("Questions to ask before starting medications");
      }
      
      if (topicMentions.mental >= 2) {
        suggestions.push("Mental health self-care practices");
        suggestions.push("Finding mental health support");
        suggestions.push("Digital mental health resources");
      }
      
      if (topicMentions.doctor >= 2) {
        suggestions.push("Preparing for medical appointments");
        suggestions.push("Questions to ask healthcare providers");
        suggestions.push("Medical record organization tips");
      }
    }
    
    // Add seasonally relevant suggestions
    const currentMonth = new Date().getMonth();
    
    // Winter (Dec-Feb)
    if (currentMonth === 11 || currentMonth === 0 || currentMonth === 1) {
      suggestions.push("Winter wellness strategies");
      suggestions.push("Cold and flu prevention");
      suggestions.push("Managing dry winter skin");
      suggestions.push("Indoor exercise options");
      suggestions.push("Seasonal affective disorder");
    }
    // Spring (Mar-May)
    else if (currentMonth >= 2 && currentMonth <= 4) {
      suggestions.push("Spring allergy management");
      suggestions.push("Outdoor exercise safety");
      suggestions.push("Spring cleaning health benefits");
      suggestions.push("Seasonal produce nutrition");
      suggestions.push("Sun protection guidelines");
    }
    // Summer (Jun-Aug)
    else if (currentMonth >= 5 && currentMonth <= 7) {
      suggestions.push("Heat-related illness prevention");
      suggestions.push("Summer hydration strategies");
      suggestions.push("Safe outdoor exercise in heat");
      suggestions.push("Sun safety and skin protection");
      suggestions.push("Managing summer allergies");
    }
    // Fall (Sep-Nov)
    else {
      suggestions.push("Fall allergy management");
      suggestions.push("Flu vaccination information");
      suggestions.push("Boosting immunity for winter");
      suggestions.push("Seasonal produce nutrition");
      suggestions.push("Transition to indoor exercise");
    }
    
    // Randomize and trim to 5 most relevant suggestions
    suggestions.sort(() => 0.5 - Math.random());
    return suggestions.slice(0, 5);
  },
  // Speech synthesis for accessibility
  speakResponse: (text) => {
    // Check if browser supports speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Clean text for better speech synthesis - remove markdown and formatting
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')    // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1')        // Remove italic markdown
        .replace(/\n\n/g, '. ')             // Replace double newlines with periods
        .replace(/\n/g, ' ')                // Replace single newlines with spaces
        .replace(/•\s/g, '. ')              // Replace bullet points with periods
        .replace(/\s{2,}/g, ' ')            // Replace multiple spaces with a single space
        .replace(/[#_*]/g, '')              // Remove special markdown characters
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Extract link text from markdown links
        .trim();
      
      utterance.text = cleanText;
      
      // Get voices
      let voices = window.speechSynthesis.getVoices();
      
      // If voices aren't loaded yet, wait for them
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoice();
        };
      } else {
        setVoice();
      }
      
      function setVoice() {
        // Find a suitable voice - preferably female for medical assistant
        // Try to find higher quality voices first
        const preferredVoices = [
          'Google UK English Female',
          'Microsoft Zira Desktop',
          'Samantha',
          'Victoria',
          'Female'
        ];
        
        let selectedVoice = null;
        
        // First try to find a voice from our preferred list
        for (const preferred of preferredVoices) {
          const match = voices.find(voice => voice.name.includes(preferred));
          if (match) {
            selectedVoice = match;
            break;
          }
        }
        
        // If no preferred voice found, try any female voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.name.includes('female') || 
            voice.name.includes('woman') || 
            voice.name.includes('girl')
          );
        }
        
        // Fall back to any available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Configure for natural speech
        utterance.rate = 1.0;     // Normal speed
        utterance.pitch = 1.1;    // Slightly higher pitch for better clarity
        utterance.volume = 1.0;   // Full volume
        
        // Add pause markers for better phrasing
        utterance.text = utterance.text
          .replace(/\.\s/g, '... ') // Add slight pause after periods
          .replace(/,\s/g, ', ')    // Add micro pause after commas
          .replace(/:\s/g, ':.. '); // Add medium pause after colons
        
        // Speak
        window.speechSynthesis.speak(utterance);
      }
      
      return true;
    }
    
    return false;
  },
  
  // Process speech recognition
  processVoiceInput: (transcript, setInput, handleSendMessage) => {
    // Cleanup transcript
    const cleanedTranscript = transcript.trim();
    
    // Set to input field
    setInput(cleanedTranscript);
    
    // Auto-send if confidence is high and it looks like a complete sentence
    // (ends with punctuation or is longer than 8 words)
    if (cleanedTranscript.match(/[.?!]$/) || 
       cleanedTranscript.split(/\s+/).length > 8) {
      handleSendMessage({ preventDefault: () => {} });
      return true;
    }
    
    return false;
  },
  
  // Convenience function for detecting supported accessibility features
  checkAccessibilitySupport: () => {
    return {
      speechSynthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
      speechRecognition: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
      localStorage: typeof window !== 'undefined' && 'localStorage' in window,
      notifications: typeof window !== 'undefined' && 'Notification' in window,
      vibration: typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator,
      touchscreen: typeof window !== 'undefined' && 'ontouchstart' in window,
      darkMode: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
      reducedMotion: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches
    };
  },
  
  // Format date for accessibility and consistency
  formatDate: (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(date).toLocaleDateString(undefined, options);
  },
  
  // Format time in user-friendly way
  formatTime: (date) => {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    };
    return new Date(date).toLocaleTimeString(undefined, options);
  },
  // Advanced personalized response generation
  generateResponse: (userInput, entities, intent, sentiment, userProfile, conversationHistory) => {
    // Base response structure
    let response = {
      text: "",
      suggestedQueries: [],
      urgencyLevel: entities.urgency || "normal",
      healthInfoCards: []
    };
    
    // 1. Handle critical emergency cases as top priority
    if (entities.urgency === 'critical') {
      let emergencyResponse = "🚨 **EMERGENCY ALERT: Please seek immediate medical attention** 🚨\n\n";
      
      // Heart attack
      if (entities.symptoms.some(s => s.includes('chest pain')) || 
          (entities.symptoms.some(s => s.includes('pain')) && entities.bodyParts.some(p => p.includes('chest')))) {
        emergencyResponse += "**You may be experiencing symptoms of a heart attack.**\n\n" +
                           "**IMMEDIATE ACTIONS:**\n" +
                           "• Call emergency services (911/108) immediately\n" +
                           "• Chew aspirin if available and not allergic\n" +
                           "• Rest in a comfortable position\n" +
                           "• Loosen tight clothing\n\n" +
                           "**NOTE:** This is a life-threatening emergency requiring immediate professional medical care.";
        
        response.healthInfoCards.push({
          type: "emergency",
          title: "Heart Attack Warning Signs",
          content: "Chest pain/pressure (like a weight), pain radiating to arm/jaw/back, shortness of breath, cold sweat, nausea, lightheadedness."
        });
      }
      // Stroke
      else if (entities.symptoms.some(s => s.includes('face drooping')) || 
              entities.symptoms.some(s => s.includes('arm weakness')) || 
              entities.symptoms.some(s => s.includes('speech')) ||
              entities.conditions.some(c => c.includes('stroke'))) {
        emergencyResponse += "**You may be experiencing symptoms of a stroke.**\n\n" +
                           "**FAST - Stroke Warning Signs:**\n" +
                           "• **F**ace drooping\n" +
                           "• **A**rm weakness\n" +
                           "• **S**peech difficulty\n" +
                           "• **T**ime to call 911/108\n\n" +
                           "**IMMEDIATE ACTION:** Call emergency services immediately. Note the time when symptoms started.";
        
        response.healthInfoCards.push({
          type: "emergency",
          title: "Stroke - Time is Critical",
          content: "Every minute counts. Emergency treatment can minimize brain damage. Note when symptoms began."
        });
      }
      // Breathing difficulty
      else if (entities.symptoms.some(s => s.includes('breathing')) || 
              entities.symptoms.some(s => s.includes('breathe'))) {
        emergencyResponse += "**You may be experiencing severe breathing difficulty.**\n\n" +
                           "**IMMEDIATE ACTION:** Call emergency services (911/108) immediately.\n\n" +
                           "• Sit upright if possible to ease breathing\n" +
                           "• Loosen any tight clothing\n" +
                           "• If you have prescribed rescue medications like an inhaler, use as directed\n\n" +
                           "**NOTE:** Severe breathing difficulty is a medical emergency requiring immediate attention.";
        
        response.healthInfoCards.push({
          type: "emergency",
          title: "Severe Breathing Difficulty",
          content: "May indicate severe asthma attack, allergic reaction, pulmonary embolism, or other serious conditions."
        });
      }
      // Severe bleeding
      else if (entities.symptoms.some(s => s.includes('bleeding'))) {
        emergencyResponse += "**You may be experiencing severe bleeding.**\n\n" +
                           "**IMMEDIATE ACTIONS:**\n" +
                           "• Call emergency services (911/108)\n" +
                           "• Apply direct pressure to the wound with clean cloth\n" +
                           "• If possible, elevate the injured area above heart level\n" +
                           "• Do not remove pressure to check bleeding\n" +
                           "• Apply more bandages over soaked ones\n\n" +
                           "**NOTE:** Severe bleeding can be life-threatening and requires immediate medical attention.";
        
        response.healthInfoCards.push({
          type: "emergency",
          title: "Control Severe Bleeding",
          content: "Apply firm, direct pressure. Don't remove blood-soaked bandages; add more on top."
        });
      }
      // Suicidal thoughts
      else if (/\b(suicid|kill myself|end my life|don't want to live|no reason to live|wanting to die)\b/i.test(userInput.toLowerCase())) {
        emergencyResponse += "**I'm deeply concerned about what you've shared and want to ensure you get the help you need right away.**\n\n" +
                           "**IMMEDIATE ACTIONS:**\n" +
                           "• Call a suicide prevention hotline immediately:\n" +
                           "  - US: 988 or 1-800-273-8255 (National Suicide Prevention Lifeline)\n" +
                           "  - International: https://www.befrienders.org\n" +
                           "• Or text CHAT to 741741 to reach Crisis Text Line\n" +
                           "• Go to your nearest emergency room\n" +
                           "• Call emergency services (911/108)\n" +
                           "• If possible, tell a trusted person where you are\n\n" +
                           "**Please know:** You're not alone. These feelings can be overwhelming, but there are people ready to listen and help. Mental health crises are real medical emergencies, and professional support is available.";
        
        response.healthInfoCards.push({
          type: "emergency",
          title: "Mental Health Crisis Resources",
          content: "24/7 Suicide Prevention Lifeline: 988 or 1-800-273-8255. Crisis Text Line: Text CHAT to 741741. These services provide immediate, confidential support."
        });
      }
      // Default emergency
      else {
        emergencyResponse += "**Your symptoms suggest a potential medical emergency.**\n\n" +
                           "**IMMEDIATE ACTION:** Call emergency services (911/108) immediately for professional evaluation and treatment.\n\n" +
                           "This is not a substitute for emergency medical care. Please seek immediate professional help.";
      }
      
      emergencyResponse += "\n\n⚠️ **EMERGENCY NOTICE**: This information is for guidance only. In actual emergencies, call 911/108 immediately. This is not a substitute for professional emergency care.";
      
      response.text = emergencyResponse;
      response.urgencyLevel = "critical";
      
      // Suggest appropriate follow-up queries for after emergency care
      response.suggestedQueries = [
        "When to follow up after emergency care?",
        "Warning signs to watch for after discharge",
        "Emergency preparedness tips",
        "How to create a medical history document",
        "Questions to ask emergency doctors"
      ];
      
      return response;
    }
    
    // 2. High urgency situations
    if (entities.urgency === 'high') {
      let urgentResponse = "⚠️ **URGENT HEALTH CONCERN DETECTED** ⚠️\n\n";
      urgentResponse += "Your message suggests a potentially serious health issue that may require prompt medical attention.\n\n";
      
      // Symptom specific guidance
      if (entities.symptoms.length > 0) {
        urgentResponse += `Your symptoms (${entities.symptoms.join(', ')}) could indicate a condition requiring medical evaluation soon.\n\n`;
        
        urgentResponse += "**Recommended actions:**\n";
        urgentResponse += "• Contact your healthcare provider today\n";
        urgentResponse += "• If symptoms worsen, seek immediate emergency care\n";
        urgentResponse += "• Document when symptoms began and any changes\n";
        urgentResponse += "• Avoid self-medicating without professional advice\n\n";
      } else {
        urgentResponse += "**Recommended actions:**\n";
        urgentResponse += "• Contact your healthcare provider promptly\n";
        urgentResponse += "• If condition worsens, seek immediate medical care\n";
        urgentResponse += "• Keep a record of your symptoms and their progression\n";
      }
      
      urgentResponse += "While this appears urgent, I cannot provide a medical diagnosis. Professional medical evaluation is necessary.";
      
      response.text = urgentResponse;
      response.urgencyLevel = "high";
      
      response.healthInfoCards.push({
        type: "warning",
        title: "When to Seek Urgent Care vs. Emergency Care",
        content: "Urgent care: Same-day attention needed. Emergency: Life-threatening situations requiring immediate care."
      });
      
      // Suggest appropriate follow-up queries
      response.suggestedQueries = [
        "Difference between urgent care and ER",
        "What to bring to doctor appointment",
        "How to track symptoms effectively",
        "Questions to ask your doctor",
        entities.symptoms.length > 0 ? `When to worry about ${entities.symptoms[0]}` : "When to worry about worsening symptoms"
      ];
      
      return response;
    }
    // 3. Handle normal interactions based on intent
    let mainResponse = "";
    
    // Add personalized greeting using sentiment analysis
    if (intent.primary === 'greeting') {
      if (sentiment.sentiment.includes('positive')) {
        mainResponse = "Hello! It's great to hear you're doing well. I'm Dr. Health, your AI medical assistant, here to help with any health questions you might have.";
      } else if (sentiment.sentiment.includes('negative')) {
        mainResponse = "Hello. I'm sorry to hear you're not feeling your best. I'm Dr. Health, your AI medical assistant, and I'm here to help however I can with health information.";
      } else {
        mainResponse = "Hello! I'm Dr. Health, your AI medical assistant. I can provide evidence-based health information on topics including emergency care, wellness, nutrition, exercise, and condition management. How may I help you today?";
      }
      
      // If returning user, personalize further
      if (userProfile && (userProfile.knownConditions.length > 0 || userProfile.medications.length > 0)) {
        mainResponse += "\n\nBased on our previous conversations, ";
        
        if (userProfile.knownConditions.length > 0) {
          mainResponse += `I remember we've discussed your ${userProfile.knownConditions.join(', ')}. `;
        }
        
        if (userProfile.medications.length > 0) {
          mainResponse += `You've mentioned taking ${userProfile.medications.join(', ')}. `;
        }
        
        mainResponse += "How are you managing today?";
      }
      
      // Time-based greeting additions
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        mainResponse += "\n\nI hope your morning is going well. Is there anything specific about your health I can help with today?";
      } else if (currentHour < 18) {
        mainResponse += "\n\nI hope your day is going well. What health topic can I assist you with this afternoon?";
      } else {
        mainResponse += "\n\nI hope you're having a pleasant evening. What health questions can I help answer tonight?";
      }
      
      response.suggestedQueries = [
        "Daily health tips",
        "Common health myths",
        "Preventive health screenings",
        "Healthy lifestyle habits",
        "Mental wellness strategies"
      ];
    }
    // Symptom checking
    else if (intent.primary === 'symptomCheck') {
      mainResponse = "I notice you're asking about ";
      
      if (entities.symptoms.length > 0) {
        mainResponse += `symptoms including ${entities.symptoms.join(', ')}`;
        
        if (entities.bodyParts.length > 0) {
          mainResponse += ` affecting your ${entities.bodyParts.join(', ')}`;
        }
        
        mainResponse += ". ";
        
        // Add timing context if available
        if (entities.timing.onset) {
          mainResponse += `These symptoms began ${entities.timing.onset}. `;
        }
        
        if (entities.timing.duration) {
          mainResponse += `You've experienced them for ${entities.timing.duration}. `;
        }
        
        // Add personalized information if there are matching conditions
        if (userProfile && userProfile.knownConditions.length > 0) {
          mainResponse += `\n\nConsidering your history of ${userProfile.knownConditions.join(', ')}, `;

          // Complex response based on known conditions
          if (userProfile.knownConditions.some(c => c.includes('diabetes')) && 
              (entities.symptoms.some(s => s.includes('thirst')) || entities.symptoms.some(s => s.includes('urination')))) {
            mainResponse += "these symptoms might be related to blood sugar management. It's important to monitor your glucose levels and consult your healthcare provider if you notice persistent changes. ";
          } else if (userProfile.knownConditions.some(c => c.includes('asthma')) && 
                   entities.symptoms.some(s => s.includes('breathing'))) {
            mainResponse += "respiratory symptoms should be taken seriously. Make sure to use your prescribed medications and seek medical care if your rescue inhaler isn't providing relief. ";
          } else if (userProfile.knownConditions.some(c => c.includes('hypertension') || c.includes('blood pressure')) && 
                   (entities.symptoms.some(s => s.includes('headache')) || entities.symptoms.some(s => s.includes('dizzy')))) {
            mainResponse += "these symptoms could potentially be related to blood pressure changes. It's advisable to check your blood pressure and consult your healthcare provider if you notice consistent changes in your readings or worsening symptoms. ";
          } else if (userProfile.knownConditions.some(c => c.includes('heart')) && 
                   (entities.symptoms.some(s => s.includes('chest')) || entities.symptoms.some(s => s.includes('breath')) || entities.symptoms.some(s => s.includes('fatigue')))) {
            mainResponse += "these symptoms should be evaluated promptly given your cardiac history. Please contact your healthcare provider or seek emergency care if you experience chest pain, shortness of breath, or unusual fatigue. ";
          } else {
            mainResponse += "it's especially important to monitor any new symptoms and discuss them with your healthcare provider. ";
          }
        }
        
        mainResponse += "\n\n**General information:**\n";
        
        // Provide relevant information about specific symptoms
        if (entities.symptoms.some(s => s.includes('headache'))) {
          mainResponse += "**Headaches** can be caused by many factors including tension, migraines, dehydration, lack of sleep, eye strain, or stress. While most headaches aren't serious, persistent or severe headaches, especially when accompanied by other symptoms, warrant medical attention.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Headache Management",
            content: "Rest in a quiet, dark room. Apply cold or warm compress. Stay hydrated. Consider over-the-counter pain relievers if appropriate."
          });
        }
        if (entities.symptoms.some(s => s.includes('fever'))) {
          mainResponse += "**Fever** is often a sign that your body is fighting an infection. Adult fevers above 103°F (39.4°C) or any fever lasting more than 3 days should be evaluated by a healthcare provider. For children, consult age-appropriate guidelines for when to seek care.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Fever Management",
            content: "Rest and stay hydrated. Use appropriate dose of acetaminophen or ibuprofen if needed. Seek care for very high fevers or concerning symptoms."
          });
        }
        if (entities.symptoms.some(s => s.includes('cough'))) {
          mainResponse += "**Coughing** is a natural reflex to clear the airways. Acute coughs (lasting less than 3 weeks) are often due to viral infections, while chronic coughs may indicate underlying conditions like asthma, GERD, or allergies.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Cough Relief Strategies",
            content: "Stay hydrated. Use a humidifier. Try honey for soothing (adults and children over 1). Avoid irritants like smoke."
          });
        }
        if (entities.symptoms.some(s => s.includes('fatigue'))) {
          mainResponse += "**Fatigue** can result from many causes including inadequate sleep, poor nutrition, stress, depression, anemia, thyroid disorders, or infections. Persistent unexplained fatigue warrants medical evaluation.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Energy Management",
            content: "Prioritize 7-9 hours of quality sleep. Stay hydrated. Eat balanced meals with protein and complex carbs. Consider short daytime rest periods."
          });
        }
        if (entities.symptoms.some(s => s.includes('dizziness')) || entities.symptoms.some(s => s.includes('dizzy'))) {
          mainResponse += "**Dizziness** can be caused by inner ear issues, blood pressure changes, medication side effects, dehydration, anemia, or anxiety. Sudden or severe dizziness with other symptoms needs prompt medical attention.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Managing Dizziness",
            content: "Move slowly when changing positions. Stay hydrated. Avoid triggers. If feeling dizzy, sit or lie down immediately and wait for it to pass."
          });
        }
        
        mainResponse += "While I can provide general health information, I cannot diagnose conditions or replace professional medical advice. ";
        
        if (entities.symptoms.some(s => s.includes('severe')) || 
           entities.symptoms.includes('chest pain') || 
           entities.symptoms.includes('difficulty breathing') ||
           entities.symptoms.includes('severe headache') ||
           entities.symptoms.includes('severe abdominal pain')) {
          mainResponse += "**Based on what you've shared, I recommend consulting a healthcare provider promptly about these symptoms.**";
        } else {
          mainResponse += "If symptoms persist or worsen, please consult with a healthcare provider for proper evaluation.";
        }
        
        // Generate symptom-specific suggested queries
        response.suggestedQueries = [
          `What causes ${entities.symptoms[0]}?`,
          entities.symptoms.length > 0 ? `Home remedies for ${entities.symptoms[0]}` : "General symptom tracking advice",
          "When to see a doctor?",
          "How to prepare for doctor visit",
          entities.symptoms.some(s => s.includes('pain')) ? "Pain management techniques" : "Immune system support strategies"
        ];
      } else {
        mainResponse += "health symptoms, but I don't have specific details about what you're experiencing. ";
        mainResponse += "To provide more helpful information, could you share what symptoms you're concerned about, when they started, and if anything makes them better or worse?";
        
        response.suggestedQueries = [
          "Common cold symptoms",
          "Flu vs. cold differences",
          "Seasonal allergy symptoms",
          "Stress-related symptoms",
          "When to worry about symptoms"
        ];
      }
    }
    // Medication information
    else if (intent.primary === 'medicationInfo') {
      mainResponse = "I see you're asking about medication information. ";
      
      if (entities.medications.length > 0) {
        mainResponse += `Specifically about ${entities.medications.join(', ')}.\n\n`;
        mainResponse += "While I can provide general information about medications, please remember that medication advice should be personalized by healthcare providers based on your complete medical history.\n\n";
        
        mainResponse += "**General medication guidance:**\n";
        mainResponse += "• Always take medications exactly as prescribed\n";
        mainResponse += "• Don't stop medications without consulting your healthcare provider\n";
        mainResponse += "• Store medications properly (typically cool, dry place away from sunlight)\n";
        mainResponse += "• Keep track of side effects and discuss them with your provider\n";
        mainResponse += "• Ensure your healthcare providers know ALL medications you take, including over-the-counter and supplements\n\n";
        
        if (entities.medications.some(m => m.includes('antibiotic'))) {
          mainResponse += "**For antibiotics:** It's important to complete the full course as prescribed, even if you start feeling better. This helps prevent antibiotic resistance.";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Antibiotic Best Practices",
            content: "Complete the full course. Take at scheduled times. Don't save for later use. Report serious side effects."
          });
        }
        
        if (entities.medications.some(m => m.includes('pain') || m.includes('ibuprofen') || m.includes('acetaminophen') || m.includes('naproxen'))) {
          mainResponse += "**For pain relievers:** Take with food to reduce stomach upset. Be aware of maximum daily doses to prevent liver or kidney damage. Consult your healthcare provider before long-term use.";
          
          response.healthInfoCards.push({
            type: "warning",
            title: "Pain Medication Caution",
            content: "Avoid combining different pain medications without medical advice. Monitor for stomach pain, unusual bruising, or dark stools."
          });
        }
        
        if (entities.medications.some(m => m.includes('blood pressure') || m.includes('lisinopril') || m.includes('metoprolol') || m.includes('amlodipine'))) {
          mainResponse += "**For blood pressure medications:** Take consistently at the same time each day. Monitor your blood pressure regularly. Don't skip doses, and talk to your doctor if you experience side effects rather than stopping on your own.";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Blood Pressure Medication Tips",
            content: "Take at same time daily. Maintain lifestyle modifications. Report dizziness, persistent cough, or swelling to your doctor."
          });
        }
        
        if (entities.medications.some(m => m.includes('diabetes') || m.includes('insulin') || m.includes('metformin'))) {
          mainResponse += "**For diabetes medications:** Consistent timing with meals is often important. Monitor your blood glucose as recommended. Be aware of hypoglycemia symptoms, and always have fast-acting glucose available.";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Diabetes Medication Management",
            content: "Monitor glucose patterns. Have hypoglycemia treatment available. Keep medications at appropriate temperatures."
          });
        }
        
        response.suggestedQueries = [
          entities.medications.length > 0 ? `${entities.medications[0]} side effects` : "Common medication side effects",
          "Medication storage guidelines",
          "Questions to ask pharmacist",
          "How to remember to take medications",
          "Medication and food interactions"
        ];
      } else {
        mainResponse += "To provide helpful information, could you specify which medication you're asking about?";
        
        mainResponse += "\n\n**General medication safety tips:**\n";
        mainResponse += "• Keep an updated list of all your medications\n";
        mainResponse += "• Use pill organizers to maintain schedule\n";
        mainResponse += "• Disclose all supplements to your healthcare provider\n";
        mainResponse += "• Check for drug interactions when starting new medications\n";
        mainResponse += "• Never share prescription medications\n";
        
        response.suggestedQueries = [
          "Medication tracking apps",
          "Questions for pharmacist",
          "Common medication errors",
          "Over-the-counter medication safety",
          "Understanding drug interactions"
        ];
      }
    }
    // Nutrition advice
    else if (intent.primary === 'nutritionAdvice') {
      mainResponse = "I'd be happy to discuss nutrition information. ";
      
      // Personalize based on known conditions
      if (userProfile && userProfile.knownConditions.length > 0) {
        mainResponse += `With your history of ${userProfile.knownConditions.join(', ')}, dietary choices can be particularly important.\n\n`;
        
        if (userProfile.knownConditions.some(c => c.includes('diabetes'))) {
          mainResponse += "**For diabetes management:** Focus on consistent carbohydrate intake, emphasize fiber-rich foods, limit added sugars, and monitor how different foods affect your blood glucose levels. Working with a registered dietitian can help create a personalized meal plan.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Diabetes-Friendly Food Choices",
            content: "Non-starchy vegetables, whole grains, lean proteins, healthy fats, and low-sugar fruits. Limit refined carbs and processed foods."
          });
        }
        
        if (userProfile.knownConditions.some(c => c.includes('hypertension') || c.includes('blood pressure'))) {
          mainResponse += "**For blood pressure management:** The DASH diet approach is often recommended, focusing on fruits, vegetables, whole grains, lean proteins, and limiting sodium intake. Aim for less than 2,300mg of sodium daily (ideally less than 1,500mg for many with hypertension).\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Blood Pressure Management",
            content: "Reduce sodium, increase potassium from fruits and vegetables, limit alcohol, stay physically active, and maintain healthy weight."
          });
        }
        
        if (userProfile.knownConditions.some(c => c.includes('cholesterol'))) {
          mainResponse += "**For cholesterol management:** Focus on heart-healthy fats (olive oil, avocados, nuts), fiber-rich foods, lean proteins, and limit saturated fats and trans fats. Including plant sterols and stanols may also help lower LDL cholesterol.\n\n";
        }
        
        if (userProfile.knownConditions.some(c => c.includes('gerd') || c.includes('reflux') || c.includes('acid'))) {
          mainResponse += "**For managing GERD/acid reflux:** Consider smaller, more frequent meals, avoiding eating close to bedtime, and limiting trigger foods which may include spicy foods, tomato-based products, citrus, chocolate, mint, fatty foods, and caffeine.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Acid Reflux Diet Modifications",
            content: "Avoid eating 2-3 hours before lying down. Elevate head during sleep. Identify and avoid personal trigger foods. Consider smaller, more frequent meals."
          });
        }
      } else {
        // General nutrition advice
        mainResponse += "Here's some evidence-based nutrition information:\n\n";
      }
      
      mainResponse += "**General nutrition principles:**\n";
      mainResponse += "• Focus on whole, minimally processed foods\n";
      mainResponse += "• Include a variety of colorful fruits and vegetables daily\n";
      mainResponse += "• Choose whole grains over refined grains\n";
      mainResponse += "• Select lean protein sources\n";
      mainResponse += "• Include healthy fats from sources like olive oil, avocados, and nuts\n";
      mainResponse += "• Stay well hydrated, primarily with water\n";
      mainResponse += "• Limit added sugars, sodium, and highly processed foods\n\n";
      
      mainResponse += "A balanced eating pattern like the Mediterranean diet or DASH diet has strong evidence for supporting overall health and reducing chronic disease risk.\n\n";
      
      mainResponse += "Remember that individual nutritional needs vary based on age, activity level, health conditions, and other factors. Consulting with a registered dietitian can provide personalized guidance.";
      
      response.suggestedQueries = [
        "Mediterranean diet basics",
        "Plant-based protein sources",
        "Healthy meal prep tips",
        "Understanding food labels",
        "Hydration guidelines"
      ];
    }
    // Exercise advice
    else if (intent.primary === 'exerciseAdvice') {
      mainResponse = "I'd be happy to discuss physical activity information. ";
      
      // Personalize based on known conditions
      if (userProfile && userProfile.knownConditions.length > 0) {
        mainResponse += `With your history of ${userProfile.knownConditions.join(', ')}, appropriate exercise is particularly important.\n\n`;
        
        if (userProfile.knownConditions.some(c => c.includes('arthritis'))) {
          mainResponse += "**For arthritis:** Low-impact activities like swimming, water aerobics, cycling, and walking are generally well-tolerated. Range-of-motion and strengthening exercises can help maintain joint function. Working with a physical therapist can be beneficial for a personalized program.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Exercise With Arthritis",
            content: "Start gently, warm up properly, listen to your body, and consider aquatic exercises for joint-friendly movement."
          });
        }
        
        if (userProfile.knownConditions.some(c => c.includes('heart') || c.includes('cardiac'))) {
          mainResponse += "**For heart conditions:** It's essential to follow your healthcare provider's guidance on exercise. Cardiac rehabilitation programs provide supervised exercise tailored to your condition. Monitoring intensity and gradually building endurance is important.\n\n";
          
          response.healthInfoCards.push({
            type: "warning",
            title: "Heart-Safe Exercise",
            content: "Start with medical clearance, progress gradually, monitor your heart rate, and stop if you experience chest pain, dizziness, or unusual shortness of breath."
          });
        }
        
        if (userProfile.knownConditions.some(c => c.includes('diabetes'))) {
          mainResponse += "**For diabetes:** Regular physical activity can help improve insulin sensitivity and blood glucose management. Monitor your blood glucose before, during, and after exercise, especially when starting new activities. Keep fast-acting carbohydrates available for low blood sugar.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Exercise With Diabetes",
            content: "Check glucose before and after activity. Carry fast-acting carbs for hypoglycemia. Stay hydrated. Adjust medication timing if needed (consult provider)."
          });
        }
        
        if (userProfile.knownConditions.some(c => c.includes('osteoporosis') || c.includes('bone density'))) {
          mainResponse += "**For osteoporosis:** Weight-bearing exercises and resistance training are particularly important for bone health. Balance training can help reduce fall risk. Avoid high-impact activities and exercises with excessive forward bending or twisting that could increase fracture risk.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Bone-Strengthening Exercises",
            content: "Weight-bearing activities like walking and dancing, plus resistance training. Avoid high-impact movements and exercises with extreme spinal flexion."
          });
        }
      } else {
        // General exercise advice
        mainResponse += "Here's some evidence-based physical activity information:\n\n";
      }
      
      mainResponse += "**General exercise guidelines:**\n";
      mainResponse += "• Aim for at least 150 minutes of moderate-intensity aerobic activity weekly\n";
      mainResponse += "• Include muscle-strengthening activities 2+ days per week\n";
      mainResponse += "• Add flexibility and balance exercises, especially as you age\n";
      mainResponse += "• Reduce sitting time and break up long periods of inactivity\n";
      mainResponse += "• Start gradually and progress slowly if you're new to exercise\n\n";
      
      mainResponse += "Even small amounts of physical activity provide health benefits, and the greatest gains come from moving from being inactive to achieving some regular activity.\n\n";
      
      mainResponse += "Finding activities you enjoy increases the likelihood you'll stick with them long-term. Consider both structured exercise and ways to increase daily movement, like taking stairs or walking for transportation.";
      
      response.suggestedQueries = [
        "Beginner exercise plan",
        "Home workout without equipment",
        "Strength training basics",
        "Walking program benefits",
        "Exercise recovery tips"
      ];
    }
    // Mental health support
    else if (intent.primary === 'mentalHealthSupport') {
      // Adjust tone based on sentiment analysis
      if (sentiment.sentiment.includes('negative') || 
          sentiment.dominant_emotion === 'sadness' || 
          sentiment.dominant_emotion === 'fear' || 
          sentiment.dominant_emotion === 'anger') {
        mainResponse = "I'm sorry to hear you're going through a difficult time. Mental health is just as important as physical health, and it's okay to seek support when needed.\n\n";
      } else {
        mainResponse = "Mental health is an essential component of overall wellbeing. It's wonderful that you're seeking information on this topic.\n\n";
      }
      
      // If specific emotions detected
      if (sentiment.dominant_emotion === 'anxiety' || 
          sentiment.dominant_emotion === 'fear' || 
          entities.symptoms.some(s => s.includes('anxiety') || s.includes('worry') || s.includes('nervous'))) {
        mainResponse += "**For anxiety management:**\n";
        mainResponse += "• Practice deep breathing: Try the 4-7-8 technique (inhale for 4, hold for 7, exhale for 8)\n";
        mainResponse += "• Progressive muscle relaxation: Tense and then release each muscle group\n";
        mainResponse += "• Mindfulness meditation: Focus on the present moment without judgment\n";
        mainResponse += "• Limit caffeine and alcohol which can worsen anxiety\n";
        mainResponse += "• Stay physically active to help reduce anxiety levels\n";
        mainResponse += "• Identify and challenge anxious thoughts\n\n";
        
        response.healthInfoCards.push({
          type: "info",
          title: "Grounding Technique for Anxiety",
          content: "5-4-3-2-1 Method: Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste."
        });
      }
      
      if (sentiment.dominant_emotion === 'sadness' || 
          entities.symptoms.some(s => s.includes('depression') || s.includes('sad') || s.includes('down'))) {
        mainResponse += "**For managing low mood:**\n";
        mainResponse += "• Maintain social connections, even when you don't feel like it\n";
        mainResponse += "• Establish daily routines and structure\n";
        mainResponse += "• Set small, achievable goals to build momentum\n";
        mainResponse += "• Get regular physical activity, which can boost mood\n";
        mainResponse += "• Practice self-compassion and avoid self-criticism\n";
        mainResponse += "• Consider keeping a gratitude journal\n\n";
        
        response.healthInfoCards.push({
          type: "info",
          title: "Mood-Boosting Activities",
          content: "Spend time in nature, listen to uplifting music, engage in creative expression, help others, and expose yourself to morning sunlight."
        });
      }
      
      if (sentiment.dominant_emotion === 'anger' || 
         userInput.toLowerCase().includes('angry') || 
         userInput.toLowerCase().includes('irritated') || 
         userInput.toLowerCase().includes('frustrated')) {
        mainResponse += "**For managing anger and frustration:**\n";
        mainResponse += "• Recognize early warning signs of anger in your body\n";
        mainResponse += "• Take a timeout before responding when emotions run high\n";
        mainResponse += "• Use deep breathing to calm your physiological response\n";
        mainResponse += "• Express your needs and concerns using 'I' statements\n";
        mainResponse += "• Physical activity can help release tension and anger\n";
        mainResponse += "• Challenge distorted thinking that may fuel anger\n\n";
        
        response.healthInfoCards.push({
          type: "info",
          title: "Quick Anger De-escalation",
          content: "Step away if possible, take slow deep breaths, count to 10, use coping statements like 'I can handle this calmly', and postpone important decisions."
        });
      }
      
      mainResponse += "**General mental wellness strategies:**\n";
      mainResponse += "• Prioritize quality sleep\n";
      mainResponse += "• Maintain balanced nutrition\n";
      mainResponse += "• Stay physically active\n";
      mainResponse += "• Practice stress management techniques\n";
      mainResponse += "• Set boundaries and learn to say no\n";
      mainResponse += "• Limit social media and news consumption if it increases distress\n\n";
      
      mainResponse += "**When to seek professional help:**\n";
      mainResponse += "• Symptoms interfere with daily functioning\n";
      mainResponse += "• Persistent feelings of hopelessness or emptiness\n";
      mainResponse += "• Significant changes in sleep, appetite, or energy\n";
      mainResponse += "• Thoughts of harming yourself or others\n";
      mainResponse += "• Inability to manage distress with self-help strategies\n\n";
      
      mainResponse += "Mental health professionals can provide evidence-based treatments like cognitive-behavioral therapy, medication if appropriate, and other effective interventions. Remember that seeking help is a sign of strength, not weakness.";
      
      response.suggestedQueries = [
        "Meditation techniques for beginners",
        "Self-care routine ideas",
        "Stress management strategies",
        "Finding mental health support",
        "Sleep improvement tips"
      ];
    }
    // Preventive care
    else if (intent.primary === 'preventiveCare') {
      mainResponse = "Preventive healthcare is one of the most effective ways to maintain health and detect potential issues early. ";
      
      // Age-specific recommendations if available
      if (entities.demographics.age) {
        const age = entities.demographics.age;
        mainResponse += `Here are some age-appropriate preventive care recommendations for someone who is ${age} years old:\n\n`;
        
        if (age < 18) {
          mainResponse += "**For children and adolescents:**\n";
          mainResponse += "• Regular well-child visits following the recommended schedule\n";
          mainResponse += "• Standard immunizations according to the CDC schedule\n";
          mainResponse += "• Vision and hearing screenings\n";
          mainResponse += "• Dental check-ups every 6 months\n";
          mainResponse += "• Mental health screenings\n";
          mainResponse += "• Regular physical activity and healthy nutrition\n";
        } else if (age >= 18 && age < 40) {
          mainResponse += "**For adults 18-39:**\n";
          mainResponse += "• Blood pressure screening at least every 3-5 years\n";
          mainResponse += "• Cholesterol screening every 4-6 years\n";
          mainResponse += "• Diabetes screening if risk factors present\n";
          mainResponse += "• Immunizations: annual flu vaccine, Td/Tdap every 10 years\n";
          mainResponse += "• Skin cancer screening, especially with risk factors\n";
          mainResponse += "• Dental check-ups every 6-12 months\n";
          mainResponse += "• Eye examinations every 2-3 years\n";
          
          if (entities.demographics.gender === 'female') {
            mainResponse += "• Cervical cancer screening (Pap test) every 3 years starting at 21\n";
            mainResponse += "• Breast self-awareness and clinical breast exams\n";
          }
        } else if (age >= 40 && age < 50) {
          mainResponse += "**For adults 40-49:**\n";
          mainResponse += "• Blood pressure screening annually\n";
          mainResponse += "• Cholesterol screening every 1-2 years\n";
          mainResponse += "• Diabetes screening every 3 years\n";
          mainResponse += "• Immunizations: annual flu vaccine, Td/Tdap every 10 years\n";
          mainResponse += "• Skin cancer screening annually\n";
          mainResponse += "• Dental check-ups every 6-12 months\n";
          mainResponse += "• Eye examinations every 2-3 years\n";
          
          if (entities.demographics.gender === 'female') {
            mainResponse += "• Cervical cancer screening every 3 years\n";
            mainResponse += "• Mammogram as recommended by your healthcare provider\n";
          }
          if (entities.demographics.gender === 'male') {
            mainResponse += "• Prostate cancer screening discussion with healthcare provider\n";
          }
        } else if (age >= 50) {
          mainResponse += "**For adults 50+:**\n";
          mainResponse += "• Blood pressure screening annually\n";
          mainResponse += "• Cholesterol screening every 1-2 years\n";
          mainResponse += "• Diabetes screening every 3 years\n";
          mainResponse += "• Colorectal cancer screening beginning at 45-50\n";
          mainResponse += "• Immunizations: annual flu vaccine, Td/Tdap every 10 years, shingles vaccine, pneumococcal vaccines\n";
          mainResponse += "• Bone density screening (especially for women)\n";
          mainResponse += "• Skin cancer screening annually\n";
          mainResponse += "• Dental check-ups every 6 months\n";
          mainResponse += "• Comprehensive eye examinations annually\n";
          
          if (entities.demographics.gender === 'female') {
            mainResponse += "• Cervical cancer screening every 3-5 years\n";
            mainResponse += "• Mammogram every 1-2 years\n";
          }
          if (entities.demographics.gender === 'male') {
            mainResponse += "• Prostate cancer screening discussion with healthcare provider\n";
            mainResponse += "• Abdominal aortic aneurysm screening (if ever smoked)\n";
          }
        }
      } else {
        mainResponse += "**General preventive health recommendations:**\n";
        mainResponse += "• Regular check-ups with your primary care provider\n";
        mainResponse += "• Age-appropriate health screenings\n";
        mainResponse += "• Staying up-to-date on recommended vaccinations\n";
        mainResponse += "• Dental check-ups every 6-12 months\n";
        mainResponse += "• Regular vision examinations\n";
        mainResponse += "• Skin cancer screenings, especially if high risk\n\n";
        
        mainResponse += "The specific screenings and their frequency will vary based on your age, gender, personal medical history, and family history. Your healthcare provider can recommend a personalized preventive care schedule.";
      }
      
      mainResponse += "\n\n**Lifestyle preventive measures:**\n";
      mainResponse += "• Maintain a balanced, nutritious diet\n";
      mainResponse += "• Engage in regular physical activity\n";
      mainResponse += "• Get adequate sleep\n";
      mainResponse += "• Manage stress effectively\n";
      mainResponse += "• Avoid tobacco products\n";
      mainResponse += "• Limit alcohol consumption\n";
      mainResponse += "• Practice sun safety\n";
      mainResponse += "• Use safety equipment (seat belts, helmets, etc.)\n\n";
      
      mainResponse += "Preventive care is often covered by insurance with minimal or no out-of-pocket costs. Check with your insurance provider about coverage for recommended screenings and preventive services.";
      
      response.suggestedQueries = [
        "Health screening checklist",
        "Immunization schedule for adults",
        "Heart disease prevention",
        "Cancer screening guidelines",
        "Healthy aging strategies"
      ];
    }
    // Sleep advice
    else if (intent.primary === 'sleepAdvice') {
      mainResponse = "Sleep is a crucial component of overall health. Quality sleep supports immune function, mental health, cognitive performance, and physical recovery.\n\n";
      
      mainResponse += "**General sleep recommendations:**\n";
      mainResponse += "• Adults typically need 7-9 hours of sleep per night\n";
      mainResponse += "• Maintain a consistent sleep schedule, even on weekends\n";
      mainResponse += "• Create a restful environment: dark, quiet, cool (65-68°F/18-20°C)\n";
      mainResponse += "• Limit screen exposure 1-2 hours before bedtime\n";
      mainResponse += "• Avoid caffeine, large meals, and alcohol close to bedtime\n";
      mainResponse += "• Develop a relaxing pre-sleep routine\n";
      mainResponse += "• Regular physical activity supports better sleep (but not too close to bedtime)\n\n";
      
      mainResponse += "**For difficulty falling asleep:**\n";
      mainResponse += "• Try relaxation techniques like deep breathing or progressive muscle relaxation\n";
      mainResponse += "• If you can't fall asleep within 20 minutes, get up and do something calming until you feel sleepy\n";
      mainResponse += "• Consider a warm bath or shower before bed to help with temperature regulation\n";
      mainResponse += "• Limit daytime naps, especially in the afternoon\n\n";
      
      mainResponse += "**For difficulty staying asleep:**\n";
      mainResponse += "• Check for environmental disruptions: noise, light, uncomfortable bedding\n";
      mainResponse += "• Consider if pain, frequent urination, or breathing issues might be disrupting sleep\n";
      mainResponse += "• Limit fluid intake in the evening\n";
      mainResponse += "• Manage stress through relaxation techniques or journaling before bed\n\n";
      
      if (userProfile && userProfile.knownConditions.length > 0) {
        if (userProfile.knownConditions.some(c => c.includes('anxiety') || c.includes('stress'))) {
          mainResponse += "**For sleep and anxiety:**\n";
          mainResponse += "• Schedule 'worry time' earlier in the day to process concerns\n";
          mainResponse += "• Practice mindfulness meditation before bed\n";
          mainResponse += "• Keep a notepad by your bed to jot down thoughts that arise\n";
          mainResponse += "• Consider relaxation techniques specifically targeting anxiety\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Sleep Relaxation Script",
            content: "Inhale slowly for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat while visualizing tension leaving with each exhale and relaxation entering with each inhale."
          });
        }
        
        if (userProfile.knownConditions.some(c => c.includes('pain') || c.includes('arthritis'))) {
          mainResponse += "**For sleep and pain management:**\n";
          mainResponse += "• Time pain medication appropriately if prescribed\n";
          mainResponse += "• Consider supportive pillows or mattress for better alignment\n";
          mainResponse += "• Gentle stretching or a warm bath before bed may help reduce discomfort\n";
          mainResponse += "• Relaxation techniques can help manage pain perception\n\n";
        }
      }
      
      mainResponse += "**When to seek professional help:**\n";
      mainResponse += "• Persistent difficulty falling or staying asleep\n";
      mainResponse += "• Excessive daytime sleepiness despite adequate sleep time\n";
      mainResponse += "• Loud snoring, gasping, or stopping breathing during sleep\n";
      mainResponse += "• Sleep problems interfering with daily functioning\n\n";
      
      mainResponse += "A healthcare provider can help determine if underlying conditions like sleep apnea, restless legs syndrome, or other issues might be affecting your sleep quality.";
      
      response.healthInfoCards.push({
        type: "info",
        title: "Sleep Environment Checklist",
        content: "Dark room (blackout curtains if needed), cool temperature (65-68°F), quiet space or white noise, comfortable mattress and pillows, relaxing scents like lavender optional."
      });
      
      response.suggestedQueries = [
        "Morning sunlight benefits for sleep",
        "Sleep tracking methods",
        "Natural sleep aids",
        "Cognitive behavioral therapy for insomnia",
        "Managing shift work sleep disruption"
      ];
    }
    // Diagnostic query
  
    else if (intent.primary === 'diagnosticQuery') {
      mainResponse = "I understand you're looking for diagnostic information. ";
      
      if (entities.symptoms.length > 0) {
        mainResponse += `You've mentioned symptoms including ${entities.symptoms.join(', ')}.\n\n`;
        
        mainResponse += "**Important to understand:**\n";
        mainResponse += "• Many symptoms can be caused by multiple conditions\n";
        mainResponse += "• Proper diagnosis requires professional medical evaluation\n";
        mainResponse += "• Laboratory tests, imaging, and physical examination are often needed\n";
        mainResponse += "• Self-diagnosis can lead to incorrect conclusions\n\n";
        
        mainResponse += "I can provide general information about these symptoms, but cannot diagnose your specific condition.\n\n";
        
        // Provide some general information about common causes
        mainResponse += "**Common causes for these symptoms may include:**\n";
        
        if (entities.symptoms.some(s => s.includes('headache'))) {
          mainResponse += "**Headaches:** May be caused by tension, migraines, dehydration, eye strain, sinusitis, or rarely more serious conditions.\n\n";
        }
        
        if (entities.symptoms.some(s => s.includes('fatigue'))) {
          mainResponse += "**Fatigue:** Common causes include inadequate sleep, poor nutrition, stress, depression, anemia, thyroid disorders, or viral infections.\n\n";
        }
        
        if (entities.symptoms.some(s => s.includes('pain')) && entities.bodyParts.some(p => p.includes('joint'))) {
          mainResponse += "**Joint pain:** Often related to arthritis, injury, overuse, gout, viral infections, or autoimmune conditions.\n\n";
        }
        
        if (entities.symptoms.some(s => s.includes('rash'))) {
          mainResponse += "**Rash:** May be caused by allergic reactions, infections, medications, autoimmune conditions, or environmental irritants.\n\n";
        }
        
        if (entities.symptoms.some(s => s.includes('cough'))) {
          mainResponse += "**Cough:** Often due to upper respiratory infections, allergies, asthma, GERD, or environmental irritants. Persistent coughs warrant medical evaluation.\n\n";
        }
        
        if (entities.symptoms.some(s => s.includes('dizzy') || s.includes('dizziness'))) {
          mainResponse += "**Dizziness:** Can be related to inner ear issues, low blood pressure, anemia, dehydration, medication side effects, or anxiety.\n\n";
        }
        
        mainResponse += "**What to discuss with your healthcare provider:**\n";
        mainResponse += "• When the symptoms started\n";
        mainResponse += "• How severe they are (e.g., on a scale of 1-10)\n";
        mainResponse += "• Any patterns or triggers you've noticed\n";
        mainResponse += "• What makes symptoms better or worse\n";
        mainResponse += "• Other symptoms that occur alongside\n";
        mainResponse += "• Relevant medical history\n";
        mainResponse += "• Current medications and supplements\n\n";
        
        mainResponse += "A healthcare provider can perform appropriate examinations and tests to determine the underlying cause of your symptoms and recommend proper treatment.";
        
        response.healthInfoCards.push({
          type: "info",
          title: "Preparing for a Doctor's Visit",
          content: "Keep a symptom diary noting timing, severity, and factors that improve or worsen symptoms. Bring a list of current medications and questions."
        });
      } else {
        mainResponse += "To provide relevant information, I'd need to know which symptoms or conditions you're inquiring about.\n\n";
        
        mainResponse += "**The diagnostic process typically involves:**\n";
        mainResponse += "• Detailed medical history\n";
        mainResponse += "• Physical examination\n";
        mainResponse += "• Laboratory tests when indicated\n";
        mainResponse += "• Imaging studies if needed\n";
        mainResponse += "• Sometimes specialized tests for specific conditions\n\n";
        
        mainResponse += "Healthcare providers consider your symptoms, medical history, family history, and test results to reach an accurate diagnosis. This comprehensive approach helps ensure appropriate treatment.";
      }
      
      response.suggestedQueries = [
        "Common diagnostic tests explained",
        "Questions to ask during diagnosis",
        "Second opinion guidelines",
        "Understanding lab test results",
        "Preparing for diagnostic procedures"
      ];
    }
    // Treatment options
    else if (intent.primary === 'treatmentOptions') {
      mainResponse = "I understand you're seeking information about treatment options. ";
      
      if (entities.conditions.length > 0) {
        mainResponse += `Specifically for ${entities.conditions.join(', ')}.\n\n`;
        
        mainResponse += "Treatment approaches vary based on the specific condition, its severity, your overall health, and personal preferences. Here's some general information:\n\n";
        
        if (entities.conditions.some(c => c.includes('diabetes'))) {
          mainResponse += "**For diabetes management:**\n";
          mainResponse += "• Lifestyle modifications: Nutrition therapy, regular physical activity, weight management\n";
          mainResponse += "• Blood glucose monitoring\n";
          mainResponse += "• Medications: May include oral medications, injectable medications (like GLP-1 receptor agonists), and/or insulin\n";
          mainResponse += "• Regular monitoring for complications\n";
          mainResponse += "• Diabetes self-management education\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Diabetes Management Pillars",
            content: "Monitoring blood glucose, medication adherence, consistent healthy eating, regular physical activity, and regular healthcare visits."
          });
        }
        
        if (entities.conditions.some(c => c.includes('hypertension') || c.includes('blood pressure'))) {
          mainResponse += "**For hypertension (high blood pressure):**\n";
          mainResponse += "• Lifestyle modifications: DASH diet, sodium restriction, regular physical activity, limiting alcohol, stress management\n";
          mainResponse += "• Medications: May include diuretics, ACE inhibitors, ARBs, calcium channel blockers, beta-blockers\n";
          mainResponse += "• Regular blood pressure monitoring\n";
          mainResponse += "• Management of other cardiovascular risk factors\n\n";
        }
        
        if (entities.conditions.some(c => c.includes('depression'))) {
          mainResponse += "**For depression:**\n";
          mainResponse += "• Psychotherapy: Cognitive-behavioral therapy (CBT), interpersonal therapy, others\n";
          mainResponse += "• Medications: Antidepressants such as SSRIs, SNRIs, others\n";
          mainResponse += "• Lifestyle modifications: Regular physical activity, adequate sleep, stress management\n";
          mainResponse += "• Social support and connection\n";
          mainResponse += "• For severe cases: Additional approaches like TMS, ECT may be considered\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Depression Treatment Perspectives",
            content: "Many people benefit from combining therapy and medication. Treatment response varies between individuals; adjustments are common."
          });
        }
        
        if (entities.conditions.some(c => c.includes('arthritis'))) {
          mainResponse += "**For arthritis:**\n";
          mainResponse += "• Medications: Anti-inflammatories, pain relievers, disease-modifying drugs (for certain types)\n";
          mainResponse += "• Physical therapy to improve strength and function\n";
          mainResponse += "• Hot and cold therapies for pain management\n";
          mainResponse += "• Assistive devices to reduce joint stress\n";
          mainResponse += "• Joint injections (corticosteroids or hyaluronic acid)\n";
          mainResponse += "• In advanced cases: surgical options including joint replacement\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Arthritis Management Strategies",
            content: "Balance activity and rest, maintain healthy weight, use proper body mechanics, consider assistive devices, apply heat/cold appropriately."
          });
        }
        
        mainResponse += "**General treatment principles:**\n";
        mainResponse += "• Treatment plans should be personalized to your specific situation\n";
        mainResponse += "• Benefits and risks of each option should be discussed with your healthcare provider\n";
        mainResponse += "• Regular follow-up to assess effectiveness and make adjustments as needed\n";
        mainResponse += "• Managing multiple conditions often requires coordinated care\n\n";
        
        mainResponse += "Always consult with qualified healthcare providers to determine the most appropriate treatment approach for your specific situation. Treatment decisions should be made through shared decision-making between you and your healthcare team.";
      } else {
        // General treatment information
        mainResponse += "To provide relevant treatment information, I'd need to know which condition you're inquiring about.\n\n";
        
        mainResponse += "**General treatment approaches may include:**\n";
        mainResponse += "• Lifestyle modifications (nutrition, physical activity, etc.)\n";
        mainResponse += "• Medications (prescription and over-the-counter)\n";
        mainResponse += "• Physical therapy or rehabilitation\n";
        mainResponse += "• Surgical interventions when indicated\n";
        mainResponse += "• Complementary and alternative approaches\n";
        mainResponse += "• Mental health interventions\n";
        mainResponse += "• Disease management programs\n\n";
        
        mainResponse += "Effective treatment plans are typically personalized, considering your specific condition, overall health, preferences, and goals. Working with healthcare providers to develop a comprehensive approach often yields the best outcomes.";
      }
      
      response.suggestedQueries = [
        "Questions to ask about treatment options",
        "Understanding medication side effects",
        "Complementary medicine approaches",
        "Treatment cost considerations",
        "Managing multiple conditions"
      ];
    }
    // Condition management
    else if (intent.primary === 'conditionManagement') {
      mainResponse = "Managing health conditions effectively involves multiple strategies for both day-to-day control and long-term health. ";
      
      if (entities.conditions.length > 0) {
        mainResponse += `Here's some information about managing ${entities.conditions.join(', ')}:\n\n`;
        
        if (entities.conditions.some(c => c.includes('diabetes'))) {
          mainResponse += "**For diabetes management:**\n";
          mainResponse += "• Consistent blood glucose monitoring\n";
          mainResponse += "• Medication adherence as prescribed\n";
          mainResponse += "• Consistent meal timing and carbohydrate awareness\n";
          mainResponse += "• Regular physical activity\n";
          mainResponse += "• Regular foot checks and skin care\n";
          mainResponse += "• Stress management\n";
          mainResponse += "• Regular medical follow-up including eye exams, kidney function tests, and other recommended screenings\n\n";
          
          mainResponse += "Tools like continuous glucose monitors and insulin pumps may help some people with management. Diabetes education programs can provide valuable skills and support.\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Sick Day Management with Diabetes",
            content: "Continue taking medications, check glucose more frequently, stay hydrated, have easy-to-digest carbs available, and know when to call your healthcare provider."
          });
        }
        
        if (entities.conditions.some(c => c.includes('asthma'))) {
          mainResponse += "**For asthma management:**\n";
          mainResponse += "• Identify and avoid personal triggers\n";
          mainResponse += "• Take controller medications consistently, even when feeling well\n";
          mainResponse += "• Use rescue medications as needed for symptoms\n";
          mainResponse += "• Follow an updated asthma action plan\n";
          mainResponse += "• Monitor peak flow if recommended\n";
          mainResponse += "• Maintain regular medical follow-up\n";
          mainResponse += "• Get recommended vaccinations (flu, pneumonia)\n\n";
          
          mainResponse += "Using proper inhaler technique is essential for medication effectiveness. Your healthcare provider can demonstrate and check your technique.\n\n";
          
          response.healthInfoCards.push({
            type: "warning",
            title: "Asthma Warning Signs",
            content: "Seek medical attention if rescue inhaler needed more than twice weekly, nighttime symptoms increasing, or peak flow readings in yellow or red zones."
          });
        }
        
        if (entities.conditions.some(c => c.includes('hypertension') || c.includes('blood pressure'))) {
          mainResponse += "**For hypertension management:**\n";
          mainResponse += "• Take medications as prescribed, at the same time each day\n";
          mainResponse += "• Monitor blood pressure regularly at home with a validated device\n";
          mainResponse += "• Maintain a low-sodium diet (DASH diet is often recommended)\n";
          mainResponse += "• Engage in regular physical activity (aim for 150 minutes weekly)\n";
          mainResponse += "• Maintain healthy weight or work toward weight loss if needed\n";
          mainResponse += "• Limit alcohol consumption\n";
          mainResponse += "• Practice stress management techniques\n\n";
          
          response.healthInfoCards.push({
            type: "info",
            title: "Blood Pressure Monitoring Tips",
            content: "Measure at the same time daily, sit with back supported and feet flat, rest 5 minutes before measuring, avoid caffeine or exercise 30 minutes prior."
          });
        }
        
        mainResponse += "**General self-management strategies:**\n";
        mainResponse += "• Learn all you can about your condition\n";
        mainResponse += "• Take medications as prescribed\n";
        mainResponse += "• Keep regular healthcare appointments\n";
        mainResponse += "• Monitor your condition as recommended\n";
        mainResponse += "• Maintain healthy lifestyle habits\n";
        mainResponse += "• Develop stress management techniques\n";
        mainResponse += "• Consider joining a support group\n";
        mainResponse += "• Communicate openly with your healthcare team\n\n";
        
        mainResponse += "Effective management often improves quality of life and reduces complications. Remember that management plans often need adjustment over time as your condition or life circumstances change.";
      } else {
        // General condition management information
        mainResponse += "To provide specific management strategies, I'd need to know which condition you're inquiring about.\n\n";
        
        mainResponse += "**General condition management principles:**\n";
        mainResponse += "• Become knowledgeable about your condition\n";
        mainResponse += "• Follow treatment plans consistently\n";
        mainResponse += "• Maintain regular communication with healthcare providers\n";
        mainResponse += "• Monitor your condition appropriately\n";
        mainResponse += "• Make recommended lifestyle modifications\n";
        mainResponse += "• Practice preventive care\n";
        mainResponse += "• Develop strategies for emotional wellbeing\n";
        mainResponse += "• Build a support network\n\n";
        
        mainResponse += "Many chronic conditions benefit from a comprehensive approach that addresses medical treatment, lifestyle factors, and emotional wellbeing. Working with healthcare providers to develop personalized management strategies is important for optimal outcomes.";
      }
      
      response.suggestedQueries = [
        "Tracking health metrics at home",
        "Medication management apps",
        "Finding support groups",
        "Managing condition flare-ups",
        "Communicating effectively with doctors"
      ];
    }
    // Handling farewell intents
    else if (intent.primary === 'farewell') {
      if (sentiment.sentiment.includes('positive')) {
        mainResponse = "I'm glad I could help! It was a pleasure assisting you with health information today. Feel free to return anytime you have health questions. Wishing you the best of health!";
      } else {
        mainResponse = "Thank you for using Dr. Health. If you have further questions in the future, don't hesitate to return. Take care of yourself, and remember that your wellbeing is important.";
      }
      
      // If we've interacted substantively, add follow-up information
      if (conversationHistory && conversationHistory.length > 3) {
        mainResponse += "\n\nRemember that for specific health concerns, it's always best to consult with qualified healthcare professionals for personalized advice and treatment.";
      }
      
      response.suggestedQueries = [
        "Daily health tips",
        "Preventive health strategies",
        "Health tracking methods",
        "Finding healthcare providers",
        "Reliable health resources"
      ];
    }
    // Medication reminder
    else if (intent.primary === 'medicationReminder') {
      mainResponse = "I can provide some general guidance about medication reminders and adherence strategies.\n\n";
      
      mainResponse += "**Effective medication reminder strategies:**\n";
      mainResponse += "• Set specific times for taking medications and stick to a routine\n";
      mainResponse += "• Use pill organizers to sort medications by day and time\n";
      mainResponse += "• Set alarms or use specialized medication reminder apps\n";
      mainResponse += "• Link medication times to daily activities (e.g., brushing teeth, meals)\n";
      mainResponse += "• Keep a medication list with dosages and schedules\n";
      mainResponse += "• Use calendar alerts or sticky notes in visible locations\n";
      mainResponse += "• Ask a family member or friend to help remind you\n\n";
      
      mainResponse += "**Tips for improving medication adherence:**\n";
      mainResponse += "• Understand why each medication is important for your health\n";
      mainResponse += "• Discuss concerns about side effects or costs with your healthcare provider\n";
      mainResponse += "• Establish a simple routine that works with your lifestyle\n";
      mainResponse += "• Keep a medication journal to track doses and effects\n";
      mainResponse += "• Refill prescriptions before they run out\n";
      mainResponse += "• Consider mail-order pharmacies for maintenance medications\n\n";
      
      mainResponse += "There are also many digital tools available that can help with medication management, from simple alarm apps to smart pill dispensers with notifications.";
      
      response.healthInfoCards.push({
        type: "info",
        title: "Medication Adherence Tips",
        content: "Store medications visibly (but safely), use phone reminders, ask for simplified regimens if possible, and discuss any barriers with your healthcare provider."
      });
      
      response.suggestedQueries = [
        "Best medication reminder apps",
        "Pill organizer systems",
        "How to remember multiple medications",
        "Managing medication side effects",
        "Simplifying medication schedules"
      ];
    }
    // Find healthcare provider
    else if (intent.primary === 'findProvider') {
      mainResponse = "Finding the right healthcare provider is an important part of managing your health.\n\n";
      
      mainResponse += "**Tips for finding healthcare providers:**\n";
      mainResponse += "• Check with your health insurance for in-network providers\n";
      mainResponse += "• Ask for recommendations from trusted friends, family, or other healthcare professionals\n";
      mainResponse += "• Use doctor-finding tools on your insurance website\n";
      mainResponse += "• Search physician review sites and healthcare directories\n";
      mainResponse += "• Consider proximity, office hours, and availability for appointments\n";
      mainResponse += "• Look into the provider's credentials, experience, and specialties\n";
      mainResponse += "• Check if they offer telehealth services if that's important to you\n\n";
      
      mainResponse += "**Questions to consider when choosing a provider:**\n";
      mainResponse += "• Are they board-certified in their specialty?\n";
      mainResponse += "• Do they have experience with your specific health concerns?\n";
      mainResponse += "• Are they affiliated with hospitals or medical centers you prefer?\n";
      mainResponse += "• Do their office hours and location work for your schedule?\n";
      mainResponse += "• What's their communication style and availability between appointments?\n";
      mainResponse += "• How are urgent concerns handled?\n\n";
      
      mainResponse += "Many primary care offices offer a complimentary meeting to discuss whether the practice is a good fit for your needs before becoming a patient.";
      
      response.healthInfoCards.push({
        type: "info",
        title: "Provider Types",
        content: "Primary care (family medicine, internal medicine, pediatrics), specialists (cardiologists, dermatologists, etc.), and allied health professionals (physical therapists, nutritionists, etc.)."
      });
      
      response.suggestedQueries = [
        "Primary care vs. specialists",
        "Questions to ask new doctors",
        "Preparing for first appointment",
        "Patient portal benefits",
        "Coordinating care between providers"
      ];
    }
    // Generic/catchall response for other intents
    else {
      mainResponse = "I'm Dr. Health, your AI medical assistant. I can provide evidence-based health information on a wide range of topics including:\n\n";
      mainResponse += "• Symptoms and conditions\n";
      mainResponse += "• Medications and treatments\n";
      mainResponse += "• Nutrition and exercise\n";
      mainResponse += "• Mental health and wellness\n";
      mainResponse += "• Preventive healthcare\n";
      mainResponse += "• First aid and emergency guidance\n\n";
      
      mainResponse += "How can I assist you with your health questions today?";
      
      // If we've detected any entities, offer some guidance
      if (entities.symptoms.length > 0 || entities.conditions.length > 0 || entities.medications.length > 0) {
        mainResponse += "\n\nI notice you mentioned ";
        
        if (entities.symptoms.length > 0) {
          mainResponse += `symptoms like ${entities.symptoms.join(', ')}. `;
        }
        
        if (entities.conditions.length > 0) {
          mainResponse += `conditions such as ${entities.conditions.join(', ')}. `;
        }
        
        if (entities.medications.length > 0) {
          mainResponse += `medications including ${entities.medications.join(', ')}. `;
        }
        
        mainResponse += "Would you like information about any of these specifically?";
      }
      
      response.suggestedQueries = [
        "Common health myths debunked",
        "Essential health screenings by age",
        "Boosting immune system naturally",
        "Understanding medication interactions",
        "Quick stress relief techniques"
      ];
    }
    
    // Add a personalized closing if we have user context
    if (userProfile && 
       (userProfile.knownConditions.length > 0 || 
        userProfile.medications.length > 0 || 
        userProfile.demographics.age)) {
      mainResponse += "\n\nI've personalized this information based on what you've shared previously. If your health situation has changed, please let me know so I can provide the most relevant guidance.";
    }
    
    // Add the standard medical disclaimer to all non-emergency responses
    mainResponse += "\n\n**Health Information Disclaimer:** The information provided is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions about a medical condition.";
    
    // Set the final response text
    response.text = mainResponse;
    
    return response;
  },
  
  // Response templates
  responseTemplates: {
    greeting: (timeOfDay = '') => {
      const hour = new Date().getHours();
      const greetings = timeOfDay || (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
      return `${greetings}! I'm Dr. Health, your personal AI health assistant. I can provide evidence-based health information and guidance. How may I assist you today?`;
    },
    
    healthTip: () => {
      const tips = [
        "💧 **Hydration Insight**: Your body is 60% water. Staying well-hydrated supports every bodily function from metabolism to temperature regulation.",
        "🏃‍♂️ **Physical Activity Fact**: Just 150 minutes of moderate exercise weekly reduces chronic disease risk by 30-35%.",
        "🧠 **Sleep Science**: Quality sleep (7-9 hours) is essential for cognitive function, immune health, and emotional regulation.",
        "🥗 **Nutrition Evidence**: The Mediterranean diet is scientifically proven to reduce heart disease risk and support cognitive health.",
        "❤️ **Cardiovascular Health**: 80% of heart disease is preventable through lifestyle choices: nutrition, physical activity, avoiding tobacco, and stress management.",
        "🧘‍♀️ **Mental Wellness**: Regular mindfulness practice can physically alter brain regions associated with attention and stress regulation.",
        "🍊 **Immunity Support**: A diet rich in various fruits and vegetables provides phytonutrients that support immune function.",
        "🦷 **Oral Health Connection**: Poor oral health is linked to increased risk of heart disease, showing the interconnected nature of bodily systems.",
        "📈 **Preventive Care Value**: Regular health screenings can detect early signs of disease when they're most treatable.",
        "⚖️ **Weight Management Science**: Sustainable weight management combines nutrition, physical activity, stress management, and adequate sleep."
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    },
    
    disclaimer: () => `\n\n**Medical Disclaimer**: This information is for educational purposes only and not a substitute for professional medical advice. Always consult qualified healthcare providers for medical concerns.`,
    
    emergencyDisclaimer: () => `\n\n⚠️ **EMERGENCY NOTICE**: This guidance is for educational purposes. In actual emergencies, call emergency services (911/108) immediately. This is not a substitute for professional emergency care.`
  }
};
// ====================================================================================
// MAIN COMPONENT - DR. HEALTH CHATBOT
// ====================================================================================

function DrHealthChatbot() {
  // Core state management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(1);
  
  // User profile and conversation context
  const [userProfile, setUserProfile] = useState({
    knownConditions: [],
    medications: [],
    demographics: { age: null, gender: null },
    preferences: { diet: null, exercise: null },
    allergies: [],
    proceduresHistory: [],
    familyHistory: [],
    preferredLanguage: 'english',
    lastInteraction: null
  });
  
  const [conversationContext, setConversationContext] = useState({
    currentTopics: [],
    sentiment: 'neutral',
    sessionDuration: 0,
    messageCount: 0,
    lastActivity: new Date()
  });
  
  // Accessibility settings
  const [fontSizeLevel, setFontSizeLevel] = useState(2); // 1-4, default 2
  const [highContrast, setHighContrast] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // AI features
  const [aiLevel, setAiLevel] = useState(3); // 1-3: basic, advanced, comprehensive
  const [showThinking, setShowThinking] = useState(true);
  const [showHealthTips, setShowHealthTips] = useState(true);
  
  // Feature flags
  const [allowExport, setAllowExport] = useState(true);
  const [allowMedicationReminders, setAllowMedicationReminders] = useState(true);
  const [allowLocationService, setAllowLocationService] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  
  // Display settings
  const [showSettings, setShowSettings] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);
  const { darkMode } = useTheme();
  const recordingRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // Audio feedback sound
  const messageSound = useRef(null);
  const alertSound = useRef(null);
  useEffect(() => {
    messageSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-back-2575.mp3');
    messageSound.current.volume = 0.5;
    
    alertSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-classic-short-alarm-993.mp3');
    alertSound.current.volume = 0.7;
  }, []);
  
  // Initialize the chat with a welcome message
  useEffect(() => {
    const currentHour = new Date().getHours();
    let greeting = "Hello";
    
    if (currentHour < 12) {
      greeting = "Good morning";
    } else if (currentHour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    
    setMessages([{ 
      text: `${greeting}! I'm Dr. Health, your AI-powered health assistant. I can provide evidence-based health information on topics including emergency care, wellness, nutrition, exercise, and condition management. How may I help you today?`, 
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      aiGenerated: true
    }]);
    
    // Set initial suggested queries
    updateSuggestedQueriesForTimeOfDay();
    
    // Check for saved user profile and preferences
    const savedProfile = localStorage.getItem('dr-health-user-profile');
    const savedAccessibility = localStorage.getItem('dr-health-accessibility');
    const savedAISettings = localStorage.getItem('dr-health-settings');
    const savedDisplaySettings = localStorage.getItem('dr-health-display');
    
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Error loading saved user profile:", error);
      }
    }
    
    if (savedAccessibility) {
      try {
        const accessibilitySettings = JSON.parse(savedAccessibility);
        if (accessibilitySettings.fontSizeLevel) setFontSizeLevel(accessibilitySettings.fontSizeLevel);
        if (accessibilitySettings.highContrast !== undefined) setHighContrast(accessibilitySettings.highContrast);
        if (accessibilitySettings.audioFeedback !== undefined) setAudioFeedback(accessibilitySettings.audioFeedback);
        if (accessibilitySettings.textToSpeech !== undefined) setTextToSpeech(accessibilitySettings.textToSpeech);
        if (accessibilitySettings.reducedMotion !== undefined) setReducedMotion(accessibilitySettings.reducedMotion);
      } catch (error) {
        console.error("Error loading saved accessibility settings:", error);
      }
    }
    
    if (savedAISettings) {
      try {
        const aiSettings = JSON.parse(savedAISettings);
        if (aiSettings.aiLevel) setAiLevel(aiSettings.aiLevel);
        if (aiSettings.showThinking !== undefined) setShowThinking(aiSettings.showThinking);
        if (aiSettings.showHealthTips !== undefined) setShowHealthTips(aiSettings.showHealthTips);
      } catch (error) {
        console.error("Error loading saved AI settings:", error);
      }
    }
    
    if (savedDisplaySettings) {
      try {
        const displaySettings = JSON.parse(savedDisplaySettings);
        if (displaySettings.showTooltips !== undefined) setShowTooltips(displaySettings.showTooltips);
        if (displaySettings.selectedLanguage) setSelectedLanguage(displaySettings.selectedLanguage);
      } catch (error) {
        console.error("Error loading saved display settings:", error);
      }
    }
    
    // Check for media query preferences
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setReducedMotion(true);
      }
    }
    
    // Event listener for keyboard shortcuts
    const handleKeyDown = (e) => {
      // Alt+A to toggle accessibility menu
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowAccessibilityMenu(prev => !prev);
      }
      
      // Escape to close chat
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
      
      // Alt+C to open/close chat
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (!isOpen) {
          setUnreadCount(0);
        }
      }
      
      // Alt+V to toggle voice input
      if (e.altKey && e.key === 'v' && isOpen) {
        e.preventDefault();
        toggleVoiceInput();
      }
      
      // Alt+S to toggle settings
      if (e.altKey && e.key === 's' && isOpen) {
        e.preventDefault();
        setShowSettings(prev => !prev);
      }
      
      // Alt+H to show health tip
      if (e.altKey && e.key === 'h' && isOpen) {
        e.preventDefault();
        addHealthTip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, reducedMotion]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Reset unread count when chat opens
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);
  
  // Apply accessibility settings
  useEffect(() => {
    if (chatWindowRef.current) {
      // Apply font size class
      chatWindowRef.current.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4');
      chatWindowRef.current.classList.add(`font-size-${fontSizeLevel}`);
      
      // Apply high contrast class
      if (highContrast) {
        chatWindowRef.current.classList.add('high-contrast');
      } else {
        chatWindowRef.current.classList.remove('high-contrast');
      }
      
      // Apply reduced motion class
      if (reducedMotion) {
        chatWindowRef.current.classList.add('reduced-motion');
      } else {
        chatWindowRef.current.classList.remove('reduced-motion');
      }
    }
    
    // Save preferences to localStorage
    localStorage.setItem('dr-health-accessibility', JSON.stringify({
      fontSizeLevel,
      highContrast,
      audioFeedback,
      textToSpeech,
      reducedMotion
    }));
  }, [fontSizeLevel, highContrast, audioFeedback, textToSpeech, reducedMotion]);
  
  // Save user profile whenever it changes
  useEffect(() => {
    localStorage.setItem('dr-health-user-profile', JSON.stringify({
      ...userProfile,
      lastInteraction: new Date()
    }));
  }, [userProfile]);
  
  // Save AI settings whenever they change
  useEffect(() => {
    localStorage.setItem('dr-health-settings', JSON.stringify({
      aiLevel,
      showThinking,
      showHealthTips
    }));
  }, [aiLevel, showThinking, showHealthTips]);
  
  // Save display settings whenever they change
  useEffect(() => {
    localStorage.setItem('dr-health-display', JSON.stringify({
      showTooltips,
      selectedLanguage
    }));
  }, [showTooltips, selectedLanguage]);
  // Time-based suggested queries
  const updateSuggestedQueriesForTimeOfDay = () => {
    const hour = new Date().getHours();
    
    // Morning suggestions (5 AM - 11 AM)
    if (hour >= 5 && hour < 11) {
      setSuggestedQueries([
        "Morning exercise routines",
        "Healthy breakfast ideas",
        "Vitamin D importance",
        "Morning productivity tips",
        "Sleep quality assessment"
      ]);
    } 
    // Midday suggestions (11 AM - 3 PM)
    else if (hour >= 11 && hour < 15) {
      setSuggestedQueries([
        "Healthy lunch options",
        "Midday energy boosters",
        "Stress management techniques",
        "Desk stretches for office workers",
        "Hydration importance"
      ]);
    } 
    // Evening suggestions (3 PM - 8 PM)
    else if (hour >= 15 && hour < 20) {
      setSuggestedQueries([
        "Evening workout benefits",
        "Healthy dinner recipes",
        "Relaxation techniques",
        "Screen time effects on sleep",
        "Nighttime routine for better sleep"
      ]);
    } 
    // Night suggestions (8 PM - 5 AM)
    else {
      setSuggestedQueries([
        "Sleep improvement strategies",
        "Relaxation before bedtime",
        "Managing nighttime anxiety",
        "Sleep environment optimization",
        "Healthy sleep habits"
      ]);
    }
  };
  
  // Toggle voice input functionality
  const toggleVoiceInput = () => {
    if (voiceInput) {
      // Stop recording if active
      if (recordingRef.current) {
        stopVoiceInput();
      }
      setVoiceInput(false);
    } else {
      setVoiceInput(true);
      startVoiceInput();
    }
  };
  
  // Start voice recognition
  const startVoiceInput = () => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition is not supported in your browser.");
      setVoiceInput(false);
      return;
    }
    
    try {
      // Create recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      
      // Configure
      recognition.continuous = false;
      recognition.lang = selectedLanguage === 'english' ? 'en-US' : 
                         selectedLanguage === 'spanish' ? 'es-ES' : 
                         selectedLanguage === 'french' ? 'fr-FR' : 
                         'en-US';
      recognition.interimResults = true;
      
      // Add voice recording class for animation
      document.querySelector('.input-container')?.classList.add('voice-recording');
      recordingRef.current = true;
      
      // Handle interim results
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      // Handle end of speech
      recognition.onend = () => {
        stopVoiceInput();
        
        // Check if there's a transcript to process
        if (input.trim()) {
          // Auto-send if input looks like a complete thought
          if (input.trim().length > 15 || /[.!?]$/.test(input.trim())) {
            handleSendMessage({ preventDefault: () => {} });
          }
        }
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        stopVoiceInput();
        
        // Show error message to user
        setMessages(prevMessages => [
          ...prevMessages,
          {
            text: `I encountered an issue with voice recognition: ${event.error}. Please try again or type your message instead.`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      };
      
      // Start recognition
      recognition.start();
      
      // Play audio feedback if enabled
      if (audioFeedback && messageSound.current) {
        messageSound.current.play().catch(err => console.error("Error playing sound:", err));
      }
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setVoiceInput(false);
      
      // Show error message to user
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "I couldn't start voice recognition. This feature might not be fully supported in your browser. Please try typing your message instead.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };
  
  // Stop voice recognition
  const stopVoiceInput = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    
    document.querySelector('.input-container')?.classList.remove('voice-recording');
    recordingRef.current = false;
  };
  
  // Add a random health tip to the conversation
  const addHealthTip = () => {
    if (!showHealthTips) return;
    
    const healthTip = DrHealth.responseTemplates.healthTip();
    
    setMessages(prevMessages => [
      ...prevMessages,
      {
        text: healthTip,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'health-tip',
        aiGenerated: true
      }
    ]);
    
    // Play audio feedback if enabled
    if (audioFeedback && messageSound.current) {
      messageSound.current.play().catch(err => console.error("Error playing sound:", err));
    }
  };
  
  // Export chat history
  const exportChatHistory = () => {
    if (!allowExport) return;
    
    try {
      // Create formatted text version of the chat
      let exportText = "Dr. Health Chat History\n";
      exportText += `Exported on: ${new Date().toLocaleString()}\n\n`;
      
      messages.forEach(message => {
        const sender = message.sender === "assistant" ? "Dr. Health" : 
                      message.sender === "system" ? "System" : "You";
        
        // Format time and add sender
        exportText += `[${message.timestamp}] ${sender}:\n`;
        
        // Add message text - strip markdown for cleaner export
        const cleanText = message.text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1');
        
        exportText += `${cleanText}\n\n`;
      });
      
      // Create blob and download link
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dr-health-chat-${new Date().toISOString().slice(0, 10)}.txt`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Confirmation message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "Chat history has been exported successfully. The file has been downloaded to your device.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'export-confirmation'
        }
      ]);
    } catch (error) {
      console.error("Error exporting chat history:", error);
      
      // Error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "There was an error exporting the chat history. Please try again later.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'error'
        }
      ]);
    }
  };
  
  // Generate PDF medical summary
  const generateMedicalSummary = () => {
    if (!allowExport) return;
    
    try {
      // Create summary content
      let summaryContent = "# Dr. Health Medical Summary\n\n";
      summaryContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
      
      // Add user profile information
      summaryContent += "## User Health Profile\n\n";
      
      if (userProfile.demographics.age) {
        summaryContent += `**Age:** ${userProfile.demographics.age}\n`;
      }
      
      if (userProfile.demographics.gender) {
        summaryContent += `**Gender:** ${userProfile.demographics.gender}\n`;
      }
      
      if (userProfile.knownConditions.length > 0) {
        summaryContent += `**Medical Conditions:** ${userProfile.knownConditions.join(', ')}\n`;
      }
      
      if (userProfile.medications.length > 0) {
        summaryContent += `**Medications:** ${userProfile.medications.join(', ')}\n`;
      }
      
      if (userProfile.allergies.length > 0) {
        summaryContent += `**Allergies:** ${userProfile.allergies.join(', ')}\n`;
      }
      
      if (userProfile.proceduresHistory.length > 0) {
        summaryContent += `**Procedure History:** ${userProfile.proceduresHistory.join(', ')}\n`;
      }
      
      if (userProfile.familyHistory.length > 0) {
        summaryContent += `**Family History:** ${userProfile.familyHistory.join(', ')}\n`;
      }
      
      summaryContent += "\n## Recent Health Discussions\n\n";
      
      // Extract key health discussions from last 10 messages
      const recentMessages = messages.slice(-10);
      let keyTopics = new Set();
      
      recentMessages.forEach(message => {
        if (message.sender === "user") {
          // Extract entities from user messages
          const entities = DrHealth.extractEntities(message.text);
          
          // Add symptoms, conditions, and medications to key topics
          entities.symptoms.forEach(s => keyTopics.add(`Symptom: ${s}`));
          entities.conditions.forEach(c => keyTopics.add(`Condition: ${c}`));
          entities.medications.forEach(m => keyTopics.add(`Medication: ${m}`));
        }
      });
      
      if (keyTopics.size > 0) {
        summaryContent += "Recent health topics discussed:\n";
        keyTopics.forEach(topic => {
          summaryContent += `- ${topic}\n`;
        });
      } else {
        summaryContent += "No specific health topics discussed in recent conversation.\n";
      }
      
      summaryContent += "\n## Disclaimer\n\n";
      summaryContent += "This summary is generated based on conversation with an AI health assistant. ";
      summaryContent += "It is for informational purposes only and does not constitute medical advice. ";
      summaryContent += "Please consult with qualified healthcare professionals for medical concerns.\n";
      
      // Create blob and download link
      const blob = new Blob([summaryContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dr-health-medical-summary-${new Date().toISOString().slice(0, 10)}.md`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Confirmation message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "A medical summary has been generated and downloaded to your device. You can share this with your healthcare provider to facilitate discussions about your health concerns.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'export-confirmation'
        }
      ]);
    } catch (error) {
      console.error("Error generating medical summary:", error);
      
      // Error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "There was an error generating the medical summary. Please try again later.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'error'
        }
      ]);
    }
  };
  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (input.trim() === '') return;
    
    // Stop voice input if active
    if (recordingRef.current) {
      stopVoiceInput();
    }
    
    // Add user message
    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    
    // Show thinking indicator
    setIsTyping(true);
    
    // Show AI processing animation for more complex queries
    if (aiLevel >= 2 && showThinking && input.length > 20) {
      setProcessingAI(true);
    }
    
    // Calculate dynamic response delay based on query complexity and AI level
    const baseDelay = 800;
    const wordCount = input.trim().split(/\s+/).length;
    
    // More sophisticated AI takes longer to "think" but provides better responses
    const aiLevelFactor = aiLevel === 1 ? 0.7 : aiLevel === 2 ? 1.0 : 1.3;
    const complexityFactor = input.length > 100 ? 1.5 : input.length > 50 ? 1.2 : 1;
    
    // Calculate thinking time
    const thinkingDelay = Math.min(
      4000, // Cap at 4 seconds maximum
      Math.max(800, // Minimum of 800ms
        baseDelay + (wordCount * 40 * aiLevelFactor * complexityFactor)
      )
    );
    
    // Process input and generate response
    setTimeout(() => {
      setProcessingAI(false);
      
      // Extract entities from user input
      const entities = DrHealth.extractEntities(input);
      
      // Determine intent
      const intent = DrHealth.determineIntent(input);
      
      // Analyze sentiment
      const sentiment = DrHealth.analyzeSentiment(input);
      
      // Generate response
      const response = DrHealth.generateResponse(input, entities, intent, sentiment, userProfile, messages);
      
      // Short additional delay for typing simulation
      setTimeout(() => {
        setIsTyping(false);
        
        // Create assistant reply
        const assistantReply = {
          text: response.text,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          urgencyLevel: response.urgencyLevel,
          healthInfoCards: response.healthInfoCards,
          aiGenerated: true
        };
        
        setMessages(prevMessages => [...prevMessages, assistantReply]);
        
        // Update suggested queries based on context
        if (response.suggestedQueries && response.suggestedQueries.length > 0) {
          setSuggestedQueries(response.suggestedQueries);
        } else {
          // Generate dynamic suggestions if none provided in response
          const suggestedQueries = DrHealth.generateContextualSuggestions(input, entities, intent, messages);
          setSuggestedQueries(suggestedQueries);
        }
        
        // Read aloud if text-to-speech is enabled
        if (textToSpeech) {
          // Strip markdown and other formatting for cleaner speech
          const cleanText = response.text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\n+/g, ' ')
            .replace(/•/g, '')
            .replace(/  +/g, ' ');
            
          DrHealth.speakResponse(cleanText);
        }
        
        // Play audio feedback if enabled
        if (audioFeedback && messageSound.current) {
          messageSound.current.play().catch(err => console.error("Error playing sound:", err));
        }
        
        // Play alert sound for high urgency responses
        if (response.urgencyLevel === 'high' || response.urgencyLevel === 'critical') {
          if (alertSound.current) {
            alertSound.current.play().catch(err => console.error("Error playing alert sound:", err));
          }
        }
        
        // Increment unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prevCount => prevCount + 1);
        }
        
        // Update user profile with new information if detected
        if (entities.conditions.length > 0 || 
            entities.medications.length > 0 || 
            entities.demographics.age || 
            entities.demographics.gender || 
            entities.allergies.length > 0 || 
            entities.proceduresHistory.length > 0 || 
            entities.familyHistory.length > 0 || 
            entities.preferredLanguage) {
          updateUserProfile(entities);
        }
        
        // Schedule follow-up if appropriate based on context
        if (response.urgencyLevel === 'normal' && 
            aiLevel >= 2 && 
            intent.primary !== 'farewell') {

          // Generate follow-up questions
          const followUpQuestions = DrHealth.generateFollowUpQuestions(input, entities, intent, messages);

          if (followUpQuestions.length > 0) {
            // Capture current message count before timeout
            const currentMessageCount = messages.length;
            
            // Wait a reasonable time before asking follow-up
            setTimeout(() => {
              // Only show follow-up if exactly 2 messages were added (user + response)
              if (messages.length === currentMessageCount + 2) { 
                setIsTyping(true);
                
                setTimeout(() => {
                  setIsTyping(false);
                  
                  // Choose one follow-up question
                  const followUpQuestion = followUpQuestions[0];
                  
                  const followUp = {
                    text: followUpQuestion,
                    sender: "assistant",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isFollowUp: true,
                    aiGenerated: true
                  };
                  
                  setMessages(prevMessages => [...prevMessages, followUp]);
                  
                  // Play audio feedback if enabled
                  if (audioFeedback && messageSound.current) {
                    messageSound.current.play().catch(err => console.error("Error playing sound:", err));
                  }
                }, 800);
              }
            }, 8000); // Wait 8 seconds to see if user responds
          }
        }
      }, 800);
    }, thinkingDelay);
  };
  
  // Update user profile based on detected entities
  const updateUserProfile = (entities) => {
    setUserProfile(prevProfile => {
      // Create a deep copy of the user profile
      const newProfile = JSON.parse(JSON.stringify(prevProfile));
      
      // Update conditions (avoiding duplicates)
      if (entities.conditions.length > 0) {
        entities.conditions.forEach(condition => {
          // Clean condition format for profile
          const cleanCondition = condition.replace(/diagnosed |history of |suspected /, '');
          
          if (!newProfile.knownConditions.includes(cleanCondition)) {
            newProfile.knownConditions.push(cleanCondition);
          }
        });
      }
      
      // Update medications (avoiding duplicates)
      if (entities.medications.length > 0) {
        entities.medications.forEach(medication => {
          // Extract just the base medication name for profile
          const baseMedication = medication.split(' ')[0];
          
          if (!newProfile.medications.includes(baseMedication)) {
            newProfile.medications.push(baseMedication);
          }
        });
      }
      
      // Update demographics if available
      if (entities.demographics.age) {
        newProfile.demographics.age = entities.demographics.age;
      }
      
      if (entities.demographics.gender) {
        newProfile.demographics.gender = entities.demographics.gender;
      }
      
      // Update allergies (avoiding duplicates)
      if (entities.allergies.length > 0) {
        entities.allergies.forEach(allergy => {
          if (!newProfile.allergies.includes(allergy)) {
            newProfile.allergies.push(allergy);
          }
        });
      }
      
      // Update procedures history (avoiding duplicates)
      if (entities.proceduresHistory.length > 0) {
        entities.proceduresHistory.forEach(procedure => {
          if (!newProfile.proceduresHistory.includes(procedure)) {
            newProfile.proceduresHistory.push(procedure);
          }
        });
      }
      
      // Update family history (avoiding duplicates)
      if (entities.familyHistory.length > 0) {
        entities.familyHistory.forEach(history => {
          if (!newProfile.familyHistory.includes(history)) {
            newProfile.familyHistory.push(history);
          }
        });
      }
      
      // Update preferred language if detected
      if (entities.preferredLanguage) {
        newProfile.preferredLanguage = entities.preferredLanguage;
      }
      
      // Update lifestyle preferences if available
      if (entities.lifestyle.diet) {
        newProfile.preferences.diet = entities.lifestyle.diet;
      }
      
      if (entities.lifestyle.exercise) {
        newProfile.preferences.exercise = entities.lifestyle.exercise;
      }
      
      return newProfile;
    });
  };
  
  // Handle suggested query selection
  const handleSuggestedQuery = (query) => {
    // Add user message to chat
    const userMessage = {
      text: query,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsOpen(true);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Show AI processing animation for more complex queries
    if (aiLevel >= 2 && showThinking) {
      setProcessingAI(true);
    }
    
    // AI response timing based on query complexity and AI level
    const wordCount = query.split(/\s+/).length;
    const aiLevelFactor = aiLevel === 1 ? 0.7 : aiLevel === 2 ? 1.0 : 1.3;
    
    const thinkingDelay = Math.min(
      3000, // Cap at 3 seconds maximum
      Math.max(800, // Minimum of 800ms
        wordCount * 40 * aiLevelFactor
      )
    );
    
    // Process response after delay
    setTimeout(() => {
      setProcessingAI(false);
      
      // Extract entities from query
      const entities = DrHealth.extractEntities(query);
      
      // Determine intent
      const intent = DrHealth.determineIntent(query);
      
      // Analyze sentiment
      const sentiment = DrHealth.analyzeSentiment(query);
      
      // Generate response
      const response = DrHealth.generateResponse(query, entities, intent, sentiment, userProfile, messages);
      
      // Short additional delay for typing simulation
      setTimeout(() => {
        setIsTyping(false);
        
        const assistantReply = {
          text: response.text,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          urgencyLevel: response.urgencyLevel,
          healthInfoCards: response.healthInfoCards,
          aiGenerated: true
        };
        
        setMessages(prevMessages => [...prevMessages, assistantReply]);
        
        // Update suggested queries
        if (response.suggestedQueries && response.suggestedQueries.length > 0) {
          setSuggestedQueries(response.suggestedQueries);
        }
        
        // Read aloud if text-to-speech is enabled
        if (textToSpeech) {
          // Strip markdown and other formatting for cleaner speech
          const cleanText = response.text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\n+/g, ' ')
            .replace(/•/g, '')
            .replace(/  +/g, ' ');
            
          DrHealth.speakResponse(cleanText);
        }
        
        // Play audio feedback if enabled
        if (audioFeedback && messageSound.current) {
          messageSound.current.play().catch(err => console.error("Error playing sound:", err));
        }
        
        // Increment unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prevCount => prevCount + 1);
        }
        
        // Update user profile with new information if detected
        if (entities.conditions.length > 0 || entities.medications.length > 0 || entities.demographics.age || entities.demographics.gender) {
          updateUserProfile(entities);
        }
      }, 800);
    }, thinkingDelay);
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  // Clear chat history with intelligent context preservation
  const handleClearChat = () => {
    const currentHour = new Date().getHours();
    let greeting = "Hello";
    
    if (currentHour < 12) greeting = "Good morning";
    else if (currentHour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    // Create personalized welcome message based on known user context
    let welcomeText = `${greeting}! I'm Dr. Health, your AI medical assistant.`;
    
    // Add personalization if we have user context
    if (userProfile.knownConditions.length > 0 || 
        userProfile.demographics.age) {
      welcomeText += " Based on our previous conversations,";
      
      if (userProfile.demographics.age) {
        welcomeText += ` I remember you're ${userProfile.demographics.age} years old`;
      }
      
      if (userProfile.knownConditions.length > 0) {
        if (userProfile.demographics.age) {
          welcomeText += ` and have mentioned ${userProfile.knownConditions.join(', ')}`;
        } else {
          welcomeText += ` you've mentioned ${userProfile.knownConditions.join(', ')}`;
        }
      }
      
      welcomeText += ". I'll keep this in mind as we chat.";
    }
    
    welcomeText += " How may I help you today?";
    
    setMessages([{ 
      text: welcomeText,
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'greeting',
      aiGenerated: true
    }]);
    
    // Reset conversation topics but keep user profile
    setConversationContext(prev => ({
      ...prev,
      currentTopics: [],
      messageCount: 0,
      lastActivity: new Date()
    }));
    
    updateSuggestedQueriesForTimeOfDay();
  };
  
  // Reset user profile
  const resetUserProfile = () => {
    if (window.confirm("Are you sure you want to reset your health profile? This will clear all saved information about your health conditions, medications, and demographics.")) {
      setUserProfile({
        knownConditions: [],
        medications: [],
        demographics: { age: null, gender: null },
        preferences: { diet: null, exercise: null },
        allergies: [],
        proceduresHistory: [],
        familyHistory: [],
        preferredLanguage: 'english',
        lastInteraction: null
      });
      
      localStorage.removeItem('dr-health-user-profile');
      
      // Add message to the chat about reset
      const systemMessage = {
        text: "Your health profile has been reset. I'm no longer storing information about your health conditions, medications, or demographics.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system'
      };
      
      setMessages(prevMessages => [...prevMessages, systemMessage]);
    }
  };
  
  // Accessibility feature toggles
  const increaseFontSize = () => {
    setFontSizeLevel(prev => Math.min(prev + 1, 4));
  };
  
  const decreaseFontSize = () => {
    setFontSizeLevel(prev => Math.max(prev - 1, 1));
  };
  
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };
  
  const toggleAudioFeedback = () => {
    setAudioFeedback(prev => !prev);
  };
  
  const toggleTextToSpeech = () => {
    setTextToSpeech(prev => !prev);
  };
  
  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };
  
  // Reset accessibility settings
  const resetAccessibilitySettings = () => {
    setFontSizeLevel(2);
    setHighContrast(false);
    setAudioFeedback(false);
    setTextToSpeech(false);
    setReducedMotion(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  
  // Toggle AI settings
  const changeAILevel = (level) => {
    setAiLevel(level);
  };
  
  const toggleShowThinking = () => {
    setShowThinking(prev => !prev);
  };
  
  const toggleShowHealthTips = () => {
    setShowHealthTips(prev => !prev);
  };
  
  // Change language
  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    
    // Update user's preferred language
    setUserProfile(prev => ({
      ...prev,
      preferredLanguage: language
    }));
    
    // Add system message about language change
    const systemMessage = {
      text: language === 'english' ? "Language set to English." : 
            language === 'spanish' ? "Idioma configurado a Español." :
            language === 'french' ? "Langue définie sur Français." :
            "Language updated.",
      sender: "system",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    
    setMessages(prevMessages => [...prevMessages, systemMessage]);
  };
  // Format message text with proper markdown support
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Replace markdown with HTML
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Create elements based on line type
    const lines = formattedText.split('\n').map((line, i) => {
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} className="message-list-item" dangerouslySetInnerHTML={{ __html: line }} />;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="message-heading" dangerouslySetInnerHTML={{ __html: line }} />;
      } else if (line.trim() === '') {
        return <div key={i} className="message-spacer" />;
      } else {
        return <div key={i} className="message-paragraph" dangerouslySetInnerHTML={{ __html: line }} />;
      }
    });
  
    return <div className="formatted-message">{lines}</div>;
  };
  
  // Render health info cards with appropriate styling
  const renderHealthInfoCards = (cards) => {
    if (!cards || cards.length === 0) return null;
    
    return (
      <div className="health-info-cards">
        {cards.map((card, index) => (
          <div key={index} className={`health-info-card ${card.type}`}>
            <div className="card-header">
              {card.type === 'emergency' && <Icons.Emergency />}
              {card.type === 'warning' && <Icons.Info />}
              {card.type === 'info' && <Icons.Info />}
              {card.type === 'success' && <Icons.Heart />}
              <h4>{card.title}</h4>
            </div>
            <div className="card-content">
              {card.content}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Create tooltip component
  const Tooltip = ({ text, children }) => {
    if (!showTooltips) return children;
    
    return (
      <div className="tooltip-container">
        {children}
        <div className="tooltip-text">{text}</div>
      </div>
    );
  };
  
  return (
    <div 
      className={`dr-health-container ${darkMode ? 'dark' : ''}`} 
      aria-live="polite"
      data-ai-level={aiLevel}
    >
      {/* Chat toggle button with improved accessibility */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? "Close health assistant" : "Open health assistant"}
        title={isOpen ? "Close health assistant" : "Open health assistant"}
      >
        {isOpen ? <Icons.Close /> : <Icons.Chat />}
        {!isOpen && unreadCount > 0 && (
          <span className="chat-badge" aria-label={`${unreadCount} unread messages`}>
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Accessibility menu toggle button */}
      {isOpen && (
        <Tooltip text="Accessibility Options">
          <button 
            className="accessibility-toggle-btn"
            onClick={() => setShowAccessibilityMenu(prev => !prev)}
            aria-label={showAccessibilityMenu ? "Close accessibility menu" : "Open accessibility menu"}
            title={showAccessibilityMenu ? "Close accessibility menu" : "Open accessibility menu"}
          >
            <Icons.Accessibility />
          </button>
        </Tooltip>
      )}
      
      {/* Settings toggle button */}
      {isOpen && (
        <Tooltip text="Settings">
          <button 
            className="settings-toggle-btn"
            onClick={() => setShowSettings(prev => !prev)}
            aria-label={showSettings ? "Close settings" : "Open settings"}
            title={showSettings ? "Close settings" : "Open settings"}
          >
            <Icons.Settings />
          </button>
        </Tooltip>
      )}
      
      {/* Export button */}
      {isOpen && allowExport && (
        <Tooltip text="Export Chat">
          <button 
            className="export-btn"
            onClick={exportChatHistory}
            aria-label="Export chat history"
            title="Export chat history"
          >
            <Icons.Export />
          </button>
        </Tooltip>
      )}
      
      {/* Health tip button */}
      {isOpen && showHealthTips && (
        <Tooltip text="Health Tip">
          <button 
            className="health-tip-btn"
            onClick={addHealthTip}
            aria-label="Show health tip"
            title="Show health tip"
          >
            <Icons.Heart />
          </button>
        </Tooltip>
      )}
      
      {/* Accessibility menu panel */}
      {isOpen && showAccessibilityMenu && (
        <div className="accessibility-menu" aria-label="Accessibility options">
          <h3>Accessibility Options</h3>
          <div className="accessibility-controls">
            <div className="accessibility-option">
              <label htmlFor="font-size">Text Size:</label>
              <div className="control-buttons">
                <button 
                  onClick={decreaseFontSize} 
                  disabled={fontSizeLevel === 1}
                  aria-label="Decrease text size"
                >
                  A-
                </button>
                <span>{fontSizeLevel}/4</span>
                <button 
                  onClick={increaseFontSize} 
                  disabled={fontSizeLevel === 4}
                  aria-label="Increase text size"
                >
                  A+
                </button>
              </div>
            </div>
            
            <div className="accessibility-option">
              <label htmlFor="high-contrast">High Contrast:</label>
              <button 
                className={highContrast ? 'toggle-on' : 'toggle-off'}
                onClick={toggleHighContrast}
                aria-pressed={highContrast}
                aria-label="Toggle high contrast mode"
              >
                {highContrast ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="accessibility-option">
              <label htmlFor="audio-feedback">Audio Feedback:</label>
              <button 
                className={audioFeedback ? 'toggle-on' : 'toggle-off'}
                onClick={toggleAudioFeedback}
                aria-pressed={audioFeedback}
                aria-label="Toggle audio feedback"
              >
                {audioFeedback ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="accessibility-option">
              <label htmlFor="text-to-speech">Text-to-Speech:</label>
              <button 
                className={textToSpeech ? 'toggle-on' : 'toggle-off'}
                onClick={toggleTextToSpeech}
                aria-pressed={textToSpeech}
                aria-label="Toggle text-to-speech"
              >
                {textToSpeech ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="accessibility-option">
              <label htmlFor="reduced-motion">Reduced Motion:</label>
              <button 
                className={reducedMotion ? 'toggle-on' : 'toggle-off'}
                onClick={toggleReducedMotion}
                aria-pressed={reducedMotion}
                aria-label="Toggle reduced motion"
              >
                {reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <button 
              className="reset-settings-btn"
              onClick={resetAccessibilitySettings}
              aria-label="Reset accessibility settings to default"
            >
              Reset to Default
            </button>
          </div>
          
          <h3>Language Settings</h3>
          <div className="language-settings">
            <div className="language-option">
              <label htmlFor="language">Interface Language:</label>
              <div className="language-buttons">
                <button 
                  className={selectedLanguage === 'english' ? 'selected' : ''}
                  onClick={() => changeLanguage('english')}
                  aria-pressed={selectedLanguage === 'english'}
                  aria-label="English"
                >
                  English
                </button>
                <button 
                  className={selectedLanguage === 'spanish' ? 'selected' : ''}
                  onClick={() => changeLanguage('spanish')}
                  aria-pressed={selectedLanguage === 'spanish'}
                  aria-label="Spanish"
                >
                  Español
                </button>
                <button 
                  className={selectedLanguage === 'french' ? 'selected' : ''}
                  onClick={() => changeLanguage('french')}
                  aria-pressed={selectedLanguage === 'french'}
                  aria-label="French"
                >
                  Français
                </button>
              </div>
            </div>
          </div>
          
          <h3>AI Assistant Settings</h3>
          <div className="ai-settings">
            <div className="ai-option">
              <label htmlFor="ai-level">AI Level:</label>
              <div className="ai-level-buttons">
                <button 
                  className={aiLevel === 1 ? 'selected' : ''}
                  onClick={() => changeAILevel(1)}
                  aria-pressed={aiLevel === 1}
                  aria-label="Basic AI"
                  title="Faster responses, less detailed"
                >
                  Basic
                </button>
                <button 
                  className={aiLevel === 2 ? 'selected' : ''}
                  onClick={() => changeAILevel(2)}
                  aria-pressed={aiLevel === 2}
                  aria-label="Advanced AI"
                  title="Balanced speed and detail"
                >
                  Advanced
                </button>
                <button 
                  className={aiLevel === 3 ? 'selected' : ''}
                  onClick={() => changeAILevel(3)}
                  aria-pressed={aiLevel === 3}
                  aria-label="Comprehensive AI"
                  title="Most detailed responses"
                >
                  Comprehensive
                </button>
              </div>
            </div>
            
            <div className="ai-option">
              <label htmlFor="show-thinking">Show AI Thinking:</label>
              <button 
                className={showThinking ? 'toggle-on' : 'toggle-off'}
                onClick={toggleShowThinking}
                aria-pressed={showThinking}
                aria-label="Toggle AI thinking animation"
              >
                {showThinking ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="ai-option">
              <label htmlFor="show-health-tips">Health Tips:</label>
              <button 
                className={showHealthTips ? 'toggle-on' : 'toggle-off'}
                onClick={toggleShowHealthTips}
                aria-pressed={showHealthTips}
                aria-label="Toggle health tips"
              >
                {showHealthTips ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="ai-option">
              <button 
                className="reset-profile-btn"
                onClick={resetUserProfile}
                aria-label="Reset health profile"
              >
                Reset Health Profile
              </button>
              <p className="profile-note">
                Clears saved health conditions, medications, and demographics
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings panel */}
      {isOpen && showSettings && (
        <div className="settings-menu" aria-label="Settings">
          <h3>Display Settings</h3>
          <div className="settings-controls">
            <div className="settings-option">
              <label htmlFor="show-tooltips">Show Tooltips:</label>
              <button 
                className={showTooltips ? 'toggle-on' : 'toggle-off'}
                onClick={() => setShowTooltips(prev => !prev)}
                aria-pressed={showTooltips}
                aria-label="Toggle tooltips"
              >
                {showTooltips ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="settings-option">
              <label htmlFor="show-sidebar">Info Sidebar:</label>
              <button 
                className={showSidebar ? 'toggle-on' : 'toggle-off'}
                onClick={() => setShowSidebar(prev => !prev)}
                aria-pressed={showSidebar}
                aria-label="Toggle sidebar"
              >
                {showSidebar ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="settings-option">
              <label htmlFor="activity-log">Show Activity Log:</label>
              <button 
                className={showActivityLog ? 'toggle-on' : 'toggle-off'}
                onClick={() => setShowActivityLog(prev => !prev)}
                aria-pressed={showActivityLog}
                aria-label="Toggle activity log"
              >
                {showActivityLog ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          
          <h3>Feature Settings</h3>
          <div className="feature-controls">
            <div className="feature-option">
              <label htmlFor="export-feature">Export Feature:</label>
              <button 
                className={allowExport ? 'toggle-on' : 'toggle-off'}
                onClick={() => setAllowExport(prev => !prev)}
                aria-pressed={allowExport}
                aria-label="Toggle export feature"
              >
                {allowExport ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="feature-option">
              <label htmlFor="med-reminders">Medication Reminders:</label>
              <button 
                className={allowMedicationReminders ? 'toggle-on' : 'toggle-off'}
                onClick={() => setAllowMedicationReminders(prev => !prev)}
                aria-pressed={allowMedicationReminders}
                aria-label="Toggle medication reminders"
              >
                {allowMedicationReminders ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="feature-option">
              <label htmlFor="location-service">Location Service:</label>
              <button 
                className={allowLocationService ? 'toggle-on' : 'toggle-off'}
                onClick={() => setAllowLocationService(prev => !prev)}
                aria-pressed={allowLocationService}
                aria-label="Toggle location service"
              >
                {allowLocationService ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          
          <h3>Data Management</h3>
          <div className="data-controls">
            <button 
              className="export-chat-btn"
              onClick={exportChatHistory}
              aria-label="Export chat history"
            >
              Export Chat History
            </button>
            
            <button 
              className="generate-summary-btn"
              onClick={generateMedicalSummary}
              aria-label="Generate medical summary"
            >
              Generate Medical Summary
            </button>
            
            <button 
              className="clear-chat-btn"
              onClick={handleClearChat}
              aria-label="Clear conversation"
            >
              Clear Conversation
            </button>
          </div>
        </div>
      )}
      {/* Chat window with accessibility enhancements */}
      <div 
        className={`chat-window ${isOpen ? 'open' : ''}`} 
        ref={chatWindowRef}
        role="region"
        aria-label="Health assistant chat"
      >
        <div className="chat-header" role="banner">
          <div className="header-left">
            <div className="header-avatar">
              <Icons.Assistant />
            </div>
            <div className="header-info">
              <h3>Dr. Health</h3>
              <span className="status-indicator">AI Medical Assistant</span>
            </div>
          </div>
          <div className="header-actions">
            {/* Voice input toggle button */}
            <button 
              className={`voice-btn ${voiceInput ? 'active' : ''}`}
              onClick={toggleVoiceInput}
              aria-label={voiceInput ? "Stop voice input" : "Start voice input"}
              title={voiceInput ? "Stop voice input" : "Start voice input"}
            >
              <Icons.Voice />
            </button>
            <button 
              className="clear-btn"
              onClick={handleClearChat}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Icons.Clear />
            </button>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close health assistant"
              title="Close health assistant"
            >
              <Icons.Close />
            </button>
          </div>
        </div>
        
        <div 
          className="messages-container" 
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* AI Status Indicator */}
          <div className="ai-status">
            <div className="ai-status-icon">
              <span className="ai-pulse"></span>
            </div>
            <div className="ai-status-text">
              <Icons.AIBrain /> {aiLevel === 1 ? "Basic" : aiLevel === 2 ? "Advanced" : "Comprehensive"} AI Medical Assistant
            </div>
          </div>
          
          {/* Medical safety notice - New Feature */}
          <div className="medical-safety-notice">
            <Icons.Certificate /> <strong>Medical AI Assistant</strong>
            <p>The information provided is for educational purposes only and is not a substitute for professional medical advice.</p>
          </div>
          
          {/* Chat messages with improved accessibility */}
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender} ${message.type || ''} ${message.urgencyLevel || ''} ${message.isFollowUp ? 'follow-up' : ''}`}
              role={message.sender === "assistant" ? "status" : "none"}
              aria-label={`${message.sender === "assistant" ? "Dr. Health" : message.sender === "system" ? "System" : "You"} at ${message.timestamp}`}
            >
              {message.sender === "assistant" && (
                <div className="avatar assistant-avatar" aria-hidden="true">
                  <Icons.Assistant />
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {formatMessageText(message.text)}
                  
                  {/* Render health info cards if present */}
                  {message.healthInfoCards && message.healthInfoCards.length > 0 && 
                    renderHealthInfoCards(message.healthInfoCards)
                  }
                </div>
                <div className="message-timestamp" aria-hidden="true">
                  {message.timestamp}
                  {message.aiGenerated && (
                    <span className="ai-indicator" title="AI generated response">
                      <Icons.AIBrain />
                    </span>
                  )}
                </div>
                
                {/* Message feedback buttons for AI responses */}
                {message.sender === "assistant" && !message.isFollowUp && (
                  <div className="message-feedback">
                    <button 
                      className="feedback-btn helpful" 
                      aria-label="This was helpful"
                      title="This was helpful"
                    >
                      <Icons.Heart />
                    </button>
                  </div>
                )}
              </div>
              {message.sender === "user" && (
                <div className="avatar user-avatar" aria-hidden="true">
                  <Icons.User />
                </div>
              )}
            </div>
          ))}
          
          {/* Enhanced AI thinking indicator */}
          {isTyping && (
            <div 
              className="message assistant thinking"
              role="status"
              aria-label={processingAI ? "AI analyzing your health query" : "AI is typing"}
            >
              <div className="avatar assistant-avatar" aria-hidden="true">
                <Icons.Assistant />
              </div>
              <div className="message-content">
                <div className="message-bubble typing-indicator" aria-hidden="true">
                  {processingAI ? (
                    <div className="ai-thinking-indicator">
                      <div className="ai-thinking-animation">
                        <svg width="24" height="24" viewBox="0 0 24 24" className="thinking-brain">
                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="#0065A3" strokeWidth="1.5" fill="none"/>
                          <path className="pulse" d="M12 7V10M12 14V17M7 12H10M14 12H17" stroke="#0065A3" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="ai-thinking-text">Dr. Health analyzing medical information...</span>
                    </div>
                  ) : (
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Enhanced AI-suggested queries with improved UI */}
        <div 
          className="suggested-queries-container"
          role="region" 
          aria-label="AI suggested health questions"
        >
          <div className="suggested-title">
            <Icons.Clipboard /> <span>Ask me about:</span>
          </div>
          <div className="suggested-queries">
            {suggestedQueries.map((query, index) => (
              <button 
                key={index}
                className="query-pill"
                onClick={() => handleSuggestedQuery(query)}
                aria-label={`Ask about: ${query}`}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
        
        {/* Input form with voice input button */}
        <form 
          className={`input-container ${voiceInput ? 'voice-recording' : ''}`}
          onSubmit={handleSendMessage}
          role="search"
          aria-label="Ask a health question"
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={voiceInput ? "Listening... speak your health question" : "Ask Dr. Health about your health concerns..."}
            aria-label="Type your health question"
            ref={inputRef}
          />
          <button 
            type="button"
            onClick={toggleVoiceInput}
            aria-label={voiceInput ? "Stop voice input" : "Start voice input"}
            className={`voice-input-button ${voiceInput ? 'recording' : ''}`}
            title={voiceInput ? "Stop voice input" : "Start voice input"}
          >
            <Icons.Voice />
          </button>
          <button 
            type="submit"
            disabled={input.trim() === ''}
            aria-label="Send message"
            className="send-button"
          >
            <Icons.Send />
          </button>
        </form>
        
        {/* AI-powered health disclaimer */}
        <div className="ai-disclaimer">
          <strong>Health Information Disclaimer:</strong> This AI provides information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers.
        </div>
      </div>
    </div>
  );
}

export default DrHealthChatbot;