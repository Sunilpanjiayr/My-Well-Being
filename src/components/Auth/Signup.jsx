import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate } from "react-router-dom";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  // Email/Password Sign-Up
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      navigate("/verify-email"); // Redirect to email verification page
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError(`Failed to sign up: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-Up
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard"); // Redirect to dashboard after successful sign-up
    } catch (error) {
      console.error("Error signing up with Google:", error.message);
      setError(`Failed to sign up with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Phone Number Sign-Up
  const handlePhoneSignup = async () => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
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
      
      // Store verification ID and phone number in session storage
      window.sessionStorage.setItem("verificationId", confirmationResult.verificationId);
      window.sessionStorage.setItem("phoneNumber", formattedPhone);
      
      // Navigate to verification page
      navigate("/verify-phone");
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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="card w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Email/Password Sign-Up */}
        <form onSubmit={handleEmailSignup} className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Sign Up with Email</h3>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Sign Up with Email"}
          </button>
        </form>

        {/* Google Sign-Up */}
        <button
          onClick={handleGoogleSignup}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-6 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Sign Up with Google"}
        </button>

        {/* Phone Number Sign-Up */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sign Up with Phone</h3>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <PhoneInput
              country={"us"}
              id="phone"
              value={phone}
              onChange={(value) => setPhone("+" + value)}
              inputClass="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              containerClass="w-full"
              disabled={loading}
            />
          </div>
          {/* Invisible reCAPTCHA Container */}
          <div id="recaptcha"></div>
          <button
            type="button"
            onClick={handlePhoneSignup}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Sign Up with Phone"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;