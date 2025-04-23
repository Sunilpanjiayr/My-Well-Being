import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzzJWZTkVoSWp5J_0u7IlPBCvLQ5G9Fas",
  authDomain: "my-well-being-19cdc.firebaseapp.com",
  projectId: "my-well-being-19cdc",
  storageBucket: "my-well-being-19cdc.firebasestorage.app",
  messagingSenderId: "43094405528",
  appId: "1:43094405528:web:b953036bdc35fbdfc97bed",
  measurementId: "G-4BYKBCXKT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication instance
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier };