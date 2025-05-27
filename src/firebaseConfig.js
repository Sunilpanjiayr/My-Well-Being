import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration (replace with your Firebase project credentials)
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyCzzJWZTkVoSWp5J_0u7IlPBCvLQ5G9Fas",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "my-well-being-19cdc.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "my-well-being-19cdc",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "gs://my-well-being-19cdc.firebasestorage.app",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "43094405528",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:43094405528:web:b953036bdc35fbdfc97bed",
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-4BYKBCXKT8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission and get FCM token
export const requestNotificationPermission = async (setNotification) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY", // Replace with your VAPID key
      });
      if (token) {
        console.log("FCM Token:", token);
        // Optionally send token to your backend for storage
        setNotification({
          show: true,
          message: "Notifications enabled!",
          type: "success",
        });
        setTimeout(
          () => setNotification({ show: false, message: "", type: "" }),
          3000
        );
        return token;
      } else {
        throw new Error("No registration token available.");
      }
    } else {
      setNotification({
        show: true,
        message: "Notification permission denied.",
        type: "error",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", type: "" }),
        3000
      );
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    setNotification({
      show: true,
      message: "Failed to enable notifications.",
      type: "error",
    });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
