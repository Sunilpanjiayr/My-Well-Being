// src/components/features/exercise/ExerciseRoutines.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './ExerciseRoutines.css';

function ExerciseRoutines() {
  const { darkMode } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [workoutMinutes, setWorkoutMinutes] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  // Exercise categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'strength', name: 'Strength Training' },
    { id: 'flexibility', name: 'Flexibility' },
    { id: 'balance', name: 'Balance & Stability' },
    { id: 'hiit', name: 'HIIT' }
  ];

  // Days of the week
  const daysOfWeek = [
    { id: 1, name: 'Monday', shortName: 'Mon' },
    { id: 2, name: 'Tuesday', shortName: 'Tue' },
    { id: 3, name: 'Wednesday', shortName: 'Wed' },
    { id: 4, name: 'Thursday', shortName: 'Thu' },
    { id: 5, name: 'Friday', shortName: 'Fri' },
    { id: 6, name: 'Saturday', shortName: 'Sat' },
    { id: 0, name: 'Sunday', shortName: 'Sun' }
  ];

  // Comprehensive exercise database
  const exercises = {
    cardio: [
      {
        id: 'c1',
        name: 'Jumping Jacks',
        description: 'A classic cardiovascular exercise that works your entire body.',
        instructions: [
          'Stand upright with your legs together and arms at your sides.',
          'Jump up, spreading your legs and bringing your arms above your head.',
          'Jump again, returning to the starting position.',
          'Repeat at a quick pace for the designated time.'
        ],
        difficulty: { beginner: '1 minute', intermediate: '2 minutes', advanced: '3 minutes' },
        caloriesPerMinute: 10,
        muscleGroups: ['Full Body'],
        category: 'cardio',
        image: '🏃'
      },
      {
        id: 'c2',
        name: 'Mountain Climbers',
        description: 'A dynamic exercise that builds cardiovascular endurance and core strength.',
        instructions: [
          'Start in a plank position with arms straight.',
          'Bring your right knee toward your chest.',
          'Switch legs, bringing the left knee in and the right leg back.',
          'Continue alternating legs at a quick pace.'
        ],
        difficulty: { beginner: '30 seconds', intermediate: '45 seconds', advanced: '60 seconds' },
        caloriesPerMinute: 12,
        muscleGroups: ['Core', 'Shoulders', 'Legs'],
        category: 'cardio',
        image: '⛰️'
      },
      {
        id: 'c3',
        name: 'High Knees',
        description: 'A running in place exercise that elevates heart rate and works your legs.',
        instructions: [
          'Stand in place with feet hip-width apart.',
          'Run in place, lifting knees as high as possible (ideally to hip level).',
          'Pump your arms for additional intensity.',
          'Maintain a quick pace throughout.'
        ],
        difficulty: { beginner: '30 seconds', intermediate: '45 seconds', advanced: '60 seconds' },
        caloriesPerMinute: 13,
        muscleGroups: ['Legs', 'Core'],
        category: 'cardio',
        image: '🦵'
      }
    ],
    strength: [
      {
        id: 's1',
        name: 'Push-ups',
        description: 'A fundamental exercise that targets chest, shoulders, and triceps.',
        instructions: [
          'Start in a plank position with hands slightly wider than shoulder-width.',
          'Keep your body in a straight line from head to heels.',
          'Lower your body until your chest nearly touches the floor.',
          'Push back up to the starting position.'
        ],
        difficulty: { beginner: '5 reps', intermediate: '10 reps', advanced: '20 reps' },
        caloriesPerMinute: 8,
        muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
        category: 'strength',
        image: '💪'
      },
      {
        id: 's2',
        name: 'Squats',
        description: 'A lower body compound exercise that primarily targets the quadriceps, hamstrings, and glutes.',
        instructions: [
          'Stand with feet shoulder-width apart.',
          'Bend your knees and hips to lower your body as if sitting in a chair.',
          'Keep your chest up and knees tracking over (not beyond) toes.',
          'Return to starting position by pushing through your heels.'
        ],
        difficulty: { beginner: '10 reps', intermediate: '15 reps', advanced: '25 reps' },
        caloriesPerMinute: 8,
        muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
        category: 'strength',
        image: '🏋️'
      },
      {
        id: 's3',
        name: 'Plank',
        description: 'An isometric core exercise that also engages shoulders, arms, and glutes.',
        instructions: [
          'Start in a push-up position, then bend your elbows 90° and rest your weight on your forearms.',
          'Keep your body in a straight line from head to heels.',
          'Engage your core and hold the position.',
          'Breathe normally throughout.'
        ],
        difficulty: { beginner: '30 seconds', intermediate: '60 seconds', advanced: '90 seconds' },
        caloriesPerMinute: 5,
        muscleGroups: ['Core', 'Shoulders', 'Arms', 'Glutes'],
        category: 'strength',
        image: '🧘'
      }
    ],
    flexibility: [
      {
        id: 'f1',
        name: 'Standing Hamstring Stretch',
        description: 'A stretch that improves flexibility in the back of your legs.',
        instructions: [
          'Stand tall with one foot slightly in front of the other.',
          'Bend the back leg slightly and straighten the front leg.',
          'Hinge at the hips to lean forward slightly until you feel a stretch in your front legs hamstring.',
          'Hold the position, then switch legs.'
        ],
        difficulty: { beginner: '15 seconds each leg', intermediate: '30 seconds each leg', advanced: '45 seconds each leg' },
        caloriesPerMinute: 2,
        muscleGroups: ['Hamstrings', 'Lower Back'],
        category: 'flexibility',
        image: '🧘‍♀️'
      },
      {
        id: 'f2',
        name: 'Butterfly Stretch',
        description: 'A seated stretch that targets your inner thighs and hips.',
        instructions: [
          'Sit on the floor with your back straight.',
          'Bring the soles of your feet together, letting your knees fall outward.',
          'Hold your feet with your hands and gently press your knees toward the floor.',
          'Hold the position, breathing deeply.'
        ],
        difficulty: { beginner: '30 seconds', intermediate: '45 seconds', advanced: '60 seconds' },
        caloriesPerMinute: 1,
        muscleGroups: ['Groin', 'Hip Flexors'],
        category: 'flexibility',
        image: '🦋'
      }
    ],
    balance: [
      {
        id: 'b1',
        name: 'Single Leg Stand',
        description: 'A simple balance exercise that strengthens ankle and knee stability.',
        instructions: [
          'Stand tall with feet together.',
          'Shift your weight to one foot and lift the other foot off the ground.',
          'Hold the position, focusing on a fixed point ahead for better balance.',
          'Lower your foot and repeat on the other side.'
        ],
        difficulty: { beginner: '15 seconds each leg', intermediate: '30 seconds each leg', advanced: '45 seconds each leg' },
        caloriesPerMinute: 3,
        muscleGroups: ['Ankles', 'Calves', 'Core'],
        category: 'balance',
        image: '🧍'
      }
    ],
    hiit: [
      {
        id: 'h1',
        name: 'Burpees',
        description: 'A full-body exercise that combines a squat, push-up, and jump.',
        instructions: [
          'Start standing, then squat down and place hands on the floor.',
          'Jump feet back into a plank position.',
          'Perform a push-up (optional for beginners).',
          'Jump feet forward to return to squat position, then explosively jump up with arms overhead.'
        ],
        difficulty: { beginner: '5 reps', intermediate: '10 reps', advanced: '15 reps' },
        caloriesPerMinute: 15,
        muscleGroups: ['Full Body'],
        category: 'hiit',
        image: '💥'
      }
    ]
  };

  // Predefined workout plans for each level and day
  const   workoutPlans = {
    beginner: {
      0: [exercises.cardio[0], exercises.strength[0], exercises.flexibility[0]], // Sunday - rest day with light stretching
      1: [exercises.cardio[0], exercises.strength[0], exercises.strength[1]], // Monday
      2: [exercises.cardio[1], exercises.flexibility[0], exercises.flexibility[1]], // Tuesday
      3: [exercises.strength[0], exercises.strength[1], exercises.strength[2]], // Wednesday
      4: [exercises.cardio[2], exercises.balance[0], exercises.flexibility[1]], // Thursday
      5: [exercises.strength[0], exercises.strength[1], exercises.cardio[0]], // Friday
      6: [exercises.cardio[0], exercises.cardio[1], exercises.flexibility[0]], // Saturday
    },
    intermediate: {
      0: [exercises.cardio[0], exercises.strength[0], exercises.flexibility[0]], // Sunday
      1: [exercises.cardio[0], exercises.strength[0], exercises.strength[1], exercises.strength[2]], // Monday
      2: [exercises.cardio[1], exercises.cardio[2], exercises.hiit[0], exercises.flexibility[0]], // Tuesday
      3: [exercises.strength[0], exercises.strength[1], exercises.strength[2], exercises.balance[0]], // Wednesday
      4: [exercises.hiit[0], exercises.cardio[2], exercises.balance[0], exercises.flexibility[1]], // Thursday
      5: [exercises.strength[0], exercises.strength[1], exercises.strength[2], exercises.cardio[0]], // Friday
      6: [exercises.cardio[0], exercises.cardio[1], exercises.cardio[2], exercises.hiit[0]], // Saturday
    },
    advanced: {
      0: [exercises.cardio[1], exercises.strength[0], exercises.flexibility[0], exercises.balance[0]], // Sunday
      1: [exercises.hiit[0], exercises.strength[0], exercises.strength[1], exercises.strength[2]], // Monday
      2: [exercises.cardio[2], exercises.cardio[1], exercises.hiit[0], exercises.flexibility[0]], // Tuesday
      3: [exercises.strength[0], exercises.strength[1], exercises.strength[2], exercises.hiit[0]], // Wednesday
      4: [exercises.hiit[0], exercises.cardio[2], exercises.balance[0], exercises.flexibility[1]], // Thursday
      5: [exercises.strength[0], exercises.strength[1], exercises.strength[2], exercises.hiit[0]], // Friday
      6: [exercises.cardio[0], exercises.cardio[1], exercises.cardio[2], exercises.hiit[0]], // Saturday
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('exerciseLevel') || 'beginner';
    const savedCompleted = JSON.parse(localStorage.getItem('completedExercises')) || [];
    const savedCalories = parseInt(localStorage.getItem('caloriesBurned')) || 0;
    const savedMinutes = parseInt(localStorage.getItem('workoutMinutes')) || 0;
    
    setSelectedLevel(savedLevel);
    setCompletedExercises(savedCompleted);
    setCaloriesBurned(savedCalories);
    setWorkoutMinutes(savedMinutes);
  }, []);

  // Save data when changes occur
  useEffect(() => {
    localStorage.setItem('exerciseLevel', selectedLevel);
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    localStorage.setItem('caloriesBurned', caloriesBurned.toString());
    localStorage.setItem('workoutMinutes', workoutMinutes.toString());
  }, [selectedLevel, completedExercises, caloriesBurned, workoutMinutes]);

  // Update workout plan when level or day changes
  useEffect(() => {
    const plan = workoutPlans[selectedLevel][selectedDay];
    if (selectedCategory === 'all') {
      setWorkoutPlan(plan);
    } else {
      setWorkoutPlan(plan.filter(exercise => exercise.category === selectedCategory));
    }
  }, [selectedLevel, selectedDay, selectedCategory]);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!timerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Handle exercise completion
  const toggleExerciseCompletion = (exerciseId) => {
    setCompletedExercises(prev => {
      // If already completed, remove it
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } 
      // Otherwise, add it and calculate calories/minutes
      else {
        const exercise = Object.values(exercises)
          .flat()
          .find(ex => ex.id === exerciseId);
          
        if (exercise) {
          // Parse difficulty to estimate time
          let timeInMinutes = 0;
          const difficultyValue = exercise.difficulty[selectedLevel];
          
          if (difficultyValue.includes('minute')) {
            timeInMinutes = parseInt(difficultyValue.split(' ')[0]);
          } else if (difficultyValue.includes('second')) {
            timeInMinutes = parseInt(difficultyValue.split(' ')[0]) / 60;
          } else {
            // Assume reps - estimate 1 minute for every 15 reps
            const reps = parseInt(difficultyValue.split(' ')[0]);
            timeInMinutes = reps / 15;
          }
          
          // Calculate and update calories
          const caloriesBurnedForExercise = Math.round(timeInMinutes * (exercise.caloriesPerMinute || 5));
          setCaloriesBurned(prev => prev + caloriesBurnedForExercise);
          
          // Update workout minutes
          setWorkoutMinutes(prev => prev + timeInMinutes);
        }
        
        return [...prev, exerciseId];
      }
    });
  };

  // Format time for the timer display
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset timer
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    const totalExercises = workoutPlan.length;
    if (totalExercises === 0) return 0;
    
    const completedCount = workoutPlan.filter(exercise => 
      completedExercises.includes(exercise.id)
    ).length;
    
    return Math.round((completedCount / totalExercises) * 100);
  };

  return (
    <div className={`feature-container exercise-routines ${darkMode ? 'dark-mode' : ''}`}>
      {showTimer && (
        <div className="exercise-timer">
          <div className="timer-display">{formatTime(timerSeconds)}</div>
          <div className="timer-controls">
            <button 
              className={timerRunning ? 'pause-button' : 'start-button'} 
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button className="reset-button" onClick={resetTimer}>Reset</button>
            <button className="close-timer-button" onClick={() => setShowTimer(false)}>Close</button>
          </div>
        </div>
      )}
      
      <div className="exercise-header">
        <h1>Exercise Routines</h1>
        
        <div className="workout-stats">
          <div className="stat-card">
            <div className="stat-icon calories">🔥</div>
            <div className="stat-content">
              <div className="stat-label">Calories Burned</div>
              <div className="stat-value">{caloriesBurned}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon time">⏱️</div>
            <div className="stat-content">
              <div className="stat-label">Workout Time</div>
              <div className="stat-value">{Math.round(workoutMinutes)} min</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon exercises">🏋️</div>
            <div className="stat-content">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completedExercises.length}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="exercise-controls">
        <div className="difficulty-selector">
          <h3>Difficulty Level</h3>
          <div className="level-buttons">
            <button 
              className={selectedLevel === 'beginner' ? 'active' : ''} 
              onClick={() => setSelectedLevel('beginner')}
            >
              Beginner
            </button>
            <button 
              className={selectedLevel === 'intermediate' ? 'active' : ''} 
              onClick={() => setSelectedLevel('intermediate')}
            >
              Intermediate
            </button>
            <button 
              className={selectedLevel === 'advanced' ? 'active' : ''} 
              onClick={() => setSelectedLevel('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
        
        <div className="category-filter">
          <h3>Filter by Category</h3>
          <div className="category-buttons">
            {categories.map(category => (
              <button 
                key={category.id}
                className={selectedCategory === category.id ? 'active' : ''} 
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="view-controls">
        <button 
          className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
        <button 
          className={`view-button ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          Weekly Plan
        </button>
        <button className="timer-button" onClick={() => setShowTimer(true)}>
          Open Timer
        </button>
      </div>
      
      {viewMode === 'calendar' && (
        <div className="weekly-calendar">
          <h3>Weekly Workout Plan</h3>
          <div className="days-of-week">
            {daysOfWeek.map(day => (
              <button 
                key={day.id}
                className={selectedDay === day.id ? 'active' : ''}
                onClick={() => setSelectedDay(day.id)}
              >
                <span className="day-name">{day.name}</span>
                <span className="day-short">{day.shortName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="completion-progress">
        <div className="progress-text">Today's Progress: {calculateCompletion()}%</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${calculateCompletion()}%` }}
          ></div>
        </div>
      </div>
      
      <div className="workout-plan">
        <h3>
          {viewMode === 'calendar' 
            ? `${daysOfWeek.find(day => day.id === selectedDay)?.name}'s Workout` 
            : "Today's Workout"}
        </h3>
        
        {workoutPlan.length > 0 ? (
          <div className="exercise-list">
            {workoutPlan.map(exercise => (
              <div 
                key={exercise.id}
                className={`exercise-item ${completedExercises.includes(exercise.id) ? 'completed' : ''}`}
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="exercise-icon">{exercise.image}</div>
                <div className="exercise-content">
                  <h4 className="exercise-name">{exercise.name}</h4>
                  <p className="exercise-description">{exercise.description}</p>
                  <div className="exercise-meta">
                    <span className="exercise-category">{categories.find(c => c.id === exercise.category)?.name}</span>
                    <span className="exercise-difficulty">{exercise.difficulty[selectedLevel]}</span>
                  </div>
                </div>
                <button 
                  className="complete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExerciseCompletion(exercise.id);
                  }}
                >
                  {completedExercises.includes(exercise.id) ? '✓' : 'Mark Complete'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-exercises">
            <p>No exercises found for the selected category. Try selecting a different category or day.</p>
          </div>
        )}
      </div>
      
      {selectedExercise && (
        <div className="exercise-details-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setSelectedExercise(null)}>×</button>
            
            <div className="exercise-details-header">
              <div className="details-icon">{selectedExercise.image}</div>
              <h3>{selectedExercise.name}</h3>
            </div>
            
            <div className="exercise-details-body">
              <p className="details-description">{selectedExercise.description}</p>
              
              <div className="details-meta">
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">{categories.find(c => c.id === selectedExercise.category)?.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Difficulty:</span>
                  <span className="meta-value">{selectedExercise.difficulty[selectedLevel]}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Calories:</span>
                  <span className="meta-value">~{selectedExercise.caloriesPerMinute} cal/min</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Target Muscles:</span>
                  <span className="meta-value">{selectedExercise.muscleGroups.join(', ')}</span>
                </div>
              </div>
              
              <div className="exercise-instructions">
                <h4>Instructions</h4>
                <ol>
                  {selectedExercise.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="start-exercise-button"
                  onClick={() => {
                    setShowTimer(true);
                    setSelectedExercise(null);
                  }}
                >
                  Start Timer
                </button>
                <button 
                  className={`complete-exercise-button ${completedExercises.includes(selectedExercise.id) ? 'completed' : ''}`}
                  onClick={() => toggleExerciseCompletion(selectedExercise.id)}
                >
                  {completedExercises.includes(selectedExercise.id) ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseRoutines;