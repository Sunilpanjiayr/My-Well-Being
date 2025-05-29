import React, { useState, useEffect, useCallback } from "react";

// Simple notification service without Firebase (will work immediately)
const notificationService = {
  reminderTimeouts: new Map(),

  async initialize() {
    console.log("🔔 Initializing notifications...");
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Show welcome notification
      new Notification("🎉 Medicine Reminders Ready!", {
        body: "You will now receive medication reminders.",
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💊</text></svg>',
      });
      return true;
    }
    return false;
  },

  scheduleReminders(reminders, medications) {
    console.log("📅 Scheduling reminders:", reminders.length);

    // Clear existing timeouts
    this.reminderTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.reminderTimeouts.clear();

    let scheduledCount = 0;

    reminders.forEach((reminder) => {
      if (!reminder.enabled) return;

      const medication = medications.find(
        (med) => med.id === reminder.medicationId
      );
      if (!medication) return;

      // Get current day
      const today = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Check if reminder is for today
      if (!reminder.days.includes(today)) return;

      // Schedule for today if time hasn't passed
      const now = new Date();
      const [hours, minutes] = reminder.time.split(":").map(Number);
      const scheduleTime = new Date();
      scheduleTime.setHours(hours, minutes, 0, 0);

      if (scheduleTime > now) {
        const timeoutId = setTimeout(() => {
          new Notification(`💊 ${medication.name}`, {
            body: `Time to take ${medication.dosage} ${medication.units}`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💊</text></svg>',
            requireInteraction: true,
          });
          console.log("🔔 Notification sent:", medication.name);
        }, scheduleTime.getTime() - now.getTime());

        this.reminderTimeouts.set(reminder.id, timeoutId);
        scheduledCount++;

        const minutesUntil = Math.round(
          (scheduleTime.getTime() - now.getTime()) / (1000 * 60)
        );
        console.log(
          `⏰ Scheduled ${medication.name} in ${minutesUntil} minutes`
        );
      }
    });

    if (scheduledCount > 0) {
      // Show confirmation
      setTimeout(() => {
        new Notification("📅 Reminders Scheduled", {
          body: `${scheduledCount} reminder${
            scheduledCount !== 1 ? "s" : ""
          } set for today`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✅</text></svg>',
        });
      }, 1000);
    }
  },

  sendTestNotification() {
    new Notification("🧪 Test Medicine Reminder", {
      body: "This is a test notification. Your reminders are working!",
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧪</text></svg>',
    });
  },

  clearAllReminders() {
    this.reminderTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.reminderTimeouts.clear();
    console.log("🧹 All reminders cleared");
  },
};

function MedicineReminders() {
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Form states
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  // New medication form
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    units: "mg",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // New reminder form
  const [newReminder, setNewReminder] = useState({
    medicationId: "",
    time: "08:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    notes: "",
    enabled: true,
  });

  const dosageUnits = ["mg", "ml", "g", "tablet(s)", "capsule(s)", "drop(s)"];
  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  // Update today's reminders
  const updateTodayReminders = useCallback(() => {
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const todayList = reminders
      .filter((reminder) => {
        if (!reminder.enabled) return false;
        if (!reminder.days.includes(today)) return false;

        const medication = medications.find(
          (med) => med.id === reminder.medicationId
        );
        return medication !== undefined;
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    setTodayReminders(todayList);
  }, [reminders, medications]);

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      const enabled = await notificationService.initialize();
      setNotificationsEnabled(enabled);
    };
    initNotifications();
  }, []);

  // Load saved data
  useEffect(() => {
    const savedMedications = JSON.parse(
      localStorage.getItem("medications") || "[]"
    );
    const savedReminders = JSON.parse(
      localStorage.getItem("reminders") || "[]"
    );

    setMedications(savedMedications);
    setReminders(savedReminders);
  }, []);

  // Save data and update reminders
  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
    updateTodayReminders();

    if (notificationsEnabled && reminders.length > 0) {
      notificationService.scheduleReminders(reminders, medications);
    }
  }, [reminders, medications, notificationsEnabled, updateTodayReminders]);

  // Add medication
  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;

    const medication = {
      id: Date.now().toString(),
      ...newMedication,
      createdAt: new Date().toISOString(),
    };

    setMedications([...medications, medication]);
    setNewMedication({
      name: "",
      dosage: "",
      units: "mg",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setShowAddMedication(false);
  };

  // Add reminder
  const handleAddReminder = () => {
    if (!newReminder.medicationId || !newReminder.time) return;

    const reminder = {
      id: Date.now().toString(),
      ...newReminder,
      createdAt: new Date().toISOString(),
    };

    setReminders([...reminders, reminder]);
    setNewReminder({
      medicationId: "",
      time: "08:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      notes: "",
      enabled: true,
    });
    setShowAddReminder(false);
  };

  // Toggle reminder
  const toggleReminder = (reminderId) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  // Delete medication
  const deleteMedication = (medicationId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this medication and all its reminders?"
      )
    ) {
      setMedications(medications.filter((med) => med.id !== medicationId));
      setReminders(
        reminders.filter((reminder) => reminder.medicationId !== medicationId)
      );
    }
  };

  // Delete reminder
  const deleteReminder = (reminderId) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      setReminders(reminders.filter((reminder) => reminder.id !== reminderId));
    }
  };

  // Format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format days
  const formatDays = (daysList) => {
    if (daysList.length === 7) return "Every day";
    if (
      daysList.length === 5 &&
      !daysList.includes("saturday") &&
      !daysList.includes("sunday")
    )
      return "Weekdays";
    if (
      daysList.length === 2 &&
      daysList.includes("saturday") &&
      daysList.includes("sunday")
    )
      return "Weekends";
    return daysList.map((day) => day.substring(0, 3).toUpperCase()).join(", ");
  };

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      color: "#1e293b",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e2e8f0",
    },
    button: {
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    buttonSuccess: {
      backgroundColor: "#10b981",
    },
    buttonDanger: {
      backgroundColor: "#ef4444",
    },
    buttonSecondary: {
      backgroundColor: "#6b7280",
      color: "white",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      marginBottom: "16px",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      marginBottom: "16px",
      backgroundColor: "white",
      boxSizing: "border-box",
    },
    medicationItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      marginBottom: "12px",
      backgroundColor: "#f8fafc",
    },
    reminderItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      marginBottom: "12px",
      backgroundColor: "#fefefe",
    },
    todayReminderItem: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px",
      border: "2px solid #10b981",
      borderRadius: "8px",
      marginBottom: "12px",
      backgroundColor: "#f0fdf4",
    },
    timeBlock: {
      backgroundColor: "#3b82f6",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      fontWeight: "600",
      minWidth: "80px",
      textAlign: "center",
    },
    dayCheckbox: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "16px",
    },
    dayCheckboxItem: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 8px",
      border: "1px solid #d1d5db",
      borderRadius: "4px",
      fontSize: "12px",
      cursor: "pointer",
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "12px",
      width: "90%",
      maxWidth: "500px",
      maxHeight: "80vh",
      overflowY: "auto",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>💊 Medicine Reminders</h1>
        <p>Never miss your medication again</p>
        {notificationsEnabled ? (
          <p style={{ color: "#10b981" }}>✅ Notifications enabled</p>
        ) : (
          <p style={{ color: "#ef4444" }}>❌ Notifications disabled</p>
        )}
      </div>

      {/* Today's Reminders */}
      <div style={styles.card}>
        <h2>
          📅 Today's Reminders -{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h2>

        {todayReminders.length > 0 ? (
          todayReminders.map((reminder) => {
            const medication = medications.find(
              (med) => med.id === reminder.medicationId
            );
            return (
              <div key={reminder.id} style={styles.todayReminderItem}>
                <div style={styles.timeBlock}>{formatTime(reminder.time)}</div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    {medication?.name}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>
                    {medication?.dosage} {medication?.units}
                  </div>
                  {reminder.notes && (
                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      📝 {reminder.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
            No reminders scheduled for today
          </p>
        )}

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{ ...styles.button, ...styles.buttonSuccess }}
            onClick={() => notificationService.sendTestNotification()}
          >
            🧪 Test Notification
          </button>
          <button
            style={styles.button}
            onClick={() => {
              if (notificationsEnabled) {
                notificationService.scheduleReminders(reminders, medications);
              } else {
                notificationService.initialize().then((enabled) => {
                  setNotificationsEnabled(enabled);
                });
              }
            }}
          >
            🔄 Refresh Reminders
          </button>
        </div>
      </div>

      {/* Medications */}
      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>💊 My Medications</h2>
          <button
            style={styles.button}
            onClick={() => setShowAddMedication(true)}
          >
            + Add Medication
          </button>
        </div>

        {medications.length > 0 ? (
          medications.map((medication) => (
            <div key={medication.id} style={styles.medicationItem}>
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  {medication.name}
                </div>
                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                  {medication.dosage} {medication.units}
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Started: {new Date(medication.startDate).toLocaleDateString()}
                  {medication.endDate &&
                    ` • Ends: ${new Date(
                      medication.endDate
                    ).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={styles.button}
                  onClick={() => setSelectedMedication(medication)}
                >
                  View
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonDanger }}
                  onClick={() => deleteMedication(medication.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
            No medications added yet. Click "Add Medication" to get started.
          </p>
        )}
      </div>

      {/* Reminders */}
      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>⏰ Reminders</h2>
          <button
            style={styles.button}
            onClick={() => setShowAddReminder(true)}
            disabled={medications.length === 0}
          >
            + Add Reminder
          </button>
        </div>

        {reminders.length > 0 ? (
          reminders.map((reminder) => {
            const medication = medications.find(
              (med) => med.id === reminder.medicationId
            );
            if (!medication) return null;

            return (
              <div
                key={reminder.id}
                style={{
                  ...styles.reminderItem,
                  opacity: reminder.enabled ? 1 : 0.6,
                  backgroundColor: reminder.enabled ? "#fefefe" : "#f8fafc",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={styles.timeBlock}>
                      {formatTime(reminder.time)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600" }}>{medication.name}</div>
                      <div style={{ color: "#6b7280", fontSize: "14px" }}>
                        {formatDays(reminder.days)}
                      </div>
                    </div>
                  </div>
                  {reminder.notes && (
                    <div style={{ color: "#6b7280", fontSize: "12px" }}>
                      📝 {reminder.notes}
                    </div>
                  )}
                </div>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <button
                    style={{
                      ...styles.button,
                      ...(reminder.enabled
                        ? styles.buttonSuccess
                        : styles.buttonSecondary),
                    }}
                    onClick={() => toggleReminder(reminder.id)}
                  >
                    {reminder.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.buttonDanger }}
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
            No reminders set up yet. Add medications first, then create
            reminders.
          </p>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div style={styles.modal} onClick={() => setShowAddMedication(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Add New Medication</h3>
            <input
              style={styles.input}
              type="text"
              placeholder="Medication name"
              value={newMedication.name}
              onChange={(e) =>
                setNewMedication({ ...newMedication, name: e.target.value })
              }
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                style={{ ...styles.input, flex: 2 }}
                type="number"
                placeholder="Dosage"
                value={newMedication.dosage}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, dosage: e.target.value })
                }
              />
              <select
                style={{ ...styles.select, flex: 1 }}
                value={newMedication.units}
                onChange={(e) =>
                  setNewMedication({ ...newMedication, units: e.target.value })
                }
              >
                {dosageUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <input
              style={styles.input}
              type="date"
              value={newMedication.startDate}
              onChange={(e) =>
                setNewMedication({
                  ...newMedication,
                  startDate: e.target.value,
                })
              }
            />
            <input
              style={styles.input}
              type="date"
              placeholder="End date (optional)"
              value={newMedication.endDate}
              onChange={(e) =>
                setNewMedication({ ...newMedication, endDate: e.target.value })
              }
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => setShowAddMedication(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={handleAddMedication}>
                Add Medication
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div style={styles.modal} onClick={() => setShowAddReminder(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Add New Reminder</h3>
            <select
              style={styles.select}
              value={newReminder.medicationId}
              onChange={(e) =>
                setNewReminder({ ...newReminder, medicationId: e.target.value })
              }
            >
              <option value="">Select Medication</option>
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.dosage} {med.units})
                </option>
              ))}
            </select>
            <input
              style={styles.input}
              type="time"
              value={newReminder.time}
              onChange={(e) =>
                setNewReminder({ ...newReminder, time: e.target.value })
              }
            />
            <div>
              <p style={{ marginBottom: "8px", fontWeight: "500" }}>Days:</p>
              <div style={styles.dayCheckbox}>
                {daysOfWeek.map((day) => (
                  <label key={day.id} style={styles.dayCheckboxItem}>
                    <input
                      type="checkbox"
                      checked={newReminder.days.includes(day.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewReminder({
                            ...newReminder,
                            days: [...newReminder.days, day.id],
                          });
                        } else {
                          setNewReminder({
                            ...newReminder,
                            days: newReminder.days.filter((d) => d !== day.id),
                          });
                        }
                      }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
            <input
              style={styles.input}
              type="text"
              placeholder="Notes (optional)"
              value={newReminder.notes}
              onChange={(e) =>
                setNewReminder({ ...newReminder, notes: e.target.value })
              }
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => setShowAddReminder(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={handleAddReminder}>
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medication Details Modal */}
      {selectedMedication && (
        <div style={styles.modal} onClick={() => setSelectedMedication(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedMedication.name}</h3>
            <p>
              <strong>Dosage:</strong> {selectedMedication.dosage}{" "}
              {selectedMedication.units}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(selectedMedication.startDate).toLocaleDateString()}
            </p>
            {selectedMedication.endDate && (
              <p>
                <strong>End Date:</strong>{" "}
                {new Date(selectedMedication.endDate).toLocaleDateString()}
              </p>
            )}

            <h4>Active Reminders:</h4>
            {reminders
              .filter((r) => r.medicationId === selectedMedication.id)
              .map((reminder) => (
                <div
                  key={reminder.id}
                  style={{
                    padding: "8px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "4px",
                    marginBottom: "8px",
                  }}
                >
                  <strong>{formatTime(reminder.time)}</strong> -{" "}
                  {formatDays(reminder.days)}
                  {reminder.notes && (
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      📝 {reminder.notes}
                    </div>
                  )}
                </div>
              ))}

            <button
              style={styles.button}
              onClick={() => setSelectedMedication(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicineReminders;
