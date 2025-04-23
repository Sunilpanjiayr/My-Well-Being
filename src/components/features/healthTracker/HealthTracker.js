// src/components/features/healthTracker/HealthTracker.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import '../../../components/features/healthTracker/HealthTracker.css';
function HealthTracker() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthData, setHealthData] = useState({
    weight: { value: 70.5, unit: 'kg' },
    height: { value: 175, unit: 'cm' },
    bmi: 23.0,
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    steps: 8245,
    calories: { consumed: 1850, burned: 450 },
    sleep: { hours: 7.5, quality: "Good" },
    water: { amount: 1.8, unit: 'L' }
  });
  
  const [healthHistory, setHealthHistory] = useState({
    weight: [
      { date: '2025-04-05', value: 71.2 },
      { date: '2025-04-06', value: 71.0 },
      { date: '2025-04-07', value: 70.8 },
      { date: '2025-04-08', value: 70.7 },
      { date: '2025-04-09', value: 70.6 },
      { date: '2025-04-10', value: 70.5 }
    ],
    steps: [
      { date: '2025-04-05', value: 7850 },
      { date: '2025-04-06', value: 8100 },
      { date: '2025-04-07', value: 7950 },
      { date: '2025-04-08', value: 8500 },
      { date: '2025-04-09', value: 7800 },
      { date: '2025-04-10', value: 8245 }
    ],
    bloodPressure: [
      { date: '2025-04-05', systolic: 122, diastolic: 82 },
      { date: '2025-04-06', systolic: 121, diastolic: 81 },
      { date: '2025-04-07', systolic: 120, diastolic: 80 },
      { date: '2025-04-08', systolic: 120, diastolic: 80 },
      { date: '2025-04-09', systolic: 121, diastolic: 81 },
      { date: '2025-04-10', systolic: 120, diastolic: 80 }
    ],
    sleep: [
      { date: '2025-04-05', hours: 7.0 },
      { date: '2025-04-06', hours: 7.2 },
      { date: '2025-04-07', hours: 7.8 },
      { date: '2025-04-08', hours: 7.5 },
      { date: '2025-04-09', hours: 7.3 },
      { date: '2025-04-10', hours: 7.5 }
    ]
  });
  
  const [newEntry, setNewEntry] = useState({
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    steps: '',
    caloriesConsumed: '',
    caloriesBurned: '',
    sleepHours: '',
    sleepQuality: 'Good',
    waterAmount: ''
  });
  
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [healthTips, setHealthTips] = useState([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const [goals, setGoals] = useState([
    { id: 1, type: 'steps', target: 10000, current: 8245, unit: 'steps', deadline: '2025-04-18', status: 'in-progress' },
    { id: 2, type: 'weight', target: 68, current: 70.5, unit: 'kg', deadline: '2025-05-15', status: 'in-progress' },
    { id: 3, type: 'water', target: 2.5, current: 1.8, unit: 'L', deadline: '2025-04-20', status: 'in-progress' }
  ]);
  
  const [newGoal, setNewGoal] = useState({
    type: 'weight',
    target: '',
    deadline: '',
    unit: ''
  });
  
  // Health tips database
  const healthTipsDatabase = [
    {
      category: 'exercise',
      tips: [
        "Try to accumulate at least 150 minutes of moderate-intensity exercise per week.",
        "Incorporate strength training at least twice a week to maintain muscle mass.",
        "Short on time? High-intensity interval training (HIIT) can be effective in just 20 minutes.",
        "Consider taking the stairs instead of the elevator for daily activity.",
        "Walking 10,000 steps daily can significantly improve cardiovascular health."
      ]
    },
    {
      category: 'nutrition',
      tips: [
        "Aim to fill half your plate with vegetables and fruits at each meal.",
        "Stay hydrated by drinking at least 8 glasses of water daily.",
        "Limit processed foods high in sodium and added sugars.",
        "Include protein with each meal to help maintain muscle mass.",
        "Consider intermittent fasting after consulting with your healthcare provider."
      ]
    },
    {
      category: 'sleep',
      tips: [
        "Maintain a regular sleep schedule, even on weekends.",
        "Limit screen time at least an hour before bedtime.",
        "Keep your bedroom cool, dark, and quiet for optimal sleep.",
        "Avoid caffeine after 2 PM as it can interfere with sleep quality.",
        "Adults should aim for 7-9 hours of quality sleep per night."
      ]
    },
    {
      category: 'stress',
      tips: [
        "Practice mindfulness or meditation to reduce stress levels.",
        "Deep breathing exercises can help activate your body's relaxation response.",
        "Regular physical activity can help reduce stress hormones.",
        "Consider limiting news consumption if it increases anxiety.",
        "Spend time in nature to reduce mental fatigue and stress."
      ]
    }
  ];
  
  // Load random health tips
  useEffect(() => {
    const categories = healthTipsDatabase.map(item => item.category);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryTips = healthTipsDatabase.find(item => item.category === randomCategory).tips;
    const randomTips = [];
    
    // Get 3 random tips
    while (randomTips.length < 3 && categoryTips.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryTips.length);
      randomTips.push({
        category: randomCategory,
        tip: categoryTips[randomIndex]
      });
      categoryTips.splice(randomIndex, 1);
    }
    
    setHealthTips(randomTips);
  }, []);
  
  // Load saved data on component mount
  useEffect(() => {
    const savedHealthData = JSON.parse(localStorage.getItem('healthData'));
    const savedHealthHistory = JSON.parse(localStorage.getItem('healthHistory'));
    const savedGoals = JSON.parse(localStorage.getItem('healthGoals'));
    
    if (savedHealthData) setHealthData(savedHealthData);
    if (savedHealthHistory) setHealthHistory(savedHealthHistory);
    if (savedGoals) setGoals(savedGoals);
  }, []);
  
  // Save data when changes occur
  useEffect(() => {
    localStorage.setItem('healthData', JSON.stringify(healthData));
    localStorage.setItem('healthHistory', JSON.stringify(healthHistory));
    localStorage.setItem('healthGoals', JSON.stringify(goals));
  }, [healthData, healthHistory, goals]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGoalInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Set appropriate unit based on goal type
    if (name === 'type') {
      let unit = '';
      switch (value) {
        case 'weight':
          unit = 'kg';
          break;
        case 'steps':
          unit = 'steps';
          break;
        case 'water':
          unit = 'L';
          break;
        case 'sleep':
          unit = 'hours';
          break;
        default:
          unit = '';
      }
      
      setNewGoal(prev => ({
        ...prev,
        unit: unit
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update health data with new values
    let updatedHealthData = { ...healthData };
    let updatedHealthHistory = { ...healthHistory };
    const today = new Date().toISOString().split('T')[0];
    
    if (newEntry.weight) {
      const weightValue = parseFloat(newEntry.weight);
      updatedHealthData.weight.value = weightValue;
      
      // Update weight history
      updatedHealthHistory.weight = [
        ...updatedHealthHistory.weight,
        { date: today, value: weightValue }
      ];
      
      // Update goals related to weight
      const updatedGoals = goals.map(goal => {
        if (goal.type === 'weight') {
          return {
            ...goal,
            current: weightValue,
            status: weightValue <= goal.target ? 'achieved' : 'in-progress'
          };
        }
        return goal;
      });
      setGoals(updatedGoals);
    }
    
    if (newEntry.bloodPressureSystolic && newEntry.bloodPressureDiastolic) {
      const systolic = parseInt(newEntry.bloodPressureSystolic);
      const diastolic = parseInt(newEntry.bloodPressureDiastolic);
      
      updatedHealthData.bloodPressure = {
        systolic: systolic,
        diastolic: diastolic
      };
      
      // Update blood pressure history
      updatedHealthHistory.bloodPressure = [
        ...updatedHealthHistory.bloodPressure,
        { date: today, systolic: systolic, diastolic: diastolic }
      ];
    }
    
    if (newEntry.heartRate) {
      updatedHealthData.heartRate = parseInt(newEntry.heartRate);
    }
    
    if (newEntry.steps) {
      const stepsValue = parseInt(newEntry.steps);
      updatedHealthData.steps = stepsValue;
      
      // Update steps history
      updatedHealthHistory.steps = [
        ...updatedHealthHistory.steps,
        { date: today, value: stepsValue }
      ];
      
      // Update goals related to steps
      const updatedGoals = goals.map(goal => {
        if (goal.type === 'steps') {
          return {
            ...goal,
            current: stepsValue,
            status: stepsValue >= goal.target ? 'achieved' : 'in-progress'
          };
        }
        return goal;
      });
      setGoals(updatedGoals);
    }
    
    if (newEntry.caloriesConsumed) {
      updatedHealthData.calories.consumed = parseInt(newEntry.caloriesConsumed);
    }
    
    if (newEntry.caloriesBurned) {
      updatedHealthData.calories.burned = parseInt(newEntry.caloriesBurned);
    }
    
    if (newEntry.sleepHours) {
      const sleepValue = parseFloat(newEntry.sleepHours);
      updatedHealthData.sleep.hours = sleepValue;
      updatedHealthData.sleep.quality = newEntry.sleepQuality;
      
      // Update sleep history
      updatedHealthHistory.sleep = [
        ...updatedHealthHistory.sleep,
        { date: today, hours: sleepValue, quality: newEntry.sleepQuality }
      ];
    }
    
    if (newEntry.waterAmount) {
      const waterValue = parseFloat(newEntry.waterAmount);
      updatedHealthData.water.amount = waterValue;
      
      // Update goals related to water
      const updatedGoals = goals.map(goal => {
        if (goal.type === 'water') {
          return {
            ...goal,
            current: waterValue,
            status: waterValue >= goal.target ? 'achieved' : 'in-progress'
          };
        }
        return goal;
      });
      setGoals(updatedGoals);
    }
    
    // Calculate BMI if weight was updated
    if (newEntry.weight) {
      const heightInMeters = updatedHealthData.height.value / 100;
      updatedHealthData.bmi = parseFloat((updatedHealthData.weight.value / (heightInMeters * heightInMeters)).toFixed(1));
    }
    
    setHealthData(updatedHealthData);
    setHealthHistory(updatedHealthHistory);
    
    // Reset form
    setNewEntry({
      weight: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      steps: '',
      caloriesConsumed: '',
      caloriesBurned: '',
      sleepHours: '',
      sleepQuality: 'Good',
      waterAmount: ''
    });
    
    // Switch to overview tab
    setActiveTab('overview');
  };
  
  const handleAddGoal = (e) => {
    e.preventDefault();
    
    if (!newGoal.target || !newGoal.deadline) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new goal
    const newGoalObj = {
      id: Date.now(),
      type: newGoal.type,
      target: parseFloat(newGoal.target),
      current: healthData[newGoal.type]?.value || 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      status: 'in-progress'
    };
    
    // Special cases for composite data
    if (newGoal.type === 'steps') {
      newGoalObj.current = healthData.steps;
    } else if (newGoal.type === 'water') {
      newGoalObj.current = healthData.water.amount;
    } else if (newGoal.type === 'sleep') {
      newGoalObj.current = healthData.sleep.hours;
    }
    
    // Add to goals
    setGoals([...goals, newGoalObj]);
    
    // Reset form and close modal
    setNewGoal({
      type: 'weight',
      target: '',
      deadline: '',
      unit: 'kg'
    });
    
    setGoalModalOpen(false);
  };
  
  const deleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };
  
  const generateChartData = (metricData, label, color) => {
    // Get the last 7 entries or all if less than 7
    const recentData = metricData.slice(-7);
    
    return {
      labels: recentData.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: label,
          data: recentData.map(item => item.value || (item.systolic ? `${item.systolic}/${item.diastolic}` : null)),
          fill: false,
          backgroundColor: color,
          borderColor: color,
        },
      ],
    };
  };
  
  const getGoalProgress = (goal) => {
    let progress = 0;
    
    if (goal.type === 'weight') {
      // For weight, progress is better if it's decreasing
      const initialWeight = healthHistory.weight[0]?.value || goal.current;
      const difference = initialWeight - goal.current;
      const totalNeeded = initialWeight - goal.target;
      
      // Avoid division by zero
      if (totalNeeded > 0) {
        progress = Math.min(100, Math.max(0, (difference / totalNeeded) * 100));
      }
    } else {
      // For other goals, progress is better if increasing
      progress = Math.min(100, (goal.current / goal.target) * 100);
    }
    
    return Math.round(progress);
  };
  
  const getGoalStatusClass = (goal) => {
    if (goal.status === 'achieved') return 'goal-achieved';
    
    const progress = getGoalProgress(goal);
    if (progress >= 75) return 'goal-near';
    if (progress >= 25) return 'goal-progress';
    return 'goal-start';
  };
  
  const getGoalIcon = (type) => {
    switch (type) {
      case 'weight':
        return '⚖️';
      case 'steps':
        return '👣';
      case 'water':
        return '💧';
      case 'sleep':
        return '💤';
      default:
        return '🎯';
    }
  };
  
  return (
    <div className={`health-tracker-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Goal Setting Modal */}
      {goalModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set New Health Goal</h2>
              <button className="close-button" onClick={() => setGoalModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddGoal} className="goal-form">
              <div className="form-group">
                <label htmlFor="goalType">Goal Type</label>
                <select 
                  id="goalType" 
                  name="type" 
                  value={newGoal.type}
                  onChange={handleGoalInputChange}
                  required
                >
                  <option value="weight">Weight</option>
                  <option value="steps">Daily Steps</option>
                  <option value="water">Water Intake</option>
                  <option value="sleep">Sleep Hours</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="goalTarget">Target ({newGoal.unit})</label>
                <input
                  id="goalTarget"
                  name="target"
                  type="number"
                  step="0.1"
                  value={newGoal.target}
                  onChange={handleGoalInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="goalDeadline">Target Date</label>
                <input
                  id="goalDeadline"
                  name="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={handleGoalInputChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Set Goal</button>
                <button type="button" className="secondary-button" onClick={() => setGoalModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Selected Goal Detail Modal */}
      {selectedGoal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Goal Details</h2>
              <button className="close-button" onClick={() => setSelectedGoal(null)}>×</button>
            </div>
            
            <div className="goal-details">
              <div className="goal-icon-large">{getGoalIcon(selectedGoal.type)}</div>
              
              <div className="goal-detail-row">
                <h3>Type:</h3>
                <p>{selectedGoal.type.charAt(0).toUpperCase() + selectedGoal.type.slice(1)}</p>
              </div>
              
              <div className="goal-detail-row">
                <h3>Target:</h3>
                <p>{selectedGoal.target} {selectedGoal.unit}</p>
              </div>
              
              <div className="goal-detail-row">
                <h3>Current:</h3>
                <p>{selectedGoal.current} {selectedGoal.unit}</p>
              </div>
              
              <div className="goal-detail-row">
                <h3>Progress:</h3>
                <div className="goal-progress-bar">
                  <div 
                    className={`progress-fill ${getGoalStatusClass(selectedGoal)}`}
                    style={{ width: `${getGoalProgress(selectedGoal)}%` }}
                  ></div>
                </div>
                <p>{getGoalProgress(selectedGoal)}%</p>
              </div>
              
              <div className="goal-detail-row">
                <h3>Deadline:</h3>
                <p>{new Date(selectedGoal.deadline).toLocaleDateString()}</p>
              </div>
              
              <div className="goal-detail-row">
                <h3>Status:</h3>
                <p className={`goal-status ${selectedGoal.status}`}>
                  {selectedGoal.status === 'achieved' ? 'Achieved' : 'In Progress'}
                </p>
              </div>
              
              <div className="goal-actions">
                <button className="primary-button" onClick={() => setSelectedGoal(null)}>Close</button>
                <button className="danger-button" onClick={() => {
                  deleteGoal(selectedGoal.id);
                  setSelectedGoal(null);
                }}>Delete Goal</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="health-tracker-header">
        <div className="header-content">
          <h1>Health Tracker</h1>
          <p>Monitor your health metrics and achieve your wellness goals</p>
        </div>
        <button className="set-goal-button" onClick={() => setGoalModalOpen(true)}>
          <span className="goal-icon">🎯</span>
          Set New Goal
        </button>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'active' : ''}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('add-entry')}
          className={activeTab === 'add-entry' ? 'active' : ''}
        >
          Add New Entry
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={activeTab === 'statistics' ? 'active' : ''}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={activeTab === 'goals' ? 'active' : ''}
        >
          Goals
        </button>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            <div className="health-cards">
              {/* BMI Card */}
              <div className="health-card">
                <h3>BMI</h3>
                <div className="health-card-content">
                  <div className={`health-indicator ${
                    healthData.bmi < 18.5 ? 'yellow' :
                    healthData.bmi < 25 ? 'green' :
                    healthData.bmi < 30 ? 'yellow' : 'red'
                  }`}>
                    <span>{healthData.bmi}</span>
                  </div>
                  <div>
                    <p className="health-status">
                      {healthData.bmi < 18.5
                        ? 'Underweight'
                        : healthData.bmi < 25
                        ? 'Normal weight'
                        : healthData.bmi < 30
                        ? 'Overweight'
                        : 'Obese'}
                    </p>
                    <p className="health-details">
                      Weight: {healthData.weight.value} {healthData.weight.unit} | 
                      Height: {healthData.height.value} {healthData.height.unit}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Blood Pressure Card */}
              <div className="health-card">
                <h3>Blood Pressure</h3>
                <div className="health-card-content">
                  <div className={`health-indicator ${
                    healthData.bloodPressure.systolic < 120 && healthData.bloodPressure.diastolic < 80
                      ? 'green'
                      : healthData.bloodPressure.systolic < 130 && healthData.bloodPressure.diastolic < 80
                      ? 'yellow'
                      : 'red'
                  }`}>
                    <span>{healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}</span>
                  </div>
                  <div>
                    <p className="health-status">
                      {healthData.bloodPressure.systolic < 120 && healthData.bloodPressure.diastolic < 80
                        ? 'Normal'
                        : healthData.bloodPressure.systolic < 130 && healthData.bloodPressure.diastolic < 80
                        ? 'Elevated'
                        : 'High'}
                    </p>
                    <p className="health-details">
                      Heart Rate: {healthData.heartRate} bpm
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Activity Card */}
              <div className="health-card">
                <h3>Daily Activity</h3>
                <div className="health-card-content">
                  <div className={`health-indicator ${
                    (healthData.steps / 10000) * 100 >= 80 ? 'green' :
                    (healthData.steps / 10000) * 100 >= 50 ? 'yellow' : 'red'
                  }`}>
                    <span>{Math.round((healthData.steps / 10000) * 100)}%</span>
                  </div>
                  <div>
                    <p className="health-status">
                      Steps: {healthData.steps} / 10,000
                    </p>
                    <p className="health-details">
                      Calories: {healthData.calories.consumed} in, {healthData.calories.burned} out
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Sleep Card */}
              <div className="health-card">
                <h3>Sleep</h3>
                <div className="health-card-content">
                  <div className={`health-indicator ${
                    healthData.sleep.hours >= 7 ? 'green' :
                    healthData.sleep.hours >= 6 ? 'yellow' : 'red'
                  }`}>
                    <span>{healthData.sleep.hours}</span>
                  </div>
                  <div>
                    <p className="health-status">
                      {healthData.sleep.hours < 6
                        ? 'Insufficient'
                        : healthData.sleep.hours < 7
                        ? 'Borderline'
                        : 'Adequate'} Sleep
                    </p>
                    <p className="health-details">
                      Quality: {healthData.sleep.quality}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Hydration Card */}
              <div className="health-card">
                <h3>Hydration</h3>
                <div className="health-card-content">
                  <div className={`health-indicator ${
                    healthData.water.amount >= 2 ? 'green' :
                    healthData.water.amount >= 1.5 ? 'yellow' : 'red'
                  }`}>
                    <span>{healthData.water.amount}</span>
                  </div>
                  <div>
                    <p className="health-status">
                      {healthData.water.amount < 1.5
                        ? 'Low'
                        : healthData.water.amount < 2
                        ? 'Moderate'
                        : 'Good'} Hydration
                    </p>
                    <p className="health-details">
                      Water: {healthData.water.amount} {healthData.water.unit} / 2.5 {healthData.water.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Goals Summary */}
            <div className="goals-summary-card">
              <div className="goals-header">
                <h3>Current Goals</h3>
                <button className="view-all-button" onClick={() => setActiveTab('goals')}>View All</button>
              </div>
              
              <div className="goals-list">
                {goals.length > 0 ? (
                  goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className={`goal-item ${getGoalStatusClass(goal)}`}>
                      <div className="goal-icon">{getGoalIcon(goal.type)}</div>
                      <div className="goal-info">
                        <div className="goal-title">
                          {goal.type === 'weight' ? 'Reach' : 'Achieve'} {goal.target} {goal.unit}
                        </div>
                        <div className="goal-progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${getGoalProgress(goal)}%` }}
                          ></div>
                        </div>
                        <div className="goal-details">
                          Current: {goal.current} {goal.unit} | Target: {goal.target} {goal.unit}
                        </div>
                      </div>
                      <div className="goal-deadline">
                        By {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-goals">
                    <p>No goals set. Click "Set New Goal" to create your first health goal.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Health Tips */}
            <div className="health-tips-section">
              <h3>Health Tips</h3>
              <div className="tips-list">
                {healthTips.map((tipObj, index) => (
                  <div key={index} className="tip-card">
                    <div className="tip-category">
                      {tipObj.category.charAt(0).toUpperCase() + tipObj.category.slice(1)} Tip
                    </div>
                    <div className="tip-content">
                      {tipObj.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'add-entry' && (
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="weight">
                    Weight ({healthData.weight.unit})
                  </label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={newEntry.weight}
                    onChange={handleInputChange}
                    placeholder="Enter your weight"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bloodPressureSystolic">
                      Systolic (mmHg)
                    </label>
                    <input
                      id="bloodPressureSystolic"
                      name="bloodPressureSystolic"
                      type="number"
                      value={newEntry.bloodPressureSystolic}
                      onChange={handleInputChange}
                      placeholder="Systolic"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bloodPressureDiastolic">
                      Diastolic (mmHg)
                    </label>
                    <input
                      id="bloodPressureDiastolic"
                      name="bloodPressureDiastolic"
                      type="number"
                      value={newEntry.bloodPressureDiastolic}
                      onChange={handleInputChange}
                      placeholder="Diastolic"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="heartRate">
                    Heart Rate (bpm)
                  </label>
                  <input
                    id="heartRate"
                    name="heartRate"
                    type="number"
                    value={newEntry.heartRate}
                    onChange={handleInputChange}
                    placeholder="Enter your heart rate"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="steps">
                    Steps
                  </label>
                  <input
                    id="steps"
                    name="steps"
                    type="number"
                    value={newEntry.steps}
                    onChange={handleInputChange}
                    placeholder="Enter your steps"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="caloriesConsumed">
                    Calories Consumed
                  </label>
                  <input
                    id="caloriesConsumed"
                    name="caloriesConsumed"
                    type="number"
                    value={newEntry.caloriesConsumed}
                    onChange={handleInputChange}
                    placeholder="Enter calories consumed"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="caloriesBurned">
                    Calories Burned
                  </label>
                  <input
                    id="caloriesBurned"
                    name="caloriesBurned"
                    type="number"
                    value={newEntry.caloriesBurned}
                    onChange={handleInputChange}
                    placeholder="Enter calories burned"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sleepHours">
                    Sleep Duration (hours)
                  </label>
                  <input
                    id="sleepHours"
                    name="sleepHours"
                    type="number"
                    step="0.1"
                    value={newEntry.sleepHours}
                    onChange={handleInputChange}
                    placeholder="Enter hours of sleep"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sleepQuality">
                    Sleep Quality
                  </label>
                  <select
                    id="sleepQuality"
                    name="sleepQuality"
                    value={newEntry.sleepQuality}
                    onChange={handleInputChange}
                  >
                    <option value="Poor">Poor</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="waterAmount">
                    Water Intake ({healthData.water.unit})
                  </label>
                  <input
                    id="waterAmount"
                    name="waterAmount"
                    type="number"
                    step="0.1"
                    value={newEntry.waterAmount}
                    onChange={handleInputChange}
                    placeholder="Enter water intake"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  Save Entry
                </button>
                <button type="reset" className="secondary-button">
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'statistics' && (
          <div>
            <div className="metric-selector">
              <h3>Select Metric to View</h3>
              <div className="metric-buttons">
                <button 
                  className={selectedMetric === 'weight' ? 'active' : ''} 
                  onClick={() => setSelectedMetric('weight')}
                >
                  Weight
                </button>
                <button 
                  className={selectedMetric === 'steps' ? 'active' : ''} 
                  onClick={() => setSelectedMetric('steps')}
                >
                  Steps
                </button>
                <button 
                  className={selectedMetric === 'bloodPressure' ? 'active' : ''} 
                  onClick={() => setSelectedMetric('bloodPressure')}
                >
                  Blood Pressure
                </button>
                <button 
                  className={selectedMetric === 'sleep' ? 'active' : ''} 
                  onClick={() => setSelectedMetric('sleep')}
                >
                  Sleep
                </button>
              </div>
            </div>
            
            <div className="chart-container">
              {selectedMetric === 'weight' && (
                <div className="metric-chart">
                  <h3>Weight Trend (Last 7 Entries)</h3>
                  <div className="chart-box">
                    <div className="chart-placeholder">
                      <p>Weight chart visualization would appear here</p>
                      <p>Using Line chart to show weight over time</p>
                    </div>
                  </div>
                  <div className="metric-stats">
                    <div className="stat-item">
                      <div className="stat-label">Current</div>
                      <div className="stat-value">{healthData.weight.value} {healthData.weight.unit}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Average (7 days)</div>
                      <div className="stat-value">
                        {(healthHistory.weight.slice(-7).reduce((sum, item) => sum + item.value, 0) / 
                          Math.min(7, healthHistory.weight.length)).toFixed(1)} {healthData.weight.unit}
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Change</div>
                      <div className="stat-value">
                        {healthHistory.weight.length > 1 ? 
                          (healthData.weight.value - healthHistory.weight[healthHistory.weight.length - 2].value).toFixed(1) : 
                          '0'} {healthData.weight.unit}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedMetric === 'steps' && (
                <div className="metric-chart">
                  <h3>Steps Tracking (Last 7 Entries)</h3>
                  <div className="chart-box">
                    <div className="chart-placeholder">
                      <p>Steps chart visualization would appear here</p>
                      <p>Using Bar chart to show daily steps</p>
                    </div>
                  </div>
                  <div className="metric-stats">
                    <div className="stat-item">
                      <div className="stat-label">Today</div>
                      <div className="stat-value">{healthData.steps} steps</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Average (7 days)</div>
                      <div className="stat-value">
                        {Math.round(healthHistory.steps.slice(-7).reduce((sum, item) => sum + item.value, 0) / 
                          Math.min(7, healthHistory.steps.length))} steps
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Goal Progress</div>
                      <div className="stat-value">
                        {Math.round((healthData.steps / 10000) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedMetric === 'bloodPressure' && (
                <div className="metric-chart">
                  <h3>Blood Pressure (Last 7 Entries)</h3>
                  <div className="chart-box">
                    <div className="chart-placeholder">
                      <p>Blood pressure chart visualization would appear here</p>
                      <p>Using Line chart with two lines for systolic and diastolic</p>
                    </div>
                  </div>
                  <div className="metric-stats">
                    <div className="stat-item">
                      <div className="stat-label">Current</div>
                      <div className="stat-value">{healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic} mmHg</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Average (7 days)</div>
                      <div className="stat-value">
                        {Math.round(healthHistory.bloodPressure.slice(-7).reduce((sum, item) => sum + item.systolic, 0) / 
                          Math.min(7, healthHistory.bloodPressure.length))}/
                        {Math.round(healthHistory.bloodPressure.slice(-7).reduce((sum, item) => sum + item.diastolic, 0) / 
                          Math.min(7, healthHistory.bloodPressure.length))} mmHg
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Status</div>
                      <div className="stat-value">
                        {healthData.bloodPressure.systolic < 120 && healthData.bloodPressure.diastolic < 80
                          ? 'Normal'
                          : healthData.bloodPressure.systolic < 130 && healthData.bloodPressure.diastolic < 80
                          ? 'Elevated'
                          : 'High'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedMetric === 'sleep' && (
                <div className="metric-chart">
                  <h3>Sleep Duration (Last 7 Entries)</h3>
                  <div className="chart-box">
                    <div className="chart-placeholder">
                      <p>Sleep chart visualization would appear here</p>
                      <p>Using Bar chart to show sleep hours per night</p>
                    </div>
                  </div>
                  <div className="metric-stats">
                    <div className="stat-item">
                      <div className="stat-label">Last Entry</div>
                      <div className="stat-value">{healthData.sleep.hours} hours</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Average (7 days)</div>
                      <div className="stat-value">
                        {(healthHistory.sleep.slice(-7).reduce((sum, item) => sum + item.hours, 0) / 
                          Math.min(7, healthHistory.sleep.length)).toFixed(1)} hours
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Quality</div>
                      <div className="stat-value">{healthData.sleep.quality}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Summary stats */}
            <div className="summary-card">
              <h3>Weekly Summary</h3>
              
              <div className="summary-stats">
                <div className="summary-stat">
                  <p className="stat-name">Avg. Weight</p>
                  <p className="stat-value">
                    {(healthHistory.weight.slice(-7).reduce((sum, item) => sum + item.value, 0) / 
                      Math.min(7, healthHistory.weight.length)).toFixed(1)} {healthData.weight.unit}
                  </p>
                  <p className={`stat-change ${
                    healthData.weight.value < healthHistory.weight[Math.max(0, healthHistory.weight.length - 8)]?.value
                      ? 'decrease'
                      : 'increase'
                  }`}>
                    {healthHistory.weight.length > 7 
                      ? `${(healthData.weight.value - healthHistory.weight[Math.max(0, healthHistory.weight.length - 8)].value).toFixed(1)} ${healthData.weight.unit} from last week`
                      : 'No prior data for comparison'}
                  </p>
                </div>
                
                <div className="summary-stat">
                  <p className="stat-name">Avg. Steps</p>
                  <p className="stat-value">
                    {Math.round(healthHistory.steps.slice(-7).reduce((sum, item) => sum + item.value, 0) / 
                      Math.min(7, healthHistory.steps.length))}
                  </p>
                  <p className={`stat-change ${
                    healthData.steps > healthHistory.steps[Math.max(0, healthHistory.steps.length - 8)]?.value
                      ? 'increase'
                      : 'decrease'
                  }`}>
                    {healthHistory.steps.length > 7 
                      ? `${Math.abs(healthData.steps - healthHistory.steps[Math.max(0, healthHistory.steps.length - 8)].value)} from last week`
                      : 'No prior data for comparison'}
                  </p>
                </div>
                
                <div className="summary-stat">
                  <p className="stat-name">Avg. Sleep</p>
                  <p className="stat-value">
                    {(healthHistory.sleep.slice(-7).reduce((sum, item) => sum + item.hours, 0) / 
                      Math.min(7, healthHistory.sleep.length)).toFixed(1)} hours
                  </p>
                  <p className={`stat-change ${
                    healthData.sleep.hours > healthHistory.sleep[Math.max(0, healthHistory.sleep.length - 8)]?.hours
                      ? 'increase'
                      : 'decrease'
                  }`}>
                    {healthHistory.sleep.length > 7 
                      ? `${Math.abs(healthData.sleep.hours - healthHistory.sleep[Math.max(0, healthHistory.sleep.length - 8)].hours).toFixed(1)} hours from last week`
                      : 'No prior data for comparison'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div>
            <div className="goals-header-section">
              <h2>Health Goals</h2>
              <button className="add-goal-button" onClick={() => setGoalModalOpen(true)}>
                + Set New Goal
              </button>
            </div>
            
            {goals.length > 0 ? (
              <div className="goals-grid">
                {goals.map(goal => (
                  <div 
                    key={goal.id} 
                    className={`goal-card ${getGoalStatusClass(goal)}`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div className="goal-card-header">
                      <div className="goal-type-icon">{getGoalIcon(goal.type)}</div>
                      <div className="goal-status-tag">
                        {goal.status === 'achieved' ? 'Achieved' : 'In Progress'}
                      </div>
                    </div>
                    
                    <h3 className="goal-title">
                      {goal.type === 'weight' ? 'Reach' : 'Achieve'} {goal.target} {goal.unit}
                    </h3>
                    
                    <div className="goal-progress-section">
                      <div className="goal-progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getGoalProgress(goal)}%` }}
                        ></div>
                      </div>
                      <div className="goal-progress-text">
                        {getGoalProgress(goal)}% Complete
                      </div>
                    </div>
                    
                    <div className="goal-details-row">
                      <div className="goal-detail">
                        <span className="detail-label">Current:</span>
                        <span className="detail-value">{goal.current} {goal.unit}</span>
                      </div>
                      <div className="goal-detail">
                        <span className="detail-label">Target:</span>
                        <span className="detail-value">{goal.target} {goal.unit}</span>
                      </div>
                    </div>
                    
                    <div className="goal-deadline-section">
                      <span className="deadline-label">Deadline:</span>
                      <span className="deadline-date">{new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    
                    <button className="view-details-button">View Details</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-goals-message">
                <div className="empty-icon">🎯</div>
                <h3>No Health Goals Set</h3>
                <p>Set your first health goal to start tracking your progress</p>
                <button className="primary-button" onClick={() => setGoalModalOpen(true)}>
                  Set Your First Goal
                </button>
              </div>
            )}
            
            {/* Goal Tips */}
            <div className="goal-tips-section">
              <h3>Goal Setting Tips</h3>
              <div className="tips-container">
                <div className="goal-tip">
                  <h4>Be Specific</h4>
                  <p>Set clear, well-defined goals with specific numbers and timeframes.</p>
                </div>
                <div className="goal-tip">
                  <h4>Be Realistic</h4>
                  <p>Choose achievable goals that challenge you without being impossible.</p>
                </div>
                <div className="goal-tip">
                  <h4>Track Consistently</h4>
                  <p>Regular tracking keeps you accountable and shows your progress over time.</p>
                </div>
                <div className="goal-tip">
                  <h4>Be Patient</h4>
                  <p>Health changes take time. Focus on consistent progress rather than quick results.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Health Disclaimer */}
      <div className="health-disclaimer">
        <p><strong>Disclaimer:</strong> This health tracker is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
      </div>
    </div>
  );
}

export default HealthTracker;