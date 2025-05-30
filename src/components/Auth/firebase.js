// src/components/Auth/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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