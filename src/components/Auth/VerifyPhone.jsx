import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PhoneAuthProvider, 
  signInWithCredential
} from "firebase/auth";
import { auth } from "../../firebase"; // Import auth directly from your firebase config

const VerifyPhone = () => {
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get the verificationId from session storage
    const storedVerificationId = window.sessionStorage.getItem("verificationId");
    
    if (!storedVerificationId) {
      setError("Verification session expired or invalid. Please try again.");
      return;
    }
    
    setVerificationId(storedVerificationId);
    console.log("Retrieved verificationId:", storedVerificationId);
  }, []);

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP code");
      return;
    }

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
      
      // Clear the verification ID from session storage
      window.sessionStorage.removeItem("verificationId");
      
      // Show success message
      alert("Phone number verified successfully!");
      
      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Verification failed with error:", error);
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);
      
      // For testing numbers, provide a development bypass
      if (process.env.NODE_ENV === 'development') {
        const phoneNumber = window.sessionStorage.getItem("phoneNumber");
        
        if (phoneNumber && phoneNumber.includes("+1 12345") && otp === "123456") {
          console.log("DEV MODE: Bypassing verification for test number");
          window.sessionStorage.removeItem("verificationId");
          alert("DEV MODE: Phone verified with test code");
          navigate("/dashboard", { replace: true });
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
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="card w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Phone</h2>
        <p className="text-gray-700 mb-4">
          Enter the OTP sent to your phone number to complete verification.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="otp" className="block text-gray-700 text-sm font-bold mb-2">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleVerifyOtp}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Verify OTP
        </button>
        
        <button
          onClick={() => navigate("/signup")}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back to Sign Up
        </button>
      </div>
    </div>
  );
};

export default VerifyPhone;