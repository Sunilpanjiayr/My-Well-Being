import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Login = () => {
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/dashboard", { replace: true });
    }
    
    // Clean up reCAPTCHA when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.log("Error clearing reCAPTCHA:", e);
        }
      }
    };
  }, [auth.currentUser, navigate]);

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const { from } = location.state || { from: { pathname: "/dashboard" } };
      navigate(from, { replace: true });
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
      await signInWithPopup(auth, googleProvider);
      const { from } = location.state || { from: { pathname: "/dashboard" } };
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
      setErrorMessage("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  // Check if phone number is registered - Updated implementation
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
    
    // In a real implementation, you would have a more robust check against your database
    // This is a simplified approach for demonstration
    
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
    
    // For demo purposes: If we've registered before with this number, consider it valid
    // In a real app, you would check against your user database
    const existingUsers = JSON.parse(localStorage.getItem("registeredPhones") || "[]");
    const normalizedPhone = phoneNum.replace(/\s+/g, "");
    
    if (existingUsers.some(phone => {
      const normalizedStoredPhone = phone.replace(/\s+/g, "");
      return normalizedStoredPhone.includes(normalizedPhone) || 
             normalizedPhone.includes(normalizedStoredPhone);
    })) {
      console.log("Found in local storage registered phones");
      return true;
    }
    
    // For testing: Save this number as registered after first attempt
    // This is just for demo purposes - in a real app you'd check your database
    if (phoneNum.includes("123") || phoneNum.includes("456")) {
      console.log("Test number - allowing and saving to local storage");
      existingUsers.push(phoneNum);
      localStorage.setItem("registeredPhones", JSON.stringify(existingUsers));
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
        setErrorMessage("This phone number is not registered. Please sign up first.");
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
      
      // Redirect to dashboard
      const { from } = location.state || { from: { pathname: "/dashboard" } };
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      
      // Special case for test numbers in development
      if (process.env.NODE_ENV === 'development' && 
          (phoneNumber.includes("+1 12345") || phoneNumber.includes("+91 12345")) && 
          otp === "123456") {
        console.log("DEV MODE: Allowing test verification code");
        const { from } = location.state || { from: { pathname: "/dashboard" } };
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md">
        {/* Medical Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-blue-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Health & Wellness Hub</h1>
          <p className="text-gray-600 mt-2 text-lg">Your trusted healthcare partner</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 text-white">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="mt-1 opacity-90">Sign in to access your health dashboard</p>
          </div>

          <div className="p-6">
            {/* Login Tabs */}
            <div className="flex mb-6 border-b">
              <button 
                className={`flex-1 py-3 font-medium text-center transition-colors ${
                  activeTab === 'email' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={() => {
                  setActiveTab('email');
                  setIsOtpSent(false);
                  setErrorMessage("");
                }}
                disabled={loading || verifying}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </div>
              </button>
              <button 
                className={`flex-1 py-3 font-medium text-center transition-colors ${
                  activeTab === 'phone' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={() => {
                  setActiveTab('phone');
                  setErrorMessage("");
                }}
                disabled={loading || verifying}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Phone</span>
                </div>
              </button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Email/Password Login Form */}
            {activeTab === 'email' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:underline">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me on this device
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              <form onSubmit={handlePhoneLogin} className="space-y-5">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <PhoneInput
                      country={"us"}
                      value={phoneNumber}
                      onChange={(value) => setPhoneNumber("+" + value)}
                      inputClass="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      containerClass="w-full"
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send a verification code to this number
                  </p>
                </div>
                {/* Invisible reCAPTCHA Container */}
                <div id="recaptcha-container"></div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="inline-block p-2 rounded-full bg-green-100 text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700">Code sent successfully!</p>
                  <p className="text-xs text-gray-500">Please enter the verification code</p>
                </div>
                
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center tracking-widest text-lg"
                    disabled={verifying}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                  className="w-full text-blue-600 py-2 px-4 text-sm hover:underline focus:outline-none"
                >
                  Change phone number
                </button>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>Didn't receive the code?</span>
                  <button 
                    type="button"
                    onClick={handlePhoneLogin}
                    className="text-blue-600 hover:underline focus:outline-none"
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
                <div className="flex items-center my-6">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">or continue with</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Social Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition mb-4 disabled:opacity-70"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
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
            
            {/* Health Information Notice */}
            <div className="mt-6 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Your health information is protected by our strict privacy policy and secure encryption.</p>
              </div>
            </div>

            {/* Sign-Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition">
                  Create your health profile
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Health & Wellness Hub. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;