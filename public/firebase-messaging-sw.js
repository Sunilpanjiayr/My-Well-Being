importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

// Initialize Firebase in the service worker
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

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // Replace with your app's icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
