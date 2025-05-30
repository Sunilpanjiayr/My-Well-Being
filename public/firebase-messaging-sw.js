// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker for Medicine Reminders App

/* eslint-disable no-undef, no-restricted-globals */
/* global firebase, self, clients, importScripts, setTimeout, clearTimeout */

// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// ⚠️ REPLACE WITH YOUR ACTUAL FIREBASE CONFIG ⚠️
// Get these values from Firebase Console > Project Settings > General > Your apps
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
let messaging;
try {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  console.log("🔥 Firebase initialized in service worker");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

// Handle background messages (when app is not in focus)
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log("📱 Background message received:", payload);

    try {
      // Extract notification data
      const notificationTitle =
        payload.notification?.title || "💊 Medicine Reminder";
      const notificationBody =
        payload.notification?.body || "Time to take your medication!";
      const medicationName =
        payload.data?.medicationName || "Unknown Medication";
      const dosage = payload.data?.dosage || "";
      const units = payload.data?.units || "";
      const reminderId = payload.data?.reminderId || "";
      const medicationId = payload.data?.medicationId || "";

      // Construct notification options
      const notificationOptions = {
        body: notificationBody,
        icon: "/medicine-icon-192.png",
        badge: "/medicine-icon-72.png",
        tag: `medicine-reminder-${reminderId}`,
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        timestamp: Date.now(),
        actions: [
          {
            action: "taken",
            title: "✅ Mark as Taken",
          },
          {
            action: "snooze",
            title: "⏰ Snooze 5 min",
          },
          {
            action: "skip",
            title: "⏭️ Skip this dose",
          },
        ],
        data: {
          medicationId: medicationId,
          reminderId: reminderId,
          medicationName: medicationName,
          dosage: dosage,
          units: units,
          timestamp: Date.now(),
          url: payload.data?.url || "/",
          type: "medicine-reminder",
        },
      };

      // Show the notification
      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
      console.log("✅ Background notification displayed:", notificationTitle);
    } catch (error) {
      console.error("❌ Error showing background notification:", error);

      // Show basic notification as fallback
      self.registration.showNotification("💊 Medicine Reminder", {
        body: "Time to take your medication!",
        icon: "/medicine-icon-192.png",
        tag: "medicine-reminder-fallback",
        requireInteraction: true,
      });
    }
  });
}

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked:", event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === "taken") {
    console.log("✅ Medication marked as taken");

    event.waitUntil(
      handleMedicationAction("MEDICATION_TAKEN", data).then(() => {
        return showConfirmationNotification(
          "✅ Medication Taken",
          `${data.medicationName} marked as taken`,
          "medication-taken-confirmation"
        );
      })
    );
  } else if (action === "snooze") {
    console.log("⏰ Medication snoozed for 5 minutes");

    event.waitUntil(
      handleMedicationAction("MEDICATION_SNOOZED", data).then(() => {
        // Schedule snooze reminder
        setTimeout(() => {
          self.registration.showNotification("🔔 Snooze Reminder", {
            body: `Time to take ${data.medicationName} (${data.dosage} ${data.units})`,
            icon: "/medicine-icon-192.png",
            badge: "/medicine-icon-72.png",
            tag: `snooze-${data.reminderId}`,
            requireInteraction: true,
            actions: [
              { action: "taken", title: "✅ Mark as Taken" },
              { action: "snooze", title: "⏰ Snooze 5 min" },
            ],
            data: data,
          });
        }, 5 * 60 * 1000); // 5 minutes

        return showConfirmationNotification(
          "⏰ Reminder Snoozed",
          `${data.medicationName} reminder snoozed for 5 minutes`,
          "medication-snoozed-confirmation"
        );
      })
    );
  } else if (action === "skip") {
    console.log("⏭️ Medication dose skipped");

    event.waitUntil(
      handleMedicationAction("MEDICATION_SKIPPED", data).then(() => {
        return showConfirmationNotification(
          "⏭️ Dose Skipped",
          `${data.medicationName} dose skipped`,
          "medication-skipped-confirmation"
        );
      })
    );
  } else {
    // Default action - open app
    console.log("🏠 Opening app");

    event.waitUntil(
      openApp(data.url).then(() => {
        // Mark as viewed
        return handleMedicationAction("MEDICATION_VIEWED", data);
      })
    );
  }
});

// Handle medication action and notify app
async function handleMedicationAction(actionType, data) {
  try {
    // Send message to all open app instances
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    const message = {
      type: actionType,
      medicationId: data.medicationId,
      reminderId: data.reminderId,
      medicationName: data.medicationName,
      timestamp: Date.now(),
      source: "service-worker",
    };

    clients.forEach((client) => {
      client.postMessage(message);
    });

    // Also send to backend API if available
    try {
      await fetch("/api/medications/log-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...message,
          userAgent: self.navigator?.userAgent || "Service Worker",
        }),
      });
      console.log("✅ Action logged to backend:", actionType);
    } catch (apiError) {
      console.warn("⚠️ Could not log action to backend:", apiError.message);
    }

    console.log("📨 Action message sent to app:", actionType);
  } catch (error) {
    console.error("💥 Error handling medication action:", error);
  }
}

// Show confirmation notification
async function showConfirmationNotification(title, body, tag) {
  try {
    const notification = await self.registration.showNotification(title, {
      body: body,
      icon: "/medicine-icon-192.png",
      tag: tag,
      requireInteraction: false,
      silent: true,
    });

    // Auto-close confirmation after 3 seconds
    setTimeout(() => {
      self.registration.getNotifications({ tag: tag }).then((notifications) => {
        notifications.forEach((notification) => notification.close());
      });
    }, 3000);

    return notification;
  } catch (error) {
    console.error("💥 Error showing confirmation notification:", error);
  }
}

// Open app in browser
async function openApp(url = "/") {
  try {
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    // Check if app is already open
    for (let client of clients) {
      if (client.url.includes(url) && "focus" in client) {
        return client.focus();
      }
    }

    // Open new window if app is not open
    if (self.clients.openWindow) {
      return self.clients.openWindow(url);
    }
  } catch (error) {
    console.error("💥 Error opening app:", error);
  }
}

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("🔧 Firebase messaging service worker installing...");
  self.skipWaiting(); // Activate immediately
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("🚀 Firebase messaging service worker activated");
  event.waitUntil(self.clients.claim()); // Take control immediately
});

// Handle service worker errors
self.addEventListener("error", (event) => {
  console.error("💥 Service worker error:", event.error);
});

// Handle unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("💥 Service worker unhandled promise rejection:", event.reason);
});

// Handle push events (alternative to onBackgroundMessage)
self.addEventListener("push", (event) => {
  console.log("📨 Push event received:", event);

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log("📦 Push payload:", payload);

      // Handle push message similar to background message
      const notificationTitle =
        payload.notification?.title || "💊 Medicine Reminder";
      const notificationOptions = {
        body: payload.notification?.body || "Time to take your medication!",
        icon: "/medicine-icon-192.png",
        badge: "/medicine-icon-72.png",
        tag: `push-${payload.data?.reminderId || Date.now()}`,
        requireInteraction: true,
        data: payload.data,
      };

      event.waitUntil(
        self.registration.showNotification(
          notificationTitle,
          notificationOptions
        )
      );
    } catch (error) {
      console.error("💥 Error handling push event:", error);

      // Show generic notification
      event.waitUntil(
        self.registration.showNotification("💊 Medicine Reminder", {
          body: "You have a medication reminder",
          icon: "/medicine-icon-192.png",
        })
      );
    }
  }
});

// Periodic cleanup of old notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "cleanup-notifications") {
    event.waitUntil(cleanupOldNotifications());
  }
});

// Clean up old notifications
async function cleanupOldNotifications() {
  try {
    const notifications = await self.registration.getNotifications();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    notifications.forEach((notification) => {
      if (notification.timestamp && now - notification.timestamp > oneHour) {
        notification.close();
        console.log("🧹 Cleaned up old notification:", notification.tag);
      }
    });
  } catch (error) {
    console.error("💥 Error cleaning up notifications:", error);
  }
}

// Listen for messages from main app
self.addEventListener("message", (event) => {
  console.log("📬 Message received in service worker:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({
      version: "1.0.0",
      timestamp: Date.now(),
      capabilities: {
        notifications: true,
        backgroundSync: "sync" in self,
        pushMessaging: "push" in self,
      },
    });
  }

  if (event.data && event.data.type === "CLEANUP_NOTIFICATIONS") {
    cleanupOldNotifications();
  }
});

// Handle notification close events
self.addEventListener("notificationclose", (event) => {
  console.log("🔕 Notification closed:", event.notification.tag);

  // Log notification dismissal
  const data = event.notification.data || {};
  if (data.medicationId && data.reminderId) {
    handleMedicationAction("MEDICATION_DISMISSED", data);
  }
});

// Handle background sync (for offline functionality)
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync event:", event.tag);

  if (event.tag === "sync-medication-actions") {
    event.waitUntil(syncPendingActions());
  }
});

// Sync pending actions when back online
async function syncPendingActions() {
  try {
    console.log("🔄 Syncing pending medication actions...");

    // Get pending actions from IndexedDB or localStorage
    // This would be implemented based on your offline storage strategy

    console.log("✅ Pending actions synced");
  } catch (error) {
    console.error("💥 Error syncing pending actions:", error);
  }
}

// Optional: Add offline capabilities
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests for offline support
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return offline page if available
        return (
          caches.match("/offline.html") ||
          caches.match("/") ||
          new Response(
            "Medicine Reminders is offline. Please check your internet connection.",
            {
              status: 200,
              headers: { "Content-Type": "text/plain" },
            }
          )
        );
      })
    );
  }
});

console.log("🎉 Firebase messaging service worker ready!");

// Export service worker info for debugging
self.swInfo = {
  version: "1.0.0",
  initialized: Date.now(),
  firebaseConfig: {
    projectId: firebaseConfig.projectId,
    messagingSenderId: firebaseConfig.messagingSenderId,
  },
  capabilities: {
    messaging: !!messaging,
    notifications: "Notification" in self,
    backgroundSync: "sync" in self,
    pushMessaging: "push" in self,
  },
};
