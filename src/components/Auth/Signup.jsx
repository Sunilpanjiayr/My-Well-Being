import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { db, auth, googleProvider } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import PhoneInput from 'react-phone-input-2';
import axios from "axios";
import 'react-phone-input-2/lib/style.css';
import manAvatar from './man_avatar.jpg';
import womanAvatar from './woman_avatar.jpg';

// Initialize Firebase Storage
const storage = getStorage();

const Signup = () => {
  // General states
  const [step, setStep] = useState("signup"); // signup, verifyEmail, verifyPhone
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // New states for gender and avatar
  const [gender, setGender] = useState("male");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(manAvatar);

  // Signup form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // OTP verification states
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");

  // Update avatar preview when gender changes (if no custom avatar selected)
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(gender === "male" ? manAvatar : womanAvatar);
    }
  }, [gender, avatarFile]);

  // CONSULTATION SETUP FUNCTIONS
  
  // Generate consultation-ready user profile
  const createConsultationProfile = async (user, userType, additionalData = {}) => {
    try {
      const consultationProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        photoURL: user.photoURL,
        userType: userType, // 'patient' or 'doctor'
        
        // Consultation-specific settings
        consultationSettings: {
          preferredVideoQuality: 'auto',
          autoJoinVideo: true,
          autoJoinAudio: true,
          enableChat: true,
          enableFileSharing: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language || 'en-US'
        },
        
        // Video conference preferences
        videoPreferences: {
          defaultVideoMuted: false,
          defaultAudioMuted: false,
          enableScreenShare: userType === 'doctor',
          enableRecording: userType === 'doctor' && additionalData.isVerified,
          maxParticipants: userType === 'doctor' ? 10 : 2
        },
        
        // Additional user-specific data
        ...additionalData,
        
        // Timestamps
        createdAt: new Date().toISOString(),
        lastConsultationAt: null,
        consultationCount: 0,
        
        // Status
        isActive: true,
        consultationStatus: 'available' // available, busy, offline
      };

      // Save to appropriate collection
      const collection = userType === 'doctor' ? 'doctors' : 'users';
      await setDoc(doc(db, collection, user.uid), consultationProfile);
      
      // Also save a consultation-ready profile in a unified collection
      await setDoc(doc(db, 'consultationProfiles', user.uid), {
        uid: user.uid,
        displayName: consultationProfile.displayName,
        userType: userType,
        consultationSettings: consultationProfile.consultationSettings,
        videoPreferences: consultationProfile.videoPreferences,
        isActive: true,
        lastUpdated: new Date().toISOString()
      });

      console.log(`✅ Created consultation profile for ${userType}:`, user.uid);
      return consultationProfile;
      
    } catch (error) {
      console.error('❌ Error creating consultation profile:', error);
      throw error;
    }
  };

  // Generate deterministic consultation room identifier
  const generateConsultationRoomId = (doctorId, patientId, scheduledTime = null) => {
    const timestamp = scheduledTime ? new Date(scheduledTime).getTime() : Date.now();
    const participants = [doctorId, patientId].sort().join('-');
    const dateStr = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Create a deterministic but unique room ID
    const roomData = `${participants}-${dateStr}`;
    const roomHash = btoa(roomData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    
    return `consult-${roomHash}`;
  };

  // Create a consultation session
  const createConsultationSession = async (doctorId, patientId, consultationType = 'general') => {
    try {
      const roomId = generateConsultationRoomId(doctorId, patientId);
      
      const consultationData = {
        id: roomId,
        doctorId: doctorId,
        patientId: patientId,
        type: consultationType,
        status: 'scheduled',
        
        // Video conference settings
        videoRoom: {
          roomName: `health-${roomId}`,
          maxParticipants: 2,
          requireAuth: false, // Keep false for public Jitsi
          enableRecording: false,
          enableScreenShare: true,
          enableChat: true
        },
        
        // Participant info
        participants: {
          [doctorId]: {
            role: 'doctor',
            status: 'invited',
            joinedAt: null
          },
          [patientId]: {
            role: 'patient', 
            status: 'invited',
            joinedAt: null
          }
        },
        
        // Timestamps
        createdAt: serverTimestamp(),
        scheduledDateTime: serverTimestamp(),
        startedAt: null,
        endedAt: null,
        lastActivity: serverTimestamp(),
        
        // Settings
        settings: {
          autoEndAfterMinutes: 60, // Auto-end after 1 hour of inactivity
          allowFileSharing: true,
          enableChatTranscript: true,
          notifyOnJoin: true
        }
      };

      // Save consultation to Firestore
      await setDoc(doc(db, 'consultations', roomId), consultationData);
      
      console.log('✅ Created consultation session:', roomId);
      return { roomId, consultationData };
      
    } catch (error) {
      console.error('❌ Error creating consultation session:', error);
      throw error;
    }
  };

  // Update user profile after successful signup
  const setupUserForConsultations = async (user, userType, userData) => {
    try {
      // Create consultation profile
      await createConsultationProfile(user, userType, userData);
      
      // Update user's auth profile with consultation-ready display name
      const displayName = userData.username || user.displayName || user.email?.split('@')[0];
      
      await updateProfile(user, {
        displayName: displayName,
        photoURL: user.photoURL || userData.avatarUrl
      });
      
      console.log('✅ User setup completed for consultations');
      return true;
      
    } catch (error) {
      console.error('❌ Error setting up user for consultations:', error);
      return false;
    }
  };

  // EXISTING FUNCTIONS (unchanged)

  // Styles
  const styles = {
    // Container Styles
    signupContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ebf4ff, #ffffff, #ebf4ff)',
      padding: '20px'
    },
    signupWrapper: {
      width: '100%',
      maxWidth: '480px'
    },
    verificationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ebf4ff, #ffffff, #ebf4ff)',
      padding: '20px'
    },
    verificationWrapper: {
      width: '100%',
      maxWidth: '480px'
    },
    
    // Header Styles
    signupHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    verificationHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logoContainer: {
      display: 'inline-block',
      padding: '1rem',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      marginBottom: '1rem'
    },
    logoIcon: {
      height: '3rem',
      width: '3rem',
      color: '#fff',
      scale: '2.4'
    },
    appTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '0.5rem'
    },
    appSubtitle: {
      fontSize: '1.125rem',
      color: '#6b7280'
    },
    
    // Signup Box
    signupBox: {
      backgroundColor: '#fff',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    verificationBox: {
      backgroundColor: '#fff',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    welcomeBanner: {
      background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
      padding: '1.25rem 1.5rem',
      color: '#fff'
    },
    welcomeBannerH2: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    welcomeBannerP: {
      opacity: '0.9'
    },
    signupContent: {
      padding: '1.5rem'
    },
    verificationContent: {
      padding: '1.5rem'
    },
    
    // Error message
    errorMessage: {
      marginBottom: '1.5rem',
      padding: '0.75rem',
      backgroundColor: '#fee2e2',
      borderLeft: '4px solid #ef4444',
      color: '#b91c1c',
      borderRadius: '0 0.5rem 0.5rem 0',
      fontSize: '0.875rem'
    },
    errorContent: {
      display: 'flex',
      alignItems: 'center'
    },
    errorIcon: {
      height: '1.25rem',
      width: '1.25rem',
      marginRight: '0.5rem',
      flexShrink: '0'
    },
    
    // Section Styles
    signupSection: {
      marginBottom: '1.5rem',
      paddingBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#333'
    },
    
    // Form Elements
    signupForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#333',
      marginBottom: '0.25rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    usernameInputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    usernameAvailable: {
      borderColor: '#10b981'
    },
    usernameUnavailable: {
      borderColor: '#ef4444'
    },
    usernameStatus: {
      position: 'absolute',
      right: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    availableIcon: {
      width: '20px',
      height: '20px',
      color: '#10b981'
    },
    unavailableIcon: {
      width: '20px',
      height: '20px',
      color: '#ef4444'
    },
    usernameChecking: {
      position: 'absolute',
      right: '10px'
    },
    checkingSpinner: {
      display: 'inline-block',
      width: '16px',
      height: '16px',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    helperText: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    
    // Phone Input Customization
    phoneInputContainer: {
      marginTop: '0.25rem'
    },
    phoneContainer: {
      width: '100%'
    },
    phoneInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    
    // Gender selection styles
    genderGroup: {
      display: 'flex',
      gap: '20px',
      marginTop: '8px'
    },
    genderOption: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer'
    },
    genderRadio: {
      marginRight: '8px'
    },
    
    // Avatar styles
    avatarGroup: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '10px'
    },
    avatarPreview: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #3b82f6',
      marginBottom: '15px'
    },
    avatarUploadButton: {
      padding: '8px 15px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      border: 'none',
      display: 'inline-block',
      textAlign: 'center',
      marginBottom: '8px'
    },
    avatarNote: {
      fontSize: '0.75rem',
      color: '#6b7280',
      textAlign: 'center',
      marginTop: '5px'
    },
    
    // Buttons
    submitButton: {
      width: '100%',
      padding: '0.75rem 1rem',
      color: '#fff',
      fontWeight: '500',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginTop: '0.5rem'
    },
    emailButton: {
      background: 'linear-gradient(to right, #3b82f6, #1d4ed8)'
    },
    phoneButton: {
      background: 'linear-gradient(to right, #10b981, #059669)'
    },
    secondaryButton: {
      width: '100%',
      padding: '0.75rem 1rem',
      backgroundColor: '#e5e7eb',
      color: '#333',
      fontWeight: '500',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '1rem'
    },
    
    // Google Button
    googleButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem 1rem',
      background: 'linear-gradient(to right, #ef4444, #dc2626)',
      color: '#fff',
      fontWeight: '500',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    googleIcon: {
      height: '1.25rem',
      width: '1.25rem',
      marginRight: '0.5rem'
    },
    
    // Loading Spinner
    loadingIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      height: '1rem',
      width: '1rem',
      marginRight: '0.5rem'
    },
    spinnerTrack: {
      opacity: '0.25'
    },
    spinnerPath: {
      opacity: '0.75'
    },
    
    // Divider
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0'
    },
    dividerLine: {
      flexGrow: '1',
      borderTop: '1px solid #e5e7eb'
    },
    dividerText: {
      flexShrink: '0',
      margin: '0 1rem',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    
    // Health Notice
    healthNotice: {
      marginTop: '1.5rem',
      backgroundColor: '#ebf8ff',
      borderRadius: '8px',
      padding: '0.75rem',
      fontSize: '0.875rem',
      color: '#2c5282'
    },
    noticeContent: {
      display: 'flex'
    },
    noticeIcon: {
      height: '1.25rem',
      width: '1.25rem',
      color: '#3182ce',
      marginRight: '0.5rem',
      flexShrink: '0'
    },
    
    // Login Link
    loginLink: {
      marginTop: '1.5rem',
      textAlign: 'center'
    },
    signinLink: {
      fontWeight: '500',
      color: '#3b82f6',
      textDecoration: 'none',
      transition: 'all 0.3s ease'
    },
    
    // Footer
    footer: {
      marginTop: '2rem',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    footerLinks: {
      marginTop: '0.5rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem'
    },
    footerLink: {
      color: '#6b7280',
      textDecoration: 'none',
      transition: 'all 0.3s ease'
    },
    
    // Verification Specific Styles
    verificationIconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    verificationIcon: {
      height: '4rem',
      width: '4rem',
      color: '#3b82f6',
      padding: '1rem',
      backgroundColor: '#d1fae5',
      borderRadius: '50%'
    },
    verificationTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1rem',
      color: '#333'
    },
    verificationMessage: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      color: '#6b7280'
    },
    verificationActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    verificationNote: {
      marginTop: '1.5rem',
      padding: '0.75rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#6b7280',
      textAlign: 'center'
    },
    otpInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1.25rem',
      textAlign: 'center',
      letterSpacing: '0.25rem',
      transition: 'all 0.3s ease'
    },
    resendButton: {
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      fontWeight: '500',
      cursor: 'pointer',
      padding: '0',
      textDecoration: 'underline'
    }
  };

  // Username availability check using Firestore
  const checkUsernameExists = async (username) => {
    try {
      // Convert username to lowercase for case-insensitive comparison
      const usernameToCheck = username.toLowerCase();
      
      // Check if username exists in the 'usernames' collection
      const usernameRef = doc(db, 'usernames', usernameToCheck);
      const usernameSnapshot = await getDoc(usernameRef);
      
      return usernameSnapshot.exists();
    } catch (error) {
      console.error('Error checking username:', error);
      return false; // Assume username is available if there's an error
    }
  };
  
  // Save username to Firestore
  const saveUsername = async (username, userId) => {
    try {
      // Convert username to lowercase for case-insensitive storage
      const usernameToSave = username.toLowerCase();
      
      // Save username to the 'usernames' collection with timestamp
      await setDoc(doc(db, 'usernames', usernameToSave), {
        username: username, // Original case for display
        createdAt: new Date().toISOString(),
        userId: userId || 'pending',
        userType: 'patient' // Add userType to distinguish between patients and doctors
      });
      
      return true;
    } catch (error) {
      console.error('Error saving username:', error);
      return false;
    }
  };

  // Handle avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar to Firebase Storage
  const uploadAvatar = async (userId) => {
    try {
      if (!avatarFile) {
        // Return the default avatar based on gender
        return gender === "male" ? manAvatar : womanAvatar;
      }
  
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `avatars/${userId}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, avatarFile);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('Avatar uploaded to Firebase Storage:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Return default avatar as fallback
      return gender === "male" ? manAvatar : womanAvatar;
    }
  };

  // Check username availability when username changes
  useEffect(() => {
    // Skip if username is too short
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Debounce username check
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const exists = await checkUsernameExists(username);
        setUsernameAvailable(!exists);
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Clean up any stray reCAPTCHA elements on component mount and unmount
  useEffect(() => {
    const cleanupRecaptcha = () => {
      // Cleanup any existing reCAPTCHA iframes
      const recaptchaElements = document.querySelectorAll('iframe[src*="recaptcha"]');
      recaptchaElements.forEach(element => {
        try {
          element.parentNode.removeChild(element);
        } catch (e) {
          console.log("Error removing reCAPTCHA element", e);
        }
      });
      
      // Remove any global reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.log("Error clearing reCAPTCHA verifier", e);
        }
      }
    };
    
    // Call cleanup on mount (in case of previous leftovers)
    cleanupRecaptcha();
    
    // Call cleanup on unmount
    return cleanupRecaptcha;
  }, []);

  // Email verification listener
  useEffect(() => {
    if (step === "verifyEmail") {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Check if the email is already verified
          if (user.emailVerified) {
            navigate("/dashboardHome", { replace: true }); // Redirect to dashboard
          } else {
            // Force a reload of the user's authentication state
            try {
              await user.reload();
              if (user.emailVerified) {
                navigate("/dashboardHome", { replace: true }); // Redirect to dashboard
              }
            } catch (error) {
              console.error("Error reloading user:", error);
            }
          }
        }
      });
      
      return () => unsubscribe(); // Cleanup subscription
    }
  }, [step, navigate]);

  // Retrieve verification ID from session storage if in verify phone step
  useEffect(() => {
    if (step === "verifyPhone") {
      // Get the verificationId from session storage
      const storedVerificationId = window.sessionStorage.getItem("verificationId");
      
      if (!storedVerificationId) {
        setError("Verification session expired or invalid. Please try again.");
        return;
      }
      
      setVerificationId(storedVerificationId);
      console.log("Retrieved verificationId:", storedVerificationId);
    }
  }, [step]);

  // ENHANCED Email/Password Sign-Up with Consultation Setup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    // Validate username
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Check username again right before signup (to handle race conditions)
      const exists = await checkUsernameExists(username);
      if (exists) {
        setError("Username was just taken. Please try another.");
        setLoading(false);
        return;
      }
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload avatar and get the URL
      const avatarUrl = await uploadAvatar(user.uid);
      
      // Prepare user data for consultation setup
      const userData = {
        username,
        email: user.email,
        gender,
        avatarUrl,
        // Add consultation-specific data for patients
        medicalInfo: {
          hasAllergies: false,
          currentMedications: [],
          emergencyContact: null
        }
      };

      // Setup user for consultations (this replaces the old profile update)
      await setupUserForConsultations(user, 'patient', userData);
      
      // Save username to Firestore and link it to this user
      await saveUsername(username, user.uid);

      // Send email verification
      await sendEmailVerification(user);
      setStep("verifyEmail"); // Move to email verification step
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError(`Failed to sign up: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED Google Sign-Up with Consultation Setup
  const handleGoogleSignup = async () => {
    // If username is provided, validate it
    if (username) {
      if (username.length < 3) {
        setError("Username must be at least 3 characters");
        return;
      }
      
      if (usernameAvailable === false) {
        setError("Username is already taken");
        return;
      }
    }
    
    setLoading(true);
    setError("");
    
    try {
      // If username is provided, check it again right before signup
      if (username && username.length >= 3) {
        const exists = await checkUsernameExists(username);
        if (exists) {
          setError("Username was just taken. Please try another.");
          setLoading(false);
          return;
        }
      }
      
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Upload avatar if a custom one is selected
      const avatarUrl = await uploadAvatar(user.uid);
      
      let displayName = username;
      
      // If username is provided, update the profile and save to Firestore
      if (username && username.length >= 3) {
        displayName = username;
        await saveUsername(username, user.uid);
      } else if (!user.displayName) {
        // If user has no display name from Google, use email prefix
        displayName = user.email.split('@')[0];
      } else {
        displayName = user.displayName;
      }
      
      // Prepare user data for consultation setup
      const userData = {
        username: displayName,
        email: user.email,
        gender,
        avatarUrl,
        // Add consultation-specific data for patients
        medicalInfo: {
          hasAllergies: false,
          currentMedications: [],
          emergencyContact: null
        }
      };

      // Setup user for consultations
      await setupUserForConsultations(user, 'patient', userData);
      
      navigate("/dashboardHome"); // Redirect to dashboard after successful sign-up
    } catch (error) {
      console.error("Error signing up with Google:", error.message);
      setError(`Failed to sign up with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED Phone Number Sign-Up with Consultation Setup
  const handlePhoneSignup = async () => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }
    
    // Validate username
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Check username again right before signup
      const exists = await checkUsernameExists(username);
      if (exists) {
        setError("Username was just taken. Please try another.");
        setLoading(false);
        return;
      }
      
      // Format phone number - ensure it has a plus
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      console.log("Sending OTP to:", formattedPhone);
      
      // Clean up existing reCAPTCHA container
      const recaptchaContainer = document.getElementById('recaptcha');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      
      // Create a fresh div for reCAPTCHA 
      const recaptchaId = `recaptcha-${Date.now()}`;
      const recaptchaDiv = document.createElement('div');
      recaptchaDiv.id = recaptchaId;
      recaptchaContainer.appendChild(recaptchaDiv);
      
      // Initialize reCAPTCHA
      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaId,
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA verified successfully");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            setError("reCAPTCHA expired. Please try again.");
            setLoading(false);
          }
        }
      );
      
      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      console.log("OTP sent successfully");
      
      // Store verification ID, phone number, username, and gender in session storage
      window.sessionStorage.setItem("verificationId", confirmationResult.verificationId);
      window.sessionStorage.setItem("phoneNumber", formattedPhone);
      window.sessionStorage.setItem("username", username);
      window.sessionStorage.setItem("gender", gender);
      
      // If a custom avatar is selected, store it temporarily
      if (avatarFile) {
        const reader = new FileReader();
        reader.readAsDataURL(avatarFile);
        reader.onloadend = () => {
          window.sessionStorage.setItem("avatarPreview", reader.result);
        };
      }
      
      // Store verification ID in state and move to phone verification step
      setVerificationId(confirmationResult.verificationId);
      setStep("verifyPhone");
    } catch (error) {
      console.error("Error sending OTP:", error);
      
      // Provide specific error messages
      if (error.code === 'auth/invalid-phone-number') {
        setError("Invalid phone number format. Please use international format.");
      } else if (error.code === 'auth/captcha-check-failed') {
        setError("reCAPTCHA verification failed. Please try again.");
      } else if (error.code === 'auth/quota-exceeded') {
        setError("SMS quota exceeded. Please try again later.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(`Failed to send OTP: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification
  const handleResendEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      setLoading(true);
      try {
        await sendEmailVerification(user);
        alert("Verification email resent. Please check your inbox.");
      } catch (error) {
        console.error("Error resending verification email:", error.message);
        setError(`Failed to resend email: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError("You are not signed in. Please sign up again.");
      setStep("signup");
    }
  };

  // ENHANCED Verify OTP with Consultation Setup
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP code");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting verification with:");
      console.log("- Verification ID:", verificationId);
      console.log("- OTP:", otp);
      
      // Create a phone auth credential with the verification ID and OTP
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      console.log("Created credential successfully");
      
      // Sign in with the credential
      const result = await signInWithCredential(auth, credential);
      console.log("Sign-in successful:", result.user.uid);
      
      // Get data from session storage
      const storedUsername = window.sessionStorage.getItem("username");
      const storedGender = window.sessionStorage.getItem("gender") || "male";
      const storedAvatarPreview = window.sessionStorage.getItem("avatarPreview");
      
      // Upload avatar
      let avatarUrl;
      if (storedAvatarPreview && storedAvatarPreview.startsWith('data:image')) {
        // Create a blob from the data URL
        const response = await fetch(storedAvatarPreview);
        const blob = await response.blob();
        
        // Upload the blob to Firebase Storage
        const storageRef = ref(storage, `avatars/${result.user.uid}`);
        await uploadBytes(storageRef, blob);
        avatarUrl = await getDownloadURL(storageRef);
      } else {
        // Use default avatar based on gender
        avatarUrl = storedGender === "male" ? manAvatar : womanAvatar;
      }
      
      if (storedUsername && result.user) {
        // Check username again before setting
        const exists = await checkUsernameExists(storedUsername);
        let finalUsername = storedUsername;
        
        if (exists) {
          // Generate a random suffix for the username
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          finalUsername = `${storedUsername}${randomSuffix}`;
          setError(`Your preferred username was taken. You've been assigned: ${finalUsername}`);
        }
        
        // Prepare user data for consultation setup
        const userData = {
          username: finalUsername,
          phone: window.sessionStorage.getItem("phoneNumber"),
          gender: storedGender,
          avatarUrl,
          // Add consultation-specific data for patients
          medicalInfo: {
            hasAllergies: false,
            currentMedications: [],
            emergencyContact: null
          }
        };

        // Setup user for consultations
        await setupUserForConsultations(result.user, 'patient', userData);
        await saveUsername(finalUsername, result.user.uid);
      }
      
      // Clear the storage items
      window.sessionStorage.removeItem("verificationId");
      window.sessionStorage.removeItem("phoneNumber");
      window.sessionStorage.removeItem("username");
      window.sessionStorage.removeItem("gender");
      window.sessionStorage.removeItem("avatarPreview");
      
      // Redirect to dashboard
      navigate("/dashboardHome", { replace: true });
    } catch (error) {
      console.error("Verification failed with error:", error);
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);
      
      // For testing numbers, provide a development bypass
      if (process.env.NODE_ENV === 'development') {
        const phoneNumber = window.sessionStorage.getItem("phoneNumber");
        
        if (phoneNumber && phoneNumber.includes("+1 12345") && otp === "123456") {
          console.log("DEV MODE: Bypassing verification for test number");
          // Save username before redirecting
          const storedUsername = window.sessionStorage.getItem("username");
          const storedGender = window.sessionStorage.getItem("gender") || "male";
          
          if (storedUsername) {
            const exists = await checkUsernameExists(storedUsername);
            if (!exists) {
              const userData = {
                username: storedUsername,
                phone: phoneNumber,
                gender: storedGender,
                avatarUrl: storedGender === "male" ? manAvatar : womanAvatar,
                medicalInfo: {
                  hasAllergies: false,
                  currentMedications: [],
                  emergencyContact: null
                }
              };
              
              // Create a mock user for dev mode
              const mockUser = {
                uid: "dev-user-id",
                displayName: storedUsername,
                email: null,
                photoURL: userData.avatarUrl
              };
              
              await setupUserForConsultations(mockUser, 'patient', userData);
              await saveUsername(storedUsername, "dev-user-id");
            }
          }
          window.sessionStorage.removeItem("verificationId");
          window.sessionStorage.removeItem("phoneNumber");
          window.sessionStorage.removeItem("username");
          window.sessionStorage.removeItem("gender");
          window.sessionStorage.removeItem("avatarPreview");
          navigate("/dashboardHome", { replace: true });
          return;
        }
      }
      
      // Set appropriate error message based on error code
      if (error.code === "auth/invalid-verification-code") {
        setError("Invalid verification code. Please try again.");
      } else if (error.code === "auth/code-expired") {
        setError("Verification code has expired. Please request a new one.");
      } else if (error.code === "auth/invalid-credential") {
        setError("The verification details are invalid. Please try signing up again.");
      } else {
        setError(`Failed to verify: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render the main signup form
  const renderSignupForm = () => (
    <div style={styles.signupContainer}>
      <div style={styles.signupWrapper}>
        {/* Medical Logo and Header */}
        <div style={styles.signupHeader}>
          <div style={styles.logoContainer}>
            <img src={require('./logo.png')} alt="Logo" style={styles.logoIcon} />
          </div>
          <h1 style={styles.appTitle}>My Wellbeing</h1>
          <p style={styles.appSubtitle}>Create your health profile</p>
        </div>

        <div style={styles.signupBox}>
          {/* Welcome Banner */}
          <div style={styles.welcomeBanner}>
            <h2 style={styles.welcomeBannerH2}>Create Account</h2>
            <p style={styles.welcomeBannerP}>Join our health community today</p>
          </div>

          <div style={styles.signupContent}>
            {/* Error message */}
            {error && (
              <div style={styles.errorMessage}>
                <div style={styles.errorContent}>
                  <svg style={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Email/Password Sign-Up */}
            <div style={styles.signupSection}>
              <h3 style={styles.sectionTitle}>Sign Up with Email</h3>
              <form onSubmit={handleEmailSignup} style={styles.signupForm}>
                {/* Username field */}
                <div style={styles.formGroup}>
                  <label htmlFor="username" style={styles.formLabel}>
                    Username
                  </label>
                  <div style={styles.usernameInputWrapper}>
                    <input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{
                        ...styles.formInput,
                        ...(usernameAvailable === true ? styles.usernameAvailable : {}),
                        ...(usernameAvailable === false ? styles.usernameUnavailable : {})
                      }}
                      disabled={loading}
                      minLength={3}
                    />
                    {checkingUsername && (
                      <div style={styles.usernameChecking}>
                        <span style={{
                          ...styles.checkingSpinner,
                          animation: 'spin 1s linear infinite'
                        }}></span>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
                      <div style={styles.usernameStatus}>
                        <svg style={styles.availableIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <div style={styles.usernameStatus}>
                        <svg style={styles.unavailableIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={styles.helperText}>
                    Username must be at least 3 characters
                  </p>
                </div>
                
                {/* Gender Selection */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Gender</label>
                  <div style={styles.genderGroup}>
                    <label style={styles.genderOption}>
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        style={styles.genderRadio}
                      />
                      Male
                    </label>
                    <label style={styles.genderOption}>
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        style={styles.genderRadio}
                      />
                      Female
                    </label>
                  </div>
                </div>
                
                {/* Avatar Upload */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Profile Picture</label>
                  <div style={styles.avatarGroup}>
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      style={styles.avatarPreview}
                    />
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="avatar-upload" style={styles.avatarUploadButton}>
                      Upload Custom Avatar
                    </label>
                    <p style={styles.avatarNote}>
                      Default avatar will be used based on your gender if you don't upload a custom one
                    </p>
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.formLabel}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.formInput}
                    disabled={loading}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="password" style={styles.formLabel}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.formInput}
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  style={{...styles.submitButton, ...styles.emailButton}}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={styles.loadingIndicator}>
                      <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Sign Up with Email"
                  )}
                </button>
              </form>
            </div>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine}></div>
            </div>

            {/* Google Sign-Up */}
            <div style={styles.signupSection}>
              <button
                onClick={handleGoogleSignup}
                style={styles.googleButton}
                disabled={loading}
              >
                <svg style={styles.googleIcon} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                {loading ? "Processing..." : "Sign Up with Google"}
              </button>
            </div>

            {/* Phone Number Sign-Up */}
            <div style={styles.signupSection}>
              <h3 style={styles.sectionTitle}>Sign Up with Phone</h3>
              <div style={styles.formGroup}>
                <label htmlFor="phone" style={styles.formLabel}>
                  Phone Number
                </label>
                <div style={styles.phoneInputContainer}>
                  <PhoneInput
                    country={"us"}
                    id="phone"
                    value={phone}
                    onChange={(value) => setPhone("+" + value)}
                    inputClass="phone-input"
                    containerClass="phone-container"
                    disabled={loading}
                    containerStyle={styles.phoneContainer}
                    inputStyle={styles.phoneInput}
                  />
                </div>
              </div>
              {/* Invisible reCAPTCHA Container */}
              <div id="recaptcha"></div>
              <button
                type="button"
                onClick={handlePhoneSignup}
                style={{...styles.submitButton, ...styles.phoneButton}}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.loadingIndicator}>
                    <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Sign Up with Phone"
                )}
              </button>
            </div>

            {/* Health Information Notice */}
            <div style={styles.healthNotice}>
              <div style={styles.noticeContent}>
                <svg style={styles.noticeIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>By signing up, you agree to our Terms of Service and Privacy Policy. Your health information is protected by our strict privacy measures.</p>
              </div>
            </div>

            {/* Login Link */}
            <div style={styles.loginLink}>
              <p>
                Already have an account?{" "}
                <Link to="/login" style={styles.signinLink}>
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer style={styles.footer}>
          <p>© 2025 Health & Wellness Hub. All rights reserved.</p>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
            <a href="#" style={styles.footerLink}>Terms of Service</a>
            <a href="#" style={styles.footerLink}>Contact Support</a>
          </div>
        </footer>
      </div>
    </div>
  );

  // Render Email Verification UI
  const renderEmailVerification = () => (
    <div style={styles.verificationContainer}>
      <div style={styles.verificationWrapper}>
        {/* Logo and Header */}
        <div style={styles.verificationHeader}>
          <div style={styles.logoContainer}>
            <img src={require('./logo.png')} alt="Logo" style={styles.logoIcon} />
          </div>
          <h1 style={styles.appTitle}>Health & Wellness Hub</h1>
          <p style={styles.appSubtitle}>Email Verification</p>
        </div>

        <div style={styles.verificationBox}>
          <div style={styles.verificationContent}>
            <div style={styles.verificationIconContainer}>
              <svg style={styles.verificationIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 20 002 2z" />

              </svg>

            </div>

            <h2 style={styles.verificationTitle}>Verify Your Email</h2>

            

            {error && (

              <div style={styles.errorMessage}>

                <div style={styles.errorContent}>

                  <svg style={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />

                  </svg>

                  {error}

                </div>

              </div>

            )}

            

            <p style={styles.verificationMessage}>

              A verification email has been sent to your inbox. Please click the link in the email to verify your account.

            </p>

            

            <div style={styles.verificationActions}>

              <button

                onClick={handleResendEmail}

                style={{...styles.submitButton, ...styles.emailButton}}

                disabled={loading}

              >

                {loading ? (

                  <span style={styles.loadingIndicator}>

                    <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                      <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                      <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                    </svg>

                    Sending...

                  </span>

                ) : (

                  "Resend Verification Email"

                )}

              </button>

              <button

                onClick={() => setStep("signup")}

                style={styles.secondaryButton}

              >

                Back to Sign Up

              </button>

            </div>

            

            <div style={styles.verificationNote}>

              <p>

                Note: Check your spam or junk folder if you don't see the verification email in your inbox.

              </p>

            </div>

          </div>

        </div>

        

        {/* Footer */}

        <footer style={styles.footer}>

          <p>© 2025 Health & Wellness Hub. All rights reserved.</p>

        </footer>

      </div>

    </div>

  );



  // Render Phone Verification UI

  const renderPhoneVerification = () => (

    <div style={styles.verificationContainer}>

      <div style={styles.verificationWrapper}>

        {/* Logo and Header */}

        <div style={styles.verificationHeader}>

          <div style={styles.logoContainer}>

            <img src={require('./logo.png')} alt="Logo" style={styles.logoIcon} />

          </div>

          <h1 style={styles.appTitle}>Health & Wellness Hub</h1>

          <p style={styles.appSubtitle}>Phone Verification</p>

        </div>



        <div style={styles.verificationBox}>

          <div style={styles.verificationContent}>

            <div style={styles.verificationIconContainer}>

              <svg style={styles.verificationIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />

              </svg>

            </div>

            <h2 style={styles.verificationTitle}>Verify Your Phone</h2>

            

            {error && (

              <div style={styles.errorMessage}>

                <div style={styles.errorContent}>

                  <svg style={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />

                  </svg>

                  {error}

                </div>

              </div>

            )}

            

            <p style={styles.verificationMessage}>

              Enter the OTP sent to your phone number to complete verification.

            </p>

            

            <div style={styles.formGroup}>

              <label htmlFor="otp" style={styles.formLabel}>

                Verification Code

              </label>

              <input

                id="otp"

                type="text"

                placeholder="Enter 6-digit OTP"

                value={otp}

                onChange={(e) => setOtp(e.target.value)}

                required

                style={styles.otpInput}

                maxLength={6}

              />

            </div>

            

            <div style={styles.verificationActions}>

              <button

                onClick={handleVerifyOtp}

                style={{...styles.submitButton, ...styles.phoneButton}}

                disabled={loading}

              >

                {loading ? (

                  <span style={styles.loadingIndicator}>

                    <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                      <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                      <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                    </svg>

                    Verifying...

                  </span>

                ) : (

                  "Verify OTP"

                )}

              </button>

              <button

                onClick={() => setStep("signup")}

                style={styles.secondaryButton}

              >

                Back to Sign Up

              </button>

            </div>

            

            <div style={styles.verificationNote}>

              <p>

                Didn't receive the code? <button onClick={handlePhoneSignup} style={styles.resendButton} disabled={loading}>Resend OTP</button>

              </p>

            </div>

          </div>

        </div>

        

        {/* Footer */}

        <footer style={styles.footer}>

          <p>© 2025 Health & Wellness Hub. All rights reserved.</p>

        </footer>

      </div>

    </div>

  );



  // Render the appropriate step

  const renderStep = () => {

    switch(step) {

      case "verifyEmail":

        return renderEmailVerification();

      case "verifyPhone":

        return renderPhoneVerification();

      case "signup":

      default:

        return renderSignupForm();

    }

  };



  return renderStep();

};



export default Signup;