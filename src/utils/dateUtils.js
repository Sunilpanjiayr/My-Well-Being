// src/utils/dateUtils.js
// Date formatting utility functions for Medicine Reminders

/**
 * Get the current day name in lowercase
 * @returns {string} - Day name (e.g., 'monday', 'tuesday')
 */
export const getCurrentDayName = () => {
  const today = new Date();
  return today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
};

/**
 * Format a date to display with day name
 * @param {string|Date} date - Date to format
 * @param {boolean} includeYear - Whether to include year
 * @returns {string} - Formatted date string
 */
export const formatDateWithDay = (date, includeYear = true) => {
  const dateObj = new Date(date);
  const options = {
    weekday: "long",
    year: includeYear ? "numeric" : undefined,
    month: "long",
    day: "numeric",
  };

  return dateObj.toLocaleDateString("en-US", options);
};

/**
 * Format today's date for header display
 * @returns {string} - Formatted today's date
 */
export const formatTodayHeader = () => {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format day names list for display
 * @param {string[]} daysList - Array of day names
 * @returns {string} - Formatted days string
 */
export const formatDaysList = (daysList) => {
  if (!daysList || daysList.length === 0) return "No days selected";
  if (daysList.length === 7) return "Every day";

  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const weekends = ["saturday", "sunday"];

  // Check for weekdays only
  if (
    weekdays.every((day) => daysList.includes(day)) &&
    !weekends.some((day) => daysList.includes(day))
  ) {
    return "Weekdays";
  }

  // Check for weekends only
  if (
    weekends.every((day) => daysList.includes(day)) &&
    !weekdays.some((day) => daysList.includes(day))
  ) {
    return "Weekends";
  }

  // Create a mapping for proper day names
  const dayNames = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  // Sort days in proper order
  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const sortedDays = daysList.sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  return sortedDays
    .map(
      (day) => dayNames[day] || day.charAt(0).toUpperCase() + day.slice(1, 3)
    )
    .join(", ");
};

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    today.getDate() === checkDate.getDate() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getFullYear() === checkDate.getFullYear()
  );
};

/**
 * Check if reminder should be active today
 * @param {Object} reminder - Reminder object
 * @param {Object} medication - Medication object
 * @returns {boolean} - True if reminder is active today
 */
export const isReminderActiveToday = (reminder, medication) => {
  if (!reminder.enabled) return false;

  const today = new Date();
  const dayOfWeek = getCurrentDayName();

  // Check if today is in the reminder's days
  if (!reminder.days.includes(dayOfWeek)) return false;

  // Check medication start/end dates
  const startDate = new Date(medication.startDate);
  const endDate = medication.endDate ? new Date(medication.endDate) : null;

  if (today < startDate) return false;
  if (endDate && today > endDate) return false;

  return true;
};

/**
 * Get formatted time string
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} - Formatted time string
 */
export const formatTime = (timeString) => {
  try {
    const [hours, minutes] = timeString.split(":");
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours, 10));
    timeObj.setMinutes(parseInt(minutes, 10));

    return timeObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

/**
 * Get relative time string (e.g., "in 2 hours", "30 minutes ago")
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (timeString) => {
  try {
    const [hours, minutes] = timeString.split(":");
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours, 10));
    reminderTime.setMinutes(parseInt(minutes, 10));
    reminderTime.setSeconds(0);

    const now = new Date();
    const diffMs = reminderTime - now;
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins === 0) return "Now";
    if (diffMins > 0) {
      if (diffMins < 60)
        return `in ${diffMins} min${diffMins !== 1 ? "s" : ""}`;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (mins === 0) return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
      return `in ${hours}h ${mins}m`;
    } else {
      const absMins = Math.abs(diffMins);
      if (absMins < 60) return `${absMins} min${absMins !== 1 ? "s" : ""} ago`;
      const hours = Math.floor(absMins / 60);
      const mins = absMins % 60;
      if (mins === 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      return `${hours}h ${mins}m ago`;
    }
  } catch (error) {
    console.error("Error getting relative time:", error);
    return timeString;
  }
};

/**
 * Check if time is in the past today
 * @param {string} timeString - Time in HH:MM format
 * @returns {boolean} - True if time has passed today
 */
export const isTimePastToday = (timeString) => {
  try {
    const [hours, minutes] = timeString.split(":");
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours, 10));
    reminderTime.setMinutes(parseInt(minutes, 10));
    reminderTime.setSeconds(0);

    const now = new Date();
    return now > reminderTime;
  } catch (error) {
    console.error("Error checking if time is past:", error);
    return false;
  }
};
