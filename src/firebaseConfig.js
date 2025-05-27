import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration (replace with your Firebase project credentials)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission and get FCM token
export const requestNotificationPermission = async (setNotification) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key
      });
      if (token) {
        console.log('FCM Token:', token);
        // Optionally send token to your backend for storage
        setNotification({
          show: true,
          message: 'Notifications enabled!',
          type: 'success'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        return token;
      } else {
        throw new Error('No registration token available.');
      }
    } else {
      setNotification({
        show: true,
        message: 'Notification permission denied.',
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    setNotification({
      show: true,
      message: 'Failed to enable notifications.',
      type: 'error'
    });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });