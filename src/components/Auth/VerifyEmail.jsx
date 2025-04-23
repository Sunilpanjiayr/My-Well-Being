import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

const VerifyEmail = () => {
  const navigate = useNavigate();

  // Listen for changes in the user's authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if the email is already verified
        if (user.emailVerified) {
          navigate("/dashboard", { replace: true }); // Redirect to dashboard
        } else {
          // Force a reload of the user's authentication state
          await user.reload();
          if (user.emailVerified) {
            navigate("/dashboard", { replace: true }); // Redirect to dashboard
          }
        }
      } else {
        // If no user is authenticated, redirect to signup
        navigate("/signup", { replace: true });
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [navigate]);

  const handleResendEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.sendEmailVerification();
        alert("Verification email resent. Please check your inbox.");
      } catch (error) {
        console.error("Error resending verification email:", error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="card w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="text-gray-700 mb-4">
          A verification email has been sent to your inbox. Please click the link in the email to verify your account.
        </p>
        <button
          onClick={handleResendEmail}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Resend Verification Email
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;