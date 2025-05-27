import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  fetchSignInMethodsForEmail,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [errorMessage, setErrorMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Styles - reused from Login.jsx with some modifications
  const styles = {
    // Container Styles
    loginContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ebf4ff, #ffffff, #ebf4ff)',
      padding: '20px'
    },
    loginWrapper: {
      width: '100%',
      maxWidth: '480px'
    },
    
    // Header Styles
    loginHeader: {
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
      color: '#fff'
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
    
    // Main login box
    loginBox: {
      backgroundColor: '#fff',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    welcomeBanner: {
      background: 'linear-gradient(to right, #4285f4, #34a0ce)',
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
    loginContent: {
      padding: '1.5rem'
    },
    
    // Tabs styles
    loginTabs: {
      display: 'flex',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    tabButton: {
      flex: '1',
      padding: '0.75rem',
      fontWeight: '500',
      textAlign: 'center',
      background: 'none',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    tabButtonActive: {
      color: '#3b82f6',
      borderBottom: '2px solid #3b82f6'
    },
    tabContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    tabIcon: {
      height: '1.25rem',
      width: '1.25rem'
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
    
    // Form elements
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    },
    formGroup: {
      marginBottom: '0'
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
    formInputFocus: {
      outline: 'none',
      borderColor: 'transparent',
      boxShadow: '0 0 0 2px #3b82f6'
    },
    passwordHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.25rem'
    },
    forgotPassword: {
      fontSize: '0.875rem',
      color: '#3b82f6',
      textDecoration: 'none'
    },
    rememberMe: {
      display: 'flex',
      alignItems: 'center'
    },
    checkbox: {
      height: '1rem',
      width: '1rem',
      color: '#3b82f6',
      borderColor: '#e5e7eb',
      borderRadius: '0.25rem'
    },
    checkboxLabel: {
      marginLeft: '0.5rem',
      fontSize: '0.875rem',
      color: '#333'
    },
    
    // Phone input
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
    helperText: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    
    // Buttons
    submitButton: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
      color: '#fff',
      fontWeight: '500',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    submitButtonHover: {
      background: 'linear-gradient(to right, #1d4ed8, #3b82f6)'
    },
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
    
    // OTP Verification
    otpSentMessage: {
      textAlign: 'center',
      marginBottom: '1rem'
    },
    otpIconContainer: {
      display: 'inline-block',
      padding: '0.5rem',
      borderRadius: '50%',
      backgroundColor: '#d1fae5',
      color: '#22c55e',
      marginBottom: '0.5rem'
    },
    otpIcon: {
      height: '1.5rem',
      width: '1.5rem'
    },
    otpSentText: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#333',
      marginBottom: '0.25rem'
    },
    otpInstruction: {
      fontSize: '0.75rem',
      color: '#6b7280'
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
    changePhoneButton: {
      width: '100%',
      textAlign: 'center',
      color: '#3b82f6',
      background: 'none',
      border: 'none',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    resendCode: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    resendButton: {
      color: '#3b82f6',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.75rem'
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
    
    // Google button
    googleButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#fff',
      color: '#333',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      marginBottom: '1rem'
    },
    googleButtonHover: {
      backgroundColor: '#f3f4f6'
    },
    googleIcon: {
      height: '1.25rem',
      width: '1.25rem',
      marginRight: '0.5rem'
    },
    
    // Health notice
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
    
    // Sign up link
    signupLink: {
      marginTop: '1.5rem',
      textAlign: 'center'
    },
    createAccountLink: {
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
    
    // Verification notice
    verificationNotice: {
      marginTop: '1rem',
      padding: '0.75rem',
      backgroundColor: '#fff8e6',
      borderLeft: '4px solid #f59e0b',
      borderRadius: '0 0.5rem 0.5rem 0',
      fontSize: '0.875rem'
    },
  };

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitialAuthCheck(true);
      
      // Only navigate if user exists and initial check is complete
      if (user && user.uid) {
        // Check if user is a healthcare professional
        checkIfDoctor(user.uid).then(isDoctor => {
          if (isDoctor) {
            // Check if token is still valid by making a test call
            user.getIdToken()
              .then(() => {
                // Token is valid, navigate to doctor dashboard
                const { from } = location.state || { from: { pathname: "/doctorDashboard" } };
                navigate(from, { replace: true });
              })
              .catch((error) => {
                // Token is invalid, clear auth state
                console.error("Error verifying token:", error);
                // No need to sign out here as the token is already invalid
              });
          } else {
            // User is not a doctor, show error
            setErrorMessage("This account is not registered as a healthcare professional. Please use the patient login instead.");
          }
        });
      }
    });
    
    // Clean up reCAPTCHA when component unmounts
    return () => {
      unsubscribe();
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.log("Error clearing reCAPTCHA:", e);
        }
      }
    };
  }, [navigate, location]);

  // Check if user is a healthcare professional
  const checkIfDoctor = async (userId) => {
    try {
      const doctorRef = doc(db, 'doctors', userId);
      const doctorSnap = await getDoc(doctorRef);
      
      return doctorSnap.exists();
    } catch (error) {
      console.error("Error checking if user is a doctor:", error);
      return false;
    }
  };

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is a healthcare professional
      const isDoctor = await checkIfDoctor(user.uid);
      
      if (isDoctor) {
        // Check if doctor is verified
        const doctorRef = doc(db, 'doctors', user.uid);
        const doctorDoc = await getDoc(doctorRef);
        
        if (doctorDoc.exists() && doctorDoc.data().isVerified === false) {
          setErrorMessage("Your account is pending verification. You will be notified when your account is approved.");
          setLoading(false);
          return;
        }
        
        const { from } = location.state || { from: { pathname: "/doctorDashboard" } };
        navigate(from, { replace: true });
      } else {
        setErrorMessage("This account is not registered as a healthcare professional. Please use the patient login instead.");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setErrorMessage("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user is a healthcare professional
      const isDoctor = await checkIfDoctor(user.uid);
      
      if (isDoctor) {
        // Check if doctor is verified
        const doctorRef = doc(db, 'doctors', user.uid);
        const doctorDoc = await getDoc(doctorRef);
        
        if (doctorDoc.exists() && doctorDoc.data().isVerified === false) {
          setErrorMessage("Your account is pending verification. You will be notified when your account is approved.");
          setLoading(false);
          return;
        }
        
        const { from } = location.state || { from: { pathname: "/doctorDashboard" } };
        navigate(from, { replace: true });
      } else {
        setErrorMessage("This Google account is not registered as a healthcare professional. Please use the patient login or register as a healthcare professional.");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
      setErrorMessage("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if phone number is registered as a doctor
  const checkPhoneNumberExists = async (phoneNum) => {
    try {
      console.log("Checking if phone number exists:", phoneNum);
      
      // For development & testing: Always allow specific test numbers
      if (process.env.NODE_ENV === 'development' || 
          phoneNum.includes("+1 123") || 
          phoneNum.includes("123-456") || 
          phoneNum.includes("+91 123") ||
          phoneNum.includes("12345")) {
        console.log("DEV MODE: Allowing test phone number");
        return true;
      }
      
      try {
        // Option 1: Try fetchSignInMethodsForEmail with formatted phone
        const formattedPhoneAsEmail = `${phoneNum.replace(/[+\s\(\)-]/g, '')}@phone.com`;
        console.log("Checking with formatted email:", formattedPhoneAsEmail);
        const signInMethods = await fetchSignInMethodsForEmail(auth, formattedPhoneAsEmail);
        
        if (signInMethods && signInMethods.length > 0) {
          return true;
        }
      } catch (e) {
        console.log("Error checking via email format:", e);
        // Continue to fallback
      }
      
      const existingUsers = JSON.parse(localStorage.getItem("registeredDoctorPhones") || "[]");
      const normalizedPhone = phoneNum.replace(/\s+/g, "");
      
      if (existingUsers.some(phone => {
        const normalizedStoredPhone = phone.replace(/\s+/g, "");
        return normalizedStoredPhone.includes(normalizedPhone) || 
              normalizedPhone.includes(normalizedStoredPhone);
      })) {
        console.log("Found in local storage registered doctor phones");
        return true;
      }
      
      // For testing: Saving this number as registered after first attempt
      if (phoneNum.includes("123") || phoneNum.includes("456")) {
        console.log("Test number - allowing and saving to local storage");
        existingUsers.push(phoneNum);
        localStorage.setItem("registeredDoctorPhones", JSON.stringify(existingUsers));
        return true;
      }
      
      console.log("Phone number not found in any verification method");
      return false;
    } catch (error) {
      console.error("Error checking phone number:", error);
      // In development, allow the flow to continue even if there's an error
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      return false;
    }
  };

  // Phone Number Login - Send OTP
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.trim() === "") {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    
    try {
      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Check if the phone number is registered
      const isRegistered = await checkPhoneNumberExists(formattedPhone);
      
      if (!isRegistered) {
        setErrorMessage("This phone number is not registered as a healthcare professional. Please sign up first.");
        setLoading(false);
        return;
      }
      
      // Clean up any existing reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log("Error clearing existing reCAPTCHA:", e);
        }
      }

      // Clean up the container
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      
      // Create a fresh reCAPTCHA container
      const recaptchaId = `recaptcha-${Date.now()}`;
      const recaptchaDiv = document.createElement('div');
      recaptchaDiv.id = recaptchaId;
      recaptchaContainer.appendChild(recaptchaDiv);
      
      // Create new reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaId,
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            setErrorMessage("reCAPTCHA expired. Please try again.");
            setLoading(false);
          }
        }
      );

      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      console.log("OTP sent successfully");
      
      // Store verification ID
      setVerificationId(confirmationResult.verificationId);
      
      // Show OTP input
      setIsOtpSent(true);
      
    } catch (error) {
      console.error("Error sending OTP:", error);
      
      // Provide specific error messages
      if (error.code === 'auth/invalid-phone-number') {
        setErrorMessage("Invalid phone number format. Please use international format.");
      } else if (error.code === 'auth/captcha-check-failed') {
        setErrorMessage("reCAPTCHA verification failed. Please try again.");
      } else if (error.code === 'auth/quota-exceeded') {
        setErrorMessage("SMS quota exceeded. Please try again later.");
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage("Too many attempts. Please try again later.");
      } else {
        setErrorMessage(`Failed to send OTP: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.trim() === "") {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    setVerifying(true);
    setErrorMessage("");
    
    try {
      console.log("Verifying OTP:", otp);
      console.log("With verification ID:", verificationId);
      
      // Create a phone auth credential
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      
      // Sign in with the credential
      const result = await signInWithCredential(auth, credential);
      console.log("Phone authentication successful:", result.user.uid);
      
      // Check if user is a healthcare professional
      const isDoctor = await checkIfDoctor(result.user.uid);
      
      if (isDoctor) {
        // Check if doctor is verified
        const doctorRef = doc(db, 'doctors', result.user.uid);
        const doctorDoc = await getDoc(doctorRef);
        
        if (doctorDoc.exists() && doctorDoc.data().isVerified === false) {
          setErrorMessage("Your account is pending verification. You will be notified when your account is approved.");
          setVerifying(false);
          return;
        }
        
        // Redirect to dashboard
        const { from } = location.state || { from: { pathname: "/doctorDashboard" } };
        navigate(from, { replace: true });
      } else {
        setErrorMessage("This account is not registered as a healthcare professional. Please use the patient login instead.");
      }
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      
      // Special case for test numbers in development
      if (process.env.NODE_ENV === 'development' && 
          (phoneNumber.includes("+1 12345") || phoneNumber.includes("+91 12345")) && 
          otp === "123456") {
        console.log("DEV MODE: Allowing test verification code");
        const { from } = location.state || { from: { pathname: "/doctorDashboard" } };
        navigate(from, { replace: true });
        return;
      }
      
      // Set appropriate error message
      if (error.code === 'auth/invalid-verification-code') {
        setErrorMessage("Invalid verification code. Please try again.");
      } else if (error.code === 'auth/code-expired') {
        setErrorMessage("Verification code has expired. Please request a new one.");
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMessage("The credential is malformed or has expired. Please try again.");
      } else {
        setErrorMessage(`Failed to verify: ${error.message}`);
      }
    } finally {
      setVerifying(false);
    }
  };

  // Reset phone verification
  const handleChangePhoneNumber = () => {
    setIsOtpSent(false);
    setOtp("");
    setErrorMessage("");
  };

  // If still performing initial auth check, show loading indicator
  if (!initialAuthCheck) {
    return (
      <div style={styles.loginContainer}>
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{display: 'inline-block', marginBottom: '1rem'}}>
            <svg style={{animation: 'spin 1s linear infinite', height: '3rem', width: '3rem', color: '#3b82f6'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{opacity: '0.25'}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{opacity: '0.75'}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginWrapper}>
        {/* Medical Logo and Header */}
        <div style={styles.loginHeader}>
          <div style={styles.logoContainer}>
            <svg style={styles.logoIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 style={styles.appTitle}>Health & Wellness Hub</h1>
          <p style={styles.appSubtitle}>Healthcare Professional Portal</p>
        </div>

        <div style={styles.loginBox}>
          {/* Welcome Banner */}
          <div style={styles.welcomeBanner}>
            <h2 style={styles.welcomeBannerH2}>Welcome Back</h2>
            <p style={styles.welcomeBannerP}>Sign in to access your healthcare professional dashboard</p>
          </div>

          <div style={styles.loginContent}>
            {/* Login Tabs */}
            <div style={styles.loginTabs}>
              <button 
                style={{...styles.tabButton, ...(activeTab === 'email' ? styles.tabButtonActive : {})}}
                onClick={() => {
                  setActiveTab('email');
                  setIsOtpSent(false);
                  setErrorMessage("");
                }}
                disabled={loading || verifying}
              >
                <div style={styles.tabContent}>
                  <svg style={styles.tabIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </div>
              </button>
              <button 
                style={{...styles.tabButton, ...(activeTab === 'phone' ? styles.tabButtonActive : {})}}
                onClick={() => {
                  setActiveTab('phone');
                  setErrorMessage("");
                }}
                disabled={loading || verifying}
              >
                <div style={styles.tabContent}>
                  <svg style={styles.tabIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Phone</span>
                </div>
              </button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div style={styles.errorMessage}>
                <div style={styles.errorContent}>
                  <svg style={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Email/Password Login Form */}
            {activeTab === 'email' && (
              <form onSubmit={handleLogin} style={styles.loginForm}>
                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.formLabel}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.formInput}
                    disabled={loading}
                  />
                </div>
                <div style={styles.formGroup}>
                  <div style={styles.passwordHeader}>
                    <label htmlFor="password" style={styles.formLabel}>
                      Password
                    </label>
                    <a href="#" style={styles.forgotPassword}>
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.formInput}
                    disabled={loading}
                  />
                </div>
                <div style={styles.rememberMe}>
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    style={styles.checkbox}
                  />
                  <label htmlFor="remember-me" style={styles.checkboxLabel}>
                    Remember me on this device
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.submitButton}
                  onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #3b82f6)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #1d4ed8)'}
                >
                  {loading ? (
                    <span style={styles.loadingIndicator}>
                      <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in securely"
                  )}
                </button>
              </form>
            )}

            {/* Phone Login Form */}
            {activeTab === 'phone' && !isOtpSent && (
              <form onSubmit={handlePhoneLogin} style={styles.loginForm}>
                <div style={styles.formGroup}>
                  <label htmlFor="phone" style={styles.formLabel}>
                    Phone Number
                  </label>
                  <div style={styles.phoneInputContainer}>
                    <PhoneInput
                      country={"us"}
                      value={phoneNumber}
                      onChange={(value) => setPhoneNumber("+" + value)}
                      inputClass="phone-input"
                      containerClass="phone-container"
                      disabled={loading}
                      containerStyle={styles.phoneContainer}
                      inputStyle={styles.phoneInput}
                    />
                  </div>
                  <p style={styles.helperText}>
                    We'll send a verification code to this number
                  </p>
                </div>
                {/* Invisible reCAPTCHA Container */}
                <div id="recaptcha-container"></div>
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.submitButton}
                  onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #3b82f6)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #1d4ed8)'}
                >
                  {loading ? (
                    <span style={styles.loadingIndicator}>
                      <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending code...
                    </span>
                  ) : (
                    "Send verification code"
                  )}
                </button>
              </form>
            )}
            
            {/* OTP Verification Form (only shown after OTP is sent) */}
            {activeTab === 'phone' && isOtpSent && (
              <form onSubmit={handleVerifyOtp} style={styles.loginForm}>
                <div style={styles.otpSentMessage}>
                  <div style={styles.otpIconContainer}>
                    <svg style={styles.otpIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p style={styles.otpSentText}>Code sent successfully!</p>
                  <p style={styles.otpInstruction}>Please enter the verification code</p>
                </div>
                
                <div style={styles.formGroup}>
                  <label htmlFor="otp" style={styles.formLabel}>
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    style={styles.otpInput}
                    disabled={verifying}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifying}
                  style={styles.submitButton}
                  onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #3b82f6)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #1d4ed8)'}
                >
                  {verifying ? (
                    <span style={styles.loadingIndicator}>
                      <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify and Sign In"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleChangePhoneNumber}
                  style={styles.changePhoneButton}
                >
                  Change phone number
                </button>
                
                <div style={styles.resendCode}>
                  <span>Didn't receive the code?</span>
                  <button 
                    type="button"
                    onClick={handlePhoneLogin}
                    style={styles.resendButton}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* Only show social login options if we're not in the OTP verification step */}
            {!(activeTab === 'phone' && isOtpSent) && (
              <>
                {/* Divider */}
                <div style={styles.divider}>
                  <div style={styles.dividerLine}></div>
                  <span style={styles.dividerText}>or continue with</span>
                  <div style={styles.dividerLine}></div>
                </div>

                {/* Social Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={styles.googleButton}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <svg style={styles.googleIcon} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}
            
            {/* Verification Notice */}
            <div style={styles.verificationNotice}>
              <p>
                <strong>Note:</strong> Your account must be verified by our administrators before you can access the healthcare professional portal. If your account is pending verification, please contact support for assistance.
              </p>
            </div>
            
            {/* Health Information Notice */}
            <div style={styles.healthNotice}>
              <div style={styles.noticeContent}>
                <svg style={styles.noticeIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Your professional information is protected by our strict privacy policy and secure encryption. All activities are logged for compliance with healthcare regulations.</p>
              </div>
            </div>

            {/* Sign-Up Link */}
            <div style={styles.signupLink}>
              <p>
                Don't have a professional account?{" "}
                <Link to="/doctorSignup" style={styles.createAccountLink}>
                  Register as a healthcare professional
                </Link>
              </p>
            </div>
            
            {/* Patient Login Link */}
            <div style={styles.signupLink}>
              <p>
                Need to access your patient account?{" "}
                <Link to="/login" style={styles.createAccountLink}>
                  Go to patient login
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
};

export default DoctorLogin;