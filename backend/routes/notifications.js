// Backend API Routes (Express.js)

// routes/notifications.js
const express = require("express");
const admin = require("firebase-admin");
const cron = require("node-cron");
const router = express.Router();

// Initialize Firebase Admin (add this to your main app.js)
const serviceAccount = require("../config/firebase-service-account.json"); // Download from Firebase Console

const notificationRoutes = require("./routes/notifications");
const medicationRoutes = require("./routes/medications");

app.use("/api/notifications", notificationRoutes);
app.use("/api/medications", medicationRoutes);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// In-memory storage for user tokens and reminders (use database in production)
const userTokens = new Map();
const scheduledReminders = new Map();

// Register FCM token
router.post("/register-token", async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ error: "Token and userId are required" });
    }

    // Store token (in production, save to database)
    userTokens.set(userId, token);

    console.log(`FCM token registered for user ${userId}`);
    res.json({ success: true, message: "Token registered successfully" });
  } catch (error) {
    console.error("Error registering token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Schedule reminders
router.post("/schedule-reminders", async (req, res) => {
  try {
    const { reminders, medications, userId, fcmToken } = req.body;

    if (!reminders || !medications || !userId) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Clear existing scheduled jobs for this user
    if (scheduledReminders.has(userId)) {
      const existingJobs = scheduledReminders.get(userId);
      existingJobs.forEach((job) => job.destroy());
    }

    const userJobs = [];

    // Schedule each reminder
    reminders.forEach((reminder) => {
      if (!reminder.enabled) return;

      const medication = medications.find(
        (med) => med.id === reminder.medicationId
      );
      if (!medication) return;

      // Create cron expression for each day
      reminder.days.forEach((day) => {
        const cronExpression = createCronExpression(day, reminder.time);

        const job = cron.schedule(
          cronExpression,
          async () => {
            await sendMedicationReminder(userId, medication, reminder);
          },
          {
            scheduled: true,
            timezone: "America/New_York", // Adjust timezone as needed
          }
        );

        userJobs.push(job);
      });
    });

    // Store scheduled jobs
    scheduledReminders.set(userId, userJobs);

    console.log(`Scheduled ${userJobs.length} reminders for user ${userId}`);
    res.json({ success: true, message: "Reminders scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling reminders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send test notification
router.post("/send-test", async (req, res) => {
  try {
    const { userId } = req.body;
    const token = userTokens.get(userId);

    if (!token) {
      return res.status(404).json({ error: "User token not found" });
    }

    const message = {
      notification: {
        title: "Test Notification",
        body: "This is a test medicine reminder notification!",
      },
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log("Test notification sent:", response);

    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Helper function to create cron expression
function createCronExpression(day, time) {
  const dayMapping = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  const [hours, minutes] = time.split(":");
  const dayOfWeek = dayMapping[day.toLowerCase()];

  // Cron format: minute hour day month dayOfWeek
  return `${minutes} ${hours} * * ${dayOfWeek}`;
}

// Function to send medication reminder
async function sendMedicationReminder(userId, medication, reminder) {
  try {
    const token = userTokens.get(userId);
    if (!token) {
      console.log(`No token found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: "Medicine Reminder 💊",
        body: `Time to take ${medication.name} (${medication.dosage} ${medication.units})`,
      },
      data: {
        medicationId: medication.id,
        reminderId: reminder.id,
        url: "/medicine-reminders",
      },
      token: token,
      android: {
        notification: {
          icon: "medicine_icon",
          color: medication.color || "#4a90e2",
          tag: "medicine-reminder",
          priority: "high",
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
            category: "MEDICINE_REMINDER",
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`Medication reminder sent to user ${userId}:`, response);
  } catch (error) {
    console.error("Error sending medication reminder:", error);
  }
}

module.exports = router;

// routes/medications.js
const express = require("express");


// Record medication taken
router.post("/record-taken", async (req, res) => {
  try {
    const { medicationId, reminderId, takenAt, userId } = req.body;

    // In production, save to database
    console.log("Medication taken recorded:", {
      medicationId,
      reminderId,
      takenAt,
      userId,
    });

    // You can add analytics, tracking, or update medication adherence data here

    res.json({ success: true, message: "Medication intake recorded" });
  } catch (error) {
    console.error("Error recording medication taken:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get medication adherence stats
router.get("/adherence/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // In production, calculate from database
    const adherenceStats = {
      totalReminders: 50,
      takenOnTime: 42,
      missed: 8,
      adherenceRate: 84,
    };

    res.json(adherenceStats);
  } catch (error) {
    console.error("Error getting adherence stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
