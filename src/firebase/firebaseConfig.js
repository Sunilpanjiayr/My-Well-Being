// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCzzJWZTkVoSWp5J_0u7IlPBCvLQ5G9Fas",
  authDomain: "my-well-being-19cdc.firebaseapp.com",
  projectId: "my-well-being-19cdc",
  storageBucket: "my-well-being-19cdc.firebasestorage.app",
  messagingSenderId: "43094405528",
  appId: "1:43094405528:web:b953036bdc35fbdfc97bed",
  measurementId: "G-4BYKBCXKT8"
};

// VAPID key for web push notifications
const VAPID_KEY =
  process.env.REACT_APP_FIREBASE_VAPID_KEY ||
  "BAv9NuWQPgEFHYTN5QV2gRIn6xTlzDgODOoT_xF3Ptq4fa-1e1mfv-FQZreAjjNWRlRSVdVDq47GH0hxJI4gHBk";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestPermission = async () => {
  try {
    console.log("🔔 Requesting notification permission...");

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.error("❌ This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log("📋 Permission result:", permission);

    if (permission === "granted") {
      console.log("✅ Notification permission granted");

      try {
        // Get FCM registration token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
        });

        if (token) {
          console.log("🎯 FCM Registration Token:", token);

          // Send token to backend for storage
          await sendTokenToServer(token);

          return token;
        } else {
          console.log("❌ No registration token available");
          return null;
        }
      } catch (tokenError) {
        console.error("💥 Error getting FCM token:", tokenError);

        // Fallback to browser notifications
        console.log("🔄 Falling back to browser notifications");
        return "browser-notifications";
      }
    } else {
      console.log("❌ Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("💥 Error requesting permission:", error);
    return null;
  }
};

// Send FCM token to backend server
const sendTokenToServer = async (token) => {
  try {
    const response = await fetch("/api/notifications/register-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        userId: getCurrentUserId(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ FCM token registered with server:", result);
  } catch (error) {
    console.error("❌ Failed to register FCM token with server:", error);

    // Store token locally as fallback
    localStorage.setItem("fcm_token_pending", token);
    localStorage.setItem("fcm_token_timestamp", Date.now().toString());
  }
};

// Get current user ID (implement based on your auth system)
const getCurrentUserId = () => {
  // If you have user authentication, get the actual user ID
  // For now, using a persistent device ID
  let userId = localStorage.getItem("device_user_id");
  if (!userId) {
    userId =
      "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("device_user_id", userId);
  }
  return userId;
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📱 Message received in foreground:", payload);

      // Extract notification data
      const notificationTitle =
        payload.notification?.title || "💊 Medicine Reminder";
      const notificationOptions = {
        body: payload.notification?.body || "Time to take your medication!",
        icon: payload.notification?.icon || "/medicine-icon-192.png",
        badge: "/medicine-icon-72.png",
        tag: payload.data?.reminderId || "medicine-reminder",
        requireInteraction: true,
        actions: [
          {
            action: "taken",
            title: "✅ Mark as Taken",
          },
          {
            action: "snooze",
            title: "⏰ Snooze 5 min",
          },
        ],
        data: payload.data,
      };

      // Show notification manually in foreground
      if (Notification.permission === "granted") {
        const notification = new Notification(
          notificationTitle,
          notificationOptions
        );

        notification.onclick = () => {
          window.focus();
          notification.close();

          // Handle notification click
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          }
        };
      }

      resolve(payload);
    });
  });

// Test notification function
export const sendTestNotification = async () => {
  try {
    const response = await fetch("/api/notifications/send-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: getCurrentUserId(),
        title: "🧪 Test Medicine Reminder",
        body: "This is a test notification from your Medicine Reminder app!",
        data: {
          type: "test",
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Test notification sent:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to send test notification:", error);

    // Fallback to local notification
    if (Notification.permission === "granted") {
      new Notification("🧪 Test Medicine Reminder", {
        body: "This is a test notification (local fallback)!",
        icon: "/medicine-icon-192.png",
      });
    }

    throw error;
  }
};

// Schedule medication reminder via backend
export const scheduleMedicationReminder = async (reminder, medication) => {
  try {
    const response = await fetch("/api/notifications/schedule-reminder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: getCurrentUserId(),
        reminderId: reminder.id,
        medicationId: medication.id,
        medicationName: medication.name,
        dosage: medication.dosage,
        units: medication.units,
        time: reminder.time,
        days: reminder.days,
        notes: reminder.notes,
        enabled: reminder.enabled,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Reminder scheduled on server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to schedule reminder on server:", error);
    throw error;
  }
};

// Cancel medication reminder
export const cancelMedicationReminder = async (reminderId) => {
  try {
    const response = await fetch(
      `/api/notifications/cancel-reminder/${reminderId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: getCurrentUserId(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Reminder cancelled on server:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to cancel reminder on server:", error);
    throw error;
  }
};

// Get notification history
export const getNotificationHistory = async () => {
  try {
    const response = await fetch(
      `/api/notifications/history?userId=${getCurrentUserId()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("📊 Notification history:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to get notification history:", error);
    return [];
  }
};

// Check service worker registration
export const checkServiceWorkerRegistration = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log("🔧 Service Worker registrations:", registrations);

      // Find Firebase messaging service worker
      const fcmRegistration = registrations.find((reg) =>
        reg.scope.includes("firebase-messaging-sw")
      );

      if (fcmRegistration) {
        console.log(
          "✅ Firebase messaging service worker found:",
          fcmRegistration
        );
        return fcmRegistration;
      } else {
        console.log("⚠️ Firebase messaging service worker not found");

        // Try to register it
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log(
          "✅ Firebase messaging service worker registered:",
          registration
        );
        return registration;
      }
    } else {
      console.warn("⚠️ Service Worker not supported in this browser");
      return null;
    }
  } catch (error) {
    console.error("💥 Service Worker registration error:", error);
    return null;
  }
};

// Initialize FCM setup
export const initializeFCM = async () => {
  try {
    console.log("🔥 Initializing Firebase Cloud Messaging...");

    // Check service worker
    await checkServiceWorkerRegistration();

    // Request permission and get token
    const token = await requestPermission();

    if (token) {
      // Set up foreground message listener
      onMessageListener()
        .then((payload) => {
          console.log("📬 Foreground message received:", payload);
        })
        .catch((error) => {
          console.error("💥 Error handling foreground message:", error);
        });

      console.log("✅ FCM initialized successfully");
      return token;
    } else {
      console.log("❌ FCM initialization failed");
      return null;
    }
  } catch (error) {
    console.error("💥 FCM initialization error:", error);
    return null;
  }
};

// Export Firebase app instance
export default app;
