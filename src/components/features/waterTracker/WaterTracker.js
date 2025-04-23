// src/components/features/waterTracker/WaterTracker.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './WaterTracker.css';

function WaterTracker() {
  const { darkMode } = useTheme();
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000); // Default goal in ml
  const [history, setHistory] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    interval: 60, // minutes
    startTime: '08:00',
    endTime: '20:00',
    sound: true
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [intakeAmount, setIntakeAmount] = useState(250); // Default intake amount in ml
  const [showAddIntakeModal, setShowAddIntakeModal] = useState(false);
  const [intakeNote, setIntakeNote] = useState('');
  const [customAmount, setCustomAmount] = useState(false);
  const [waterType, setWaterType] = useState('water'); // water, tea, coffee, etc.
  const [activeView, setActiveView] = useState('today');
  const [streak, setStreak] = useState(0);
  const [waterLevel, setWaterLevel] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);

  // Common drink sizes
  const drinkSizes = [
    { amount: 150, label: 'Small Glass' },
    { amount: 250, label: 'Regular Glass' },
    { amount: 350, label: 'Large Glass' },
    { amount: 500, label: 'Bottle' },
    { amount: 750, label: 'Large Bottle' }
  ];

  // Drink types
  const drinkTypes = [
    { id: 'water', label: 'Water', icon: '💧', factor: 1.0 },
    { id: 'tea', label: 'Tea', icon: '🍵', factor: 0.8 },
    { id: 'coffee', label: 'Coffee', icon: '☕', factor: 0.6 },
    { id: 'juice', label: 'Juice', icon: '🧃', factor: 0.7 },
    { id: 'smoothie', label: 'Smoothie', icon: '🥤', factor: 0.8 }
  ];

  // Hydration tips
  const hydrationTips = [
    {
      id: 1,
      title: 'Morning Hydration',
      icon: '🌅',
      short: 'Start your day with water',
      content: 'Drink a glass of water first thing in the morning to rehydrate after sleep and kickstart your metabolism. This simple habit can help with digestion and energy levels throughout the day.'
    },
    {
      id: 2,
      title: 'Infused Water Ideas',
      icon: '🍋',
      short: 'Make water tastier',
      content: 'If plain water is boring, try infusing it with fruits, vegetables, or herbs. Popular combinations include: lemon and mint, cucumber and lime, strawberry and basil, or orange and cinnamon. Let the ingredients steep for at least an hour for the best flavor.'
    },
    {
      id: 3,
      title: 'Exercise Hydration',
      icon: '🏃',
      short: 'Hydrate before, during, and after workouts',
      content: 'Drink 17-20 oz of water 2-3 hours before exercise, 8 oz 20-30 minutes before exercise, 7-10 oz every 10-20 minutes during exercise, and 8 oz within 30 minutes after exercise. For intense workouts lasting more than an hour, consider a sports drink to replace electrolytes.'
    },
    {
      id: 4,
      title: 'Signs of Dehydration',
      icon: '⚠️',
      short: 'Know the warning signs',
      content: 'Watch for these signs of dehydration: thirst, dry mouth, dark yellow urine, fatigue, dizziness, headache, and dry skin. If you notice these symptoms, increase your water intake immediately.'
    },
    {
      id: 5,
      title: 'Hydration and Travel',
      icon: '✈️',
      short: 'Stay hydrated while traveling',
      content: 'Air travel can be dehydrating due to low humidity in airplane cabins. Drink 8 oz of water for every hour in flight. Avoid excessive alcohol and caffeine, which can contribute to dehydration.'
    }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('waterTrackerData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setDailyGoal(parsedData.dailyGoal || 2000);
      setHistory(parsedData.history || []);
      setReminderSettings(parsedData.reminderSettings || {
        enabled: false,
        interval: 60,
        startTime: '08:00',
        endTime: '20:00',
        sound: true
      });
      
      // Calculate streak
      calculateStreak(parsedData.history || []);
    }

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Get notification permission if reminders are enabled
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    return () => clearInterval(timer);
  }, []);

  // Update current intake based on selected date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDayData = history.find(day => day.date === (selectedDate || today));
    
    if (selectedDayData) {
      setWaterIntake(selectedDayData.amount);
    } else {
      setWaterIntake(0);
    }
  }, [selectedDate, history]);

  // Save data to localStorage when it changes
  useEffect(() => {
    const dataToSave = {
      dailyGoal,
      history,
      reminderSettings
    };
    localStorage.setItem('waterTrackerData', JSON.stringify(dataToSave));
  }, [dailyGoal, history, reminderSettings]);

  // Update water level animation based on progress
  useEffect(() => {
    const progress = (waterIntake / dailyGoal) * 100;
    const targetLevel = Math.min(progress, 100);
    
    // Animate the water level
    const animateWaterLevel = () => {
      setWaterLevel(prev => {
        if (Math.abs(prev - targetLevel) < 1) return targetLevel;
        return prev + (targetLevel > prev ? 1 : -1);
      });
    };
    
    const animation = setInterval(animateWaterLevel, 20);
    return () => clearInterval(animation);
  }, [waterIntake, dailyGoal]);

  // Handle reminders
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const now = currentTime;
    const [startHour, startMinute] = reminderSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = reminderSettings.endTime.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Check if current time is within reminder hours
    if (now >= startTime && now <= endTime) {
      const minutesSinceStart = (now - startTime) / (1000 * 60);
      
      // Check if it's time for a reminder
      if (minutesSinceStart % reminderSettings.interval < 1) {
        // Only show reminder if we haven't shown one recently for this interval
        const lastReminderTime = localStorage.getItem('lastReminderTime');
        const currentInterval = Math.floor(minutesSinceStart / reminderSettings.interval);
        
        if (!lastReminderTime || parseInt(lastReminderTime) !== currentInterval) {
          showReminderNotification();
          localStorage.setItem('lastReminderTime', currentInterval.toString());
        }
      }
    }
  }, [currentTime, reminderSettings]);

  // Calculate streak
  const calculateStreak = useCallback((historyData) => {
    if (!historyData.length) {
      setStreak(0);
      return;
    }
    
    // Sort by date, most recent first
    const sortedHistory = [...historyData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Check if there's an entry for today
    const today = new Date().toISOString().split('T')[0];
    const hasToday = sortedHistory.some(entry => 
      entry.date === today && entry.amount >= dailyGoal
    );
    
    // Start count from today or yesterday
    let currentStreak = hasToday ? 1 : 0;
    let currentDate = new Date();
    
    // If no entry for today, check if there's one for yesterday
    if (!hasToday) {
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterday = currentDate.toISOString().split('T')[0];
      const hasYesterday = sortedHistory.some(entry => 
        entry.date === yesterday && entry.amount >= dailyGoal
      );
      
      if (!hasYesterday) {
        setStreak(0);
        return;
      }
      
      currentStreak = 1;
    }
    
    // Check consecutive days backward
    for (let i = 1; i < 1000; i++) { // Set a reasonable limit
      currentDate.setDate(currentDate.getDate() - 1);
      const dateString = currentDate.toISOString().split('T')[0];
      
      const dayEntry = sortedHistory.find(entry => entry.date === dateString);
      if (!dayEntry || dayEntry.amount < dailyGoal) {
        break;
      }
      
      currentStreak++;
    }
    
    setStreak(currentStreak);
  }, [dailyGoal]);
  
  // Recalculate streak when history changes
  useEffect(() => {
    calculateStreak(history);
  }, [history, calculateStreak]);

  const showReminderNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Time to hydrate!', {
        body: `You've had ${waterIntake}ml so far. Your goal is ${dailyGoal}ml today.`,
        icon: '/water-drop.png'
      });
      
      // Play sound if enabled
      if (reminderSettings.sound) {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Auto close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showReminderNotification();
        }
      });
    }
  };

  const addWaterIntake = (amount, type = waterType) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Apply drink type factor to the amount
    const drinkTypeFactor = drinkTypes.find(t => t.id === type)?.factor || 1;
    const adjustedAmount = Math.round(amount * drinkTypeFactor);
    
    const newAmount = waterIntake + adjustedAmount;
    setWaterIntake(newAmount);
    
    // Update history
    const updatedHistory = [...history];
    const todayIndex = updatedHistory.findIndex(day => day.date === today);
    
    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = {
        ...updatedHistory[todayIndex],
        amount: newAmount,
        entries: [
          ...updatedHistory[todayIndex].entries,
          {
            time: new Date().toISOString(),
            amount: adjustedAmount,
            originalAmount: amount,
            type,
            note: intakeNote
          }
        ]
      };
    } else {
      updatedHistory.push({
        date: today,
        amount: newAmount,
        entries: [{
          time: new Date().toISOString(),
          amount: adjustedAmount,
          originalAmount: amount,
          type,
          note: intakeNote
        }]
      });
    }
    
    setHistory(updatedHistory);
    setIntakeNote('');
    setShowAddIntakeModal(false);
    
    // Show celebration if goal is reached
    if (newAmount >= dailyGoal && waterIntake < dailyGoal) {
      showGoalAchievedCelebration();
    }
  };

  const showGoalAchievedCelebration = () => {
    // Implement celebration animation or notification
    const notification = new Notification('Goal Achieved! 🎉', {
      body: `Congratulations! You've reached your daily water intake goal of ${dailyGoal}ml.`,
      icon: '/trophy.png'
    });
    
    setTimeout(() => notification.close(), 5000);
  };

  const handleGoalChange = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newGoal = parseInt(formData.get('goal'));
    
    if (!isNaN(newGoal) && newGoal >= 500) {
      setDailyGoal(newGoal);
      setShowGoalModal(false);
      
      // Recalculate streak with new goal
      calculateStreak(history);
    }
  };

  const handleReminderSettingsChange = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setReminderSettings({
      enabled: formData.get('remindersEnabled') === 'on',
      interval: parseInt(formData.get('reminderInterval')),
      startTime: formData.get('reminderStartTime'),
      endTime: formData.get('reminderEndTime'),
      sound: formData.get('reminderSound') === 'on'
    });
    
    if (formData.get('remindersEnabled') === 'on' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    setShowReminderModal(false);
  };

  const getProgressPercentage = () => {
    return Math.min(Math.round((waterIntake / dailyGoal) * 100), 100);
  };

  const getWeekData = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = history.find(day => day.date === dateString);
      
      weekData.push({
        date: dateString,
        amount: dayData ? dayData.amount : 0,
        goal: dailyGoal,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return weekData;
  };

  const getMonthData = () => {
    const today = new Date();
    const monthData = [];
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = history.find(day => day.date === dateString);
      
      monthData.push({
        date: dateString,
        amount: dayData ? dayData.amount : 0,
        goal: dailyGoal,
        day: i
      });
    }
    
    return monthData;
  };

  const getDayEntries = (date = selectedDate) => {
    const dayData = history.find(day => day.date === date);
    return dayData ? dayData.entries : [];
  };

  const deleteEntry = (date, entryTime) => {
    const updatedHistory = history.map(day => {
      if (day.date === date) {
        const entryIndex = day.entries.findIndex(entry => entry.time === entryTime);
        if (entryIndex === -1) return day;
        
        const deletedAmount = day.entries[entryIndex].amount;
        const updatedEntries = day.entries.filter(entry => entry.time !== entryTime);
        const updatedAmount = day.amount - deletedAmount;
        
        return {
          ...day,
          entries: updatedEntries,
          amount: updatedAmount
        };
      }
      return day;
    });
    
    setHistory(updatedHistory);
    
    // If the selected date is the current day, update the water intake
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const todayData = updatedHistory.find(day => day.date === today);
      setWaterIntake(todayData ? todayData.amount : 0);
    }
  };

  const getAverageIntake = (days = 7) => {
    const today = new Date();
    let totalAmount = 0;
    let daysWithData = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = history.find(day => day.date === dateString);
      
      if (dayData) {
        totalAmount += dayData.amount;
        daysWithData++;
      }
    }
    
    return daysWithData > 0 ? Math.round(totalAmount / daysWithData) : 0;
  };

  const resetToday = () => {
    if (window.confirm('Are you sure you want to reset today\'s water intake to zero?')) {
      const today = new Date().toISOString().split('T')[0];
      const updatedHistory = history.filter(day => day.date !== today);
      setHistory(updatedHistory);
      setWaterIntake(0);
    }
  };

  const getGoalAchievementDays = (days = 7) => {
    const today = new Date();
    let achievedDays = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = history.find(day => day.date === dateString);
      
      if (dayData && dayData.amount >= dailyGoal) {
        achievedDays++;
      }
    }
    
    return achievedDays;
  };

  const getDrinkTypeIcon = (typeId) => {
    const drinkType = drinkTypes.find(type => type.id === typeId);
    return drinkType ? drinkType.icon : '💧';
  };

  const getDrinkTypeLabel = (typeId) => {
    const drinkType = drinkTypes.find(type => type.id === typeId);
    return drinkType ? drinkType.label : 'Water';
  };

  const exportData = () => {
    const dataStr = JSON.stringify({
      dailyGoal,
      history,
      reminderSettings
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `water-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (importedData.dailyGoal && importedData.history) {
          if (window.confirm('This will replace your current data. Continue?')) {
            setDailyGoal(importedData.dailyGoal);
            setHistory(importedData.history);
            setReminderSettings(importedData.reminderSettings || {
              enabled: false,
              interval: 60,
              startTime: '08:00',
              endTime: '20:00',
              sound: true
            });
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid data format.');
        }
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = null;
  };

  return (
    <div className={`water-tracker-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set Daily Water Goal</h2>
              <button className="close-button" onClick={() => setShowGoalModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleGoalChange} className="water-form">
              <div className="form-group">
                <label htmlFor="goal">Daily Water Goal (ml)</label>
                <input
                  type="number"
                  id="goal"
                  name="goal"
                  min="500"
                  max="5000"
                  step="100"
                  defaultValue={dailyGoal}
                  required
                />
              </div>
              
              <div className="goal-presets">
                <button type="button" className="preset-button" onClick={() => document.getElementById('goal').value = "1500"}>1500ml</button>
                <button type="button" className="preset-button" onClick={() => document.getElementById('goal').value = "2000"}>2000ml</button>
                <button type="button" className="preset-button" onClick={() => document.getElementById('goal').value = "2500"}>2500ml</button>
                <button type="button" className="preset-button" onClick={() => document.getElementById('goal').value = "3000"}>3000ml</button>
              </div>
              
              <div className="form-info">
                <p>Recommended daily water intake varies by weight, activity level, and climate. The general recommendation is about 2000-3000ml (8-10 cups) per day.</p>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Save Goal</button>
                <button type="button" className="secondary-button" onClick={() => setShowGoalModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Reminder Settings Modal */}
      {showReminderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reminder Settings</h2>
              <button className="close-button" onClick={() => setShowReminderModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleReminderSettingsChange} className="water-form">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remindersEnabled"
                    defaultChecked={reminderSettings.enabled}
                  />
                  <span>Enable Reminders</span>
                </label>
              </div>
              
              <div className="form-group">
                <label htmlFor="reminderInterval">Remind me every (minutes)</label>
                <input
                  type="number"
                  id="reminderInterval"
                  name="reminderInterval"
                  min="15"
                  max="240"
                  step="15"
                  defaultValue={reminderSettings.interval}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reminderStartTime">Start Time</label>
                  <input
                    type="time"
                    id="reminderStartTime"
                    name="reminderStartTime"
                    defaultValue={reminderSettings.startTime}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reminderEndTime">End Time</label>
                  <input
                    type="time"
                    id="reminderEndTime"
                    name="reminderEndTime"
                    defaultValue={reminderSettings.endTime}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="reminderSound"
                    defaultChecked={reminderSettings.sound}
                  />
                  <span>Play Sound</span>
                </label>
              </div>
              
              <div className="form-info">
                <p>Reminders will only be shown during the specified time period. Make sure to allow notifications in your browser for this feature to work properly.</p>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Save Settings</button>
                <button type="button" className="secondary-button" onClick={() => setShowReminderModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Stats Modal */}
      {showStatsModal && (
        <div className="modal-overlay">
          <div className="modal-content stats-modal">
            <div className="modal-header">
              <h2>Your Hydration Stats</h2>
              <button className="close-button" onClick={() => setShowStatsModal(false)}>×</button>
            </div>
            
            <div className="stats-detail-content">
              <div className="stats-row">
                <div className="stats-item">
                  <div className="stats-label">Daily Average (7 Days)</div>
                  <div className="stats-value">{getAverageIntake(7)} ml</div>
                </div>
                <div className="stats-item">
                  <div className="stats-label">Daily Average (30 Days)</div>
                  <div className="stats-value">{getAverageIntake(30)} ml</div>
                </div>
              </div>
              
              <div className="stats-row">
                <div className="stats-item">
                  <div className="stats-label">Current Streak</div>
                  <div className="stats-value">{streak} days</div>
                </div>
                <div className="stats-item">
                  <div className="stats-label">7-Day Goal Achievement</div>
                  <div className="stats-value">{getGoalAchievementDays(7)}/7 days</div>
                </div>
              </div>
              
              <div className="stats-row">
                <div className="stats-item">
                  <div className="stats-label">30-Day Goal Achievement</div>
                  <div className="stats-value">{getGoalAchievementDays(30)}/30 days</div>
                </div>
                <div className="stats-item">
                  <div className="stats-label">Total Days Tracked</div>
                  <div className="stats-value">{history.length} days</div>
                </div>
              </div>
              
              <div className="stats-row">
                <div className="stats-item full-width">
                  <div className="stats-label">Total Water This Month</div>
                  <div className="stats-value large">
                    {getMonthData().reduce((sum, day) => sum + day.amount, 0) / 1000} L
                  </div>
                </div>
              </div>
              
              <div className="export-import-section">
                <h3>Backup & Restore</h3>
                <div className="export-import-buttons">
                  <button className="export-button" onClick={exportData}>
                    Export Data
                  </button>
                  <label className="import-button">
                    Import Data
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={importData}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setShowStatsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Intake Modal */}
      {showAddIntakeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Water Intake</h2>
              <button className="close-button" onClick={() => setShowAddIntakeModal(false)}>×</button>
            </div>
            
            <div className="drink-type-selector">
              {drinkTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`drink-type-button ${waterType === type.id ? 'active' : ''}`}
                  onClick={() => setWaterType(type.id)}
                >
                  <span className="drink-icon">{type.icon}</span>
                  <span className="drink-label">{type.label}</span>
                  <span className="drink-factor">{type.factor * 100}%</span>
                </button>
              ))}
            </div>
            
            <div className="quick-add-buttons">
              {drinkSizes.map((size) => (
                <button
                  key={size.amount}
                  type="button"
                  className={`quick-add-button ${intakeAmount === size.amount && !customAmount ? 'active' : ''}`}
                  onClick={() => {
                    setIntakeAmount(size.amount);
                    setCustomAmount(false);
                  }}
                >
                  {size.label} ({size.amount}ml)
                </button>
              ))}
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              addWaterIntake(intakeAmount, waterType);
            }} className="water-form">
              <div className="form-group">
                <label htmlFor="intakeAmount">Custom Amount (ml)</label>
                <input
                  type="number"
                  id="intakeAmount"
                  name="intakeAmount"
                  min="50"
                  max="2000"
                  step="50"
                  value={customAmount ? intakeAmount : ''}
                  onChange={(e) => {
                    setIntakeAmount(parseInt(e.target.value) || 0);
                    setCustomAmount(true);
                  }}
                  placeholder="Enter custom amount"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="intakeNote">Note (optional)</label>
                <textarea
                  id="intakeNote"
                  name="intakeNote"
                  value={intakeNote}
                  onChange={(e) => setIntakeNote(e.target.value)}
                  placeholder="e.g. After workout, with lemon, etc."
                  rows="2"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Add Intake</button>
                <button type="button" className="secondary-button" onClick={() => setShowAddIntakeModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Tip Detail Modal */}
      {selectedTip && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedTip.title}</h2>
              <button className="close-button" onClick={() => setSelectedTip(null)}>×</button>
            </div>
            
            <div className="tip-detail-content">
              <div className="tip-detail-icon">{selectedTip.icon}</div>
              <p className="tip-detail-text">{selectedTip.content}</p>
            </div>
            
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedTip(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="water-tracker-header">
        <div className="header-content">
          <h1>Water Tracker</h1>
          <p>Stay hydrated and track your daily water consumption</p>
        </div>
        <div className="header-actions">
          <button className="settings-button" onClick={() => setShowGoalModal(true)}>
            <span className="icon">⚙️</span> Goal
          </button>
          <button className="settings-button" onClick={() => setShowReminderModal(true)}>
            <span className="icon">⏰</span> Reminders
          </button>
          <button className="settings-button" onClick={() => setShowStatsModal(true)}>
            <span className="icon">📊</span> Stats
          </button>
        </div>
      </div>
      
      {/* View Tabs */}
      <div className="view-tabs">
        <button 
          className={activeView === 'today' ? 'active' : ''}
          onClick={() => {
            setActiveView('today');
            setSelectedDate(new Date().toISOString().split('T')[0]);
          }}
        >
          Today
        </button>
        <button 
          className={activeView === 'history' ? 'active' : ''}
          onClick={() => setActiveView('history')}
        >
          History
        </button>
        <button 
          className={activeView === 'trends' ? 'active' : ''}
          onClick={() => setActiveView('trends')}
        >
          Trends
        </button>
        <button 
          className={activeView === 'tips' ? 'active' : ''}
          onClick={() => setActiveView('tips')}
        >
          Tips
        </button>
      </div>
      
      {/* Today View */}
      {activeView === 'today' && (
        <>
          {/* Main Tracking Section */}
          <div className="tracking-section">
            <div className="water-visualization">
              <div className="water-container">
                <div 
                  className="water-level" 
                  style={{ height: `${waterLevel}%` }}
                ></div>
                <div className="water-overlay">
                  <div className="water-amount">{waterIntake}ml</div>
                  <div className="water-percentage">{getProgressPercentage()}%</div>
                </div>
              </div>
            </div>
            
            <div className="tracking-info">
              <div className="goal-display">
                <span className="goal-label">Daily Goal</span>
                <span className="goal-value">{dailyGoal}ml</span>
                <button className="edit-goal" onClick={() => setShowGoalModal(true)}>Edit</button>
              </div>
              
              <div className="streak-display">
                <span className="streak-label">Current Streak</span>
                <span className="streak-value">{streak} day{streak !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="remaining-display">
                <span className="remaining-label">Remaining</span>
                <span className="remaining-value">
                  {Math.max(0, dailyGoal - waterIntake)}ml
                </span>
              </div>
              
              <div className="quick-actions">
                {drinkSizes.slice(0, 3).map((size) => (
                  <button
                    key={size.amount}
                    className="quick-add-button"
                    onClick={() => addWaterIntake(size.amount)}
                  >
                    <span className="amount">{size.amount}ml</span>
                    <span className="label">{size.label}</span>
                  </button>
                ))}
                <button 
                  className="custom-add-button"
                  onClick={() => setShowAddIntakeModal(true)}
                >
                  <span className="custom-icon">+</span>
                  <span className="label">Custom</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Today's Entries */}
          <div className="today-entries-section">
            <div className="entries-header">
              <h2>Today's Entries</h2>
              <div className="entries-actions">
                <button className="add-entry-button" onClick={() => setShowAddIntakeModal(true)}>Add Entry</button>
                <button className="reset-button" onClick={resetToday}>Reset</button>
              </div>
            </div>
            
            {getDayEntries().length > 0 ? (
              <div className="entries-list">
                {getDayEntries()
                  .sort((a, b) => new Date(b.time) - new Date(a.time))
                  .map((entry, index) => (
                    <div key={index} className="entry-card">
                      <div className="entry-type-icon">
                        {getDrinkTypeIcon(entry.type || 'water')}
                      </div>
                      <div className="entry-info">
                        <div className="entry-primary">
                          <div className="entry-time">
                            {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="entry-amount">
                            +{entry.amount}ml
                            {entry.type && entry.type !== 'water' && (
                              <span className="entry-type">
                                {getDrinkTypeLabel(entry.type)}
                                {entry.originalAmount && entry.originalAmount !== entry.amount && (
                                  ` (${entry.originalAmount}ml × ${drinkTypes.find(t => t.id === entry.type)?.factor || 1})`
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.note && (
                          <div className="entry-note">
                            {entry.note}
                          </div>
                        )}
                      </div>
                      <button 
                        className="delete-entry"
                        onClick={() => deleteEntry(selectedDate, entry.time)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-entries">
                <p>No water intake recorded for today</p>
                <button className="add-first-entry" onClick={() => setShowAddIntakeModal(true)}>
                  Add Your First Entry
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* History View */}
      {activeView === 'history' && (
        <div className="history-view">
          <div className="date-selector">
            <button 
              className="date-nav-button"
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
            >
              ←
            </button>
            
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            
            <button 
              className="date-nav-button"
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                const today = new Date().toISOString().split('T')[0];
                if (date <= new Date(today)) {
                  setSelectedDate(date.toISOString().split('T')[0]);
                }
              }}
              disabled={selectedDate === new Date().toISOString().split('T')[0]}
            >
              →
            </button>
          </div>
          
          <div className="day-summary">
            <div className="day-info">
              <div className="day-date">
                {new Date(selectedDate).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="day-stats">
                <div className="day-intake">
                  <span className="stat-label">Total Intake:</span>
                  <span className="stat-value">{waterIntake}ml</span>
                </div>
                <div className="day-goal">
                  <span className="stat-label">Goal:</span>
                  <span className="stat-value">{dailyGoal}ml</span>
                </div>
                <div className="day-percentage">
                  <span className="stat-label">Progress:</span>
                  <span className={`stat-value ${getProgressPercentage() >= 100 ? 'completed' : ''}`}>
                    {getProgressPercentage()}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="day-progress-bar">
              <div 
                className={`day-progress-fill ${getProgressPercentage() >= 100 ? 'completed' : ''}`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          <div className="history-entries-section">
            <h3>Entries for this day</h3>
            
            {getDayEntries(selectedDate).length > 0 ? (
              <div className="entries-list">
                {getDayEntries(selectedDate)
                  .sort((a, b) => new Date(b.time) - new Date(a.time))
                  .map((entry, index) => (
                    <div key={index} className="entry-card">
                      <div className="entry-type-icon">
                        {getDrinkTypeIcon(entry.type || 'water')}
                      </div>
                      <div className="entry-info">
                        <div className="entry-primary">
                          <div className="entry-time">
                            {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="entry-amount">
                            +{entry.amount}ml
                            {entry.type && entry.type !== 'water' && (
                              <span className="entry-type">
                                {getDrinkTypeLabel(entry.type)}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.note && (
                          <div className="entry-note">
                            {entry.note}
                          </div>
                        )}
                      </div>
                      <button 
                        className="delete-entry"
                        onClick={() => deleteEntry(selectedDate, entry.time)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-entries">
                <p>No water intake recorded for this day</p>
                {selectedDate === new Date().toISOString().split('T')[0] && (
                  <button className="add-first-entry" onClick={() => setShowAddIntakeModal(true)}>
                    Add Entry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Trends View */}
      {activeView === 'trends' && (
        <div className="trends-view">
          <div className="visualization-section">
            <h2>Weekly Progress</h2>
            <div className="week-chart">
              {getWeekData().map((day, index) => (
                <div key={index} className="day-bar">
                  <div className="bar-label">{day.day}</div>
                  <div className="bar-container">
                    {/* Goal Line */}
                    <div className="goal-line" style={{ bottom: `${(day.goal / Math.max(...getWeekData().map(d => Math.max(d.amount, d.goal)))) * 100}%` }}></div>
                    
                    <div 
                      className={`bar-fill ${day.amount >= day.goal ? 'goal-met' : ''}`}
                      style={{
                        height: `${(day.amount / Math.max(...getWeekData().map(d => Math.max(d.amount, d.goal)))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">{day.amount}ml</div>
                </div>
              ))}
            </div>
            
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color bar-fill"></div>
                <div className="legend-label">Water Intake</div>
              </div>
              <div className="legend-item">
                <div className="legend-color bar-fill goal-met"></div>
                <div className="legend-label">Goal Achieved</div>
              </div>
              <div className="legend-item">
                <div className="legend-line"></div>
                <div className="legend-label">Goal Level ({dailyGoal}ml)</div>
              </div>
            </div>
          </div>
          
          <div className="trends-stats">
            <div className="trends-stat-card">
              <div className="trend-title">Weekly Average</div>
              <div className="trend-value">{getAverageIntake(7)}ml</div>
              <div className="trend-subtitle">
                {getAverageIntake(7) >= dailyGoal ? 'Above goal 👏' : `${Math.round((getAverageIntake(7) / dailyGoal) * 100)}% of goal`}
              </div>
            </div>
            
            <div className="trends-stat-card">
              <div className="trend-title">Goals Reached</div>
              <div className="trend-value">{getGoalAchievementDays(7)}/7</div>
              <div className="trend-subtitle">
                days this week
              </div>
            </div>
            
            <div className="trends-stat-card">
              <div className="trend-title">Current Streak</div>
              <div className="trend-value">{streak}</div>
              <div className="trend-subtitle">
                {streak === 1 ? 'day' : 'days'} in a row
              </div>
            </div>
            
            <div className="trends-stat-card">
              <div className="trend-title">Monthly Progress</div>
              <div className="trend-value">{getGoalAchievementDays(30)}/30</div>
              <div className="trend-subtitle">
                days goal reached
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tips View */}
      {activeView === 'tips' && (
        <div className="tips-view">
          <div className="tips-header">
            <h2>Hydration Tips</h2>
            <p>Learn more about staying properly hydrated for optimal health</p>
          </div>
          
          <div className="tips-grid">
            {hydrationTips.map(tip => (
              <div key={tip.id} className="tip-card" onClick={() => setSelectedTip(tip)}>
                <div className="tip-icon">{tip.icon}</div>
                <h3>{tip.title}</h3>
                <p>{tip.short}</p>
                <button className="read-more">Read More</button>
              </div>
            ))}
          </div>
          
          <div className="tips-extra-section">
            <h3>Additional Resources</h3>
            <p>Want to learn more about the importance of proper hydration? Check out these resources:</p>
            <ul className="resources-list">
              <li>Mayo Clinic: <a href="#">Water - How much should you drink every day?</a></li>
              <li>CDC: <a href="#">Water & Nutrition</a></li>
              <li>Harvard Health: <a href="#">How much water should you drink?</a></li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="water-disclaimer">
        <p><strong>Note:</strong> Individual water needs vary based on factors like activity level, climate, and health. Consult with a healthcare professional for personalized recommendations.</p>
      </div>
    </div>
  );
}

export default WaterTracker;