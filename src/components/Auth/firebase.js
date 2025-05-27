// src/components/Auth/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCzzJWZTkVoSWp5J_0u7IlPBCvLQ5G9Fas",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "my-well-being-19cdc.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "my-well-being-19cdc",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gs://my-well-being-19cdc.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "43094405528",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:43094405528:web:b953036bdc35fbdfc97bed",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-4BYKBCXKT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  'access_type': 'online'
});

export { auth, db, storage, googleProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier };