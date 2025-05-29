// src/services/notificationService.js
import {
  initializeFCM,
  sendTestNotification as fcmSendTest,
  scheduleMedicationReminder as fcmScheduleReminder,
  cancelMedicationReminder as fcmCancelReminder,
  getNotificationHistory,
} from "../firebase/firebaseConfig";

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
    this.notificationsEnabled = false;
    this.reminderTimeouts = new Map();
    this.useFCM = true; // Set to false to use only browser notifications
  }

  // Initialize notification service
  async initialize() {
    console.log("🔔 Initializing Notification Service...");

    if (this.isInitialized) {
      console.log("✅ Notification service already initialized");
      return this.notificationsEnabled;
    }

    try {
      // Check if notifications are supported
      if (!this.isNotificationSupported()) {
        console.error("❌ Notifications not supported in this browser");
        return false;
      }

      if (this.useFCM) {
        // Try FCM initialization first
        try {
          console.log("🔥 Attempting FCM initialization...");
          this.fcmToken = await initializeFCM();

          if (this.fcmToken && this.fcmToken !== "browser-notifications") {
            console.log("✅ FCM initialized successfully");
            this.notificationsEnabled = true;
            this.isInitialized = true;

            // Show welcome notification
            this.showWelcomeNotification();
            return true;
          } else {
            console.log("⚠️ FCM failed, falling back to browser notifications");
            this.useFCM = false;
          }
        } catch (fcmError) {
          console.error("💥 FCM initialization failed:", fcmError);
          console.log("🔄 Falling back to browser notifications");
          this.useFCM = false;
        }
      }

      // Fallback to browser notifications
      const permission = await this.requestBrowserPermission();
      if (permission === "granted") {
        this.notificationsEnabled = true;
        this.isInitialized = true;

        // Show welcome notification
        this.showWelcomeNotification();
        console.log("✅ Browser notifications initialized successfully");
        return true;
      } else {
        console.error("❌ Browser notification permission denied");
        return false;
      }
    } catch (error) {
      console.error("💥 Error initializing notification service:", error);
      return false;
    }
  }

  // Request browser notification permission
  async requestBrowserPermission() {
    try {
      console.log("🔑 Requesting browser notification permission...");

      if (!("Notification" in window)) {
        console.error("❌ This browser does not support notifications");
        return "denied";
      }

      // Check current permission
      if (Notification.permission === "granted") {
        console.log("✅ Browser notification permission already granted");
        return "granted";
      }

      if (Notification.permission === "denied") {
        console.log("❌ Browser notification permission previously denied");
        return "denied";
      }

      // Request permission
      const permission = await Notification.requestPermission();
      console.log("📋 Browser permission result:", permission);
      return permission;
    } catch (error) {
      console.error("💥 Error requesting browser permission:", error);
      return "denied";
    }
  }

  // Show welcome notification
  showWelcomeNotification() {
    try {
      if (this.useFCM && this.fcmToken) {
        // Send welcome notification via FCM
        fcmSendTest().catch((error) => {
          console.warn(
            "⚠️ FCM welcome notification failed, using browser fallback"
          );
          this.showBrowserWelcomeNotification();
        });
      } else {
        this.showBrowserWelcomeNotification();
      }
    } catch (error) {
      console.error("💥 Error showing welcome notification:", error);
    }
  }

  // Show browser welcome notification
  showBrowserWelcomeNotification() {
    if (Notification.permission === "granted") {
      const notification = new Notification("🎉 Medicine Reminders Ready!", {
        body: "You will now receive medication reminders. Set up your medications to get started.",
        icon: "/medicine-icon-192.png",
        badge: "/medicine-icon-72.png",
        tag: "welcome-notification",
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log("🎉 Welcome notification displayed");
    }
  }

  // Schedule reminders for medications
  async scheduleReminders(reminders, medications) {
    console.log("📅 Scheduling reminders...", {
      remindersCount: reminders.length,
      medicationsCount: medications.length,
      useFCM: this.useFCM,
    });

    if (!this.notificationsEnabled) {
      console.warn("⚠️ Notifications not enabled, skipping scheduling");
      return;
    }

    // Clear existing local timeouts
    this.clearAllLocalReminders();

    let scheduledCount = 0;
    const errors = [];

    for (const reminder of reminders) {
      if (!reminder.enabled) {
        console.log(
          `⏭️ Skipping disabled reminder for ${reminder.medicationId}`
        );
        continue;
      }

      const medication = medications.find(
        (med) => med.id === reminder.medicationId
      );
      if (!medication) {
        console.warn(`⚠️ Medication not found for reminder ${reminder.id}`);
        continue;
      }

      try {
        if (this.useFCM && this.fcmToken) {
          // Schedule via FCM backend
          await fcmScheduleReminder(reminder, medication);
          console.log(`✅ FCM reminder scheduled: ${medication.name}`);
        } else {
          // Schedule locally for browser notifications
          this.scheduleLocalReminder(reminder, medication);
          console.log(`✅ Local reminder scheduled: ${medication.name}`);
        }
        scheduledCount++;
      } catch (error) {
        console.error(
          `💥 Error scheduling reminder for ${medication.name}:`,
          error
        );
        errors.push({ medication: medication.name, error: error.message });

        // Fallback to local scheduling
        if (this.useFCM) {
          console.log(
            `🔄 Falling back to local scheduling for ${medication.name}`
          );
          this.scheduleLocalReminder(reminder, medication);
          scheduledCount++;
        }
      }
    }

    console.log(`✅ Scheduled ${scheduledCount} reminders`);

    if (errors.length > 0) {
      console.warn("⚠️ Some reminders had errors:", errors);
    }

    // Show confirmation notification
    if (scheduledCount > 0) {
      this.showScheduleConfirmation(scheduledCount);
    }
  }

  // Schedule local reminder (browser notifications)
  scheduleLocalReminder(reminder, medication) {
    try {
      // Schedule for each day
      reminder.days.forEach((day) => {
        const nextReminderTime = this.getNextReminderTime(
          day,
          ...reminder.time.split(":")
        );

        if (nextReminderTime > new Date()) {
          const timeoutId = setTimeout(() => {
            console.log(`🔔 Triggering local reminder: ${medication.name}`);
            this.triggerLocalReminder(reminder, medication);

            // Reschedule for next week
            this.scheduleLocalReminder(reminder, medication);
          }, nextReminderTime.getTime() - new Date().getTime());

          this.reminderTimeouts.set(`${reminder.id}-${day}`, timeoutId);

          const minutesUntil = Math.round(
            (nextReminderTime.getTime() - new Date().getTime()) / (1000 * 60)
          );
          console.log(
            `⏰ Local reminder scheduled for ${medication.name} on ${day} in ${minutesUntil} minutes`
          );
        }
      });
    } catch (error) {
      console.error(
        `💥 Error scheduling local reminder for ${medication.name}:`,
        error
      );
    }
  }

  // Get next reminder time for a specific day
  getNextReminderTime(day, hours, minutes) {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDayIndex = dayNames.indexOf(day.toLowerCase());

    const now = new Date();
    const today = now.getDay();

    let daysUntilTarget = targetDayIndex - today;

    // If it's today but time has passed, schedule for next week
    if (daysUntilTarget === 0) {
      const todayAtTime = new Date(now);
      todayAtTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (now >= todayAtTime) {
        daysUntilTarget = 7; // Next week
      }
    }

    // If day is in the past this week, schedule for next week
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7;
    }

    const nextReminder = new Date(now);
    nextReminder.setDate(now.getDate() + daysUntilTarget);
    nextReminder.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextReminder;
  }

  // Trigger local reminder notification
  triggerLocalReminder(reminder, medication) {
    try {
      const title = "💊 Medicine Reminder";
      const body = `Time to take ${medication.name} (${medication.dosage} ${medication.units})`;

      console.log(`🔔 Showing local notification: ${title} - ${body}`);

      const notification = new Notification(title, {
        body: body,
        icon: "/medicine-icon-192.png",
        badge: "/medicine-icon-72.png",
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
        silent: false,
        actions: [], // Browser notifications have limited action support
        data: {
          medicationId: medication.id,
          reminderId: reminder.id,
          medicationName: medication.name,
          timestamp: Date.now(),
        },
      });

      // Handle notification click
      notification.onclick = () => {
        console.log("🖱️ Local notification clicked");
        window.focus();

        // Trigger custom event for the React component
        window.dispatchEvent(
          new CustomEvent("medicationTaken", {
            detail: {
              medicationId: medication.id,
              reminderId: reminder.id,
              medicationName: medication.name,
              timestamp: Date.now(),
            },
          })
        );

        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close();
      }, 30000);

      // Play notification sound if available
      this.playNotificationSound();
    } catch (error) {
      console.error("💥 Error triggering local reminder:", error);
    }
  }

  // Play notification sound
  playNotificationSound() {
    try {
      // Try to play notification sound
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => {
        console.log(
          "🔇 Could not play notification sound (this is normal):",
          e.message
        );
      });
    } catch (error) {
      console.log("🔇 Audio not supported:", error.message);
    }
  }

  // Show schedule confirmation
  showScheduleConfirmation(count) {
    try {
      const notification = new Notification("📅 Reminders Scheduled", {
        body: `${count} medication reminder${
          count !== 1 ? "s" : ""
        } have been scheduled successfully.`,
        icon: "/medicine-icon-192.png",
        tag: "schedule-confirmation",
        requireInteraction: false,
      });

      setTimeout(() => {
        notification.close();
      }, 4000);
    } catch (error) {
      console.error("💥 Error showing schedule confirmation:", error);
    }
  }

  // Send test notification
  async sendTestNotification() {
    if (!this.notificationsEnabled) {
      console.warn("⚠️ Notifications not enabled");
      return false;
    }

    try {
      if (this.useFCM && this.fcmToken) {
        console.log("🧪 Sending FCM test notification...");
        await fcmSendTest();
        return true;
      } else {
        console.log("🧪 Sending browser test notification...");
        const notification = new Notification("🧪 Test Medicine Reminder", {
          body: "This is a test notification. Your medicine reminders are working correctly!",
          icon: "/medicine-icon-192.png",
          badge: "/medicine-icon-72.png",
          tag: "test-notification",
          requireInteraction: false,
        });

        notification.onclick = () => {
          console.log("🖱️ Test notification clicked");
          notification.close();
        };

        setTimeout(() => {
          notification.close();
        }, 8000);

        console.log("🧪 Browser test notification sent");
        return true;
      }
    } catch (error) {
      console.error("💥 Error sending test notification:", error);
      return false;
    }
  }

  // Clear all scheduled reminders
  clearAllReminders() {
    console.log("🧹 Clearing all reminders...");

    // Clear local timeouts
    this.clearAllLocalReminders();

    // Clear FCM reminders if using FCM
    if (this.useFCM && this.fcmToken) {
      // Note: This would need to be implemented in the backend
      // to cancel all scheduled notifications for the user
      console.log("🧹 FCM reminders cleared (backend implementation needed)");
    }
  }

  // Clear all local timeouts
  clearAllLocalReminders() {
    console.log(
      `🧹 Clearing ${this.reminderTimeouts.size} local reminder timeouts`
    );
    this.reminderTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.reminderTimeouts.clear();
  }

  // Cancel specific reminder
  async cancelReminder(reminderId) {
    try {
      if (this.useFCM && this.fcmToken) {
        await fcmCancelReminder(reminderId);
        console.log(`✅ FCM reminder cancelled: ${reminderId}`);
      }

      // Also clear local timeouts for this reminder
      this.reminderTimeouts.forEach((timeoutId, key) => {
        if (key.startsWith(reminderId)) {
          clearTimeout(timeoutId);
          this.reminderTimeouts.delete(key);
        }
      });

      console.log(`✅ Local reminder cancelled: ${reminderId}`);
    } catch (error) {
      console.error(`💥 Error cancelling reminder ${reminderId}:`, error);
    }
  }

  // Get notification history
  async getNotificationHistory() {
    try {
      if (this.useFCM && this.fcmToken) {
        return await getNotificationHistory();
      } else {
        // For browser notifications, we'd need to implement local storage tracking
        console.log("📊 Browser notification history not implemented");
        return [];
      }
    } catch (error) {
      console.error("💥 Error getting notification history:", error);
      return [];
    }
  }

  // Check if notifications are supported
  isNotificationSupported() {
    return "Notification" in window && "serviceWorker" in navigator;
  }

  // Get current notification permission status
  getNotificationPermission() {
    return Notification?.permission || "default";
  }

  // Get current user ID (placeholder implementation)
  getCurrentUserId() {
    let userId = localStorage.getItem("device_user_id");
    if (!userId) {
      userId =
        "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("device_user_id", userId);
    }
    return userId;
  }

  // Check if service is enabled
  isEnabled() {
    return this.notificationsEnabled;
  }

  // Get FCM token
  getFCMToken() {
    return this.fcmToken;
  }

  // Check if using FCM
  isUsingFCM() {
    return (
      this.useFCM && this.fcmToken && this.fcmToken !== "browser-notifications"
    );
  }

  // Disable notifications
  disable() {
    this.clearAllReminders();
    this.notificationsEnabled = false;
    console.log("🚫 Notifications disabled");
  }

  // Enable notifications
  async enable() {
    return await this.initialize();
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      notificationsEnabled: this.notificationsEnabled,
      useFCM: this.useFCM,
      hasFCMToken: !!this.fcmToken,
      fcmToken: this.fcmToken?.substring(0, 20) + "..." || null,
      permission: this.getNotificationPermission(),
      activeReminders: this.reminderTimeouts.size,
    };
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Export individual methods for convenience
export const {
  initialize,
  scheduleReminders,
  sendTestNotification,
  clearAllReminders,
  cancelReminder,
  // getNotificationHistory,
  isNotificationSupported,
  getNotificationPermission,
  getCurrentUserId,
  isEnabled,
  getFCMToken,
  isUsingFCM,
  disable,
  enable,
  getStatus,
} = notificationService;
