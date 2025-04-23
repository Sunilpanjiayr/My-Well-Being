// src/components/features/challenges/DailyChallenges.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './DailyChallenges.css';

function DailyChallenges() {
  const { darkMode } = useTheme();
  const [completed, setCompleted] = useState([]);
  const [streakCount, setStreakCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCompletedChallenges, setShowCompletedChallenges] = useState(true);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // More comprehensive challenges organized by category
  const allChallenges = {
    physical: [
      { id: 1, text: 'Walk 10,000 steps', points: 20, difficulty: 'medium' },
      { id: 2, text: 'Complete a 30-minute workout', points: 30, difficulty: 'medium' },
      { id: 3, text: 'Take the stairs instead of elevator all day', points: 15, difficulty: 'easy' },
      { id: 4, text: 'Do 20 push-ups', points: 20, difficulty: 'medium' },
      { id: 5, text: 'Hold a plank for 1 minute', points: 25, difficulty: 'hard' }
    ],
    nutrition: [
      { id: 6, text: 'Drink 8 glasses of water', points: 15, difficulty: 'easy' },
      { id: 7, text: 'Eat 5 servings of fruits and vegetables', points: 25, difficulty: 'medium' },
      { id: 8, text: 'Avoid sugary drinks all day', points: 20, difficulty: 'medium' },
      { id: 9, text: 'Prepare a healthy home-cooked meal', points: 30, difficulty: 'hard' },
      { id: 10, text: 'Eat breakfast within an hour of waking up', points: 15, difficulty: 'easy' }
    ],
    wellness: [
      { id: 11, text: 'Sleep at least 7 hours', points: 25, difficulty: 'medium' },
      { id: 12, text: 'Do 15 minutes of meditation', points: 20, difficulty: 'medium' },
      { id: 13, text: 'Take a 15-minute break from screens every 2 hours', points: 15, difficulty: 'easy' },
      { id: 14, text: 'Practice deep breathing for 5 minutes', points: 10, difficulty: 'easy' },
      
    ],
    social: [
      { id: 15, text: 'Call a friend or family member', points: 15, difficulty: 'easy' },
      { id: 16, text: 'Compliment someone today', points: 10, difficulty: 'easy' },
      { id: 17, text: 'Help someone with a task', points: 20, difficulty: 'medium' },
      { id: 18, text: 'Join a health-related community or group', points: 25, difficulty: 'medium' },
      { id: 19, text: 'Share a healthy recipe with someone', points: 15, difficulty: 'easy' }
    ]
  };

  // Function to filter challenges based on selected category
  const getFilteredChallenges = () => {
    if (selectedCategory === 'all') {
      const allChallengesList = [
        ...allChallenges.physical,
        ...allChallenges.nutrition,
        ...allChallenges.wellness,
        ...allChallenges.social
      ];
      return showCompletedChallenges 
        ? allChallengesList 
        : allChallengesList.filter(challenge => !completed.includes(challenge.id));
    }
    
    return showCompletedChallenges 
      ? allChallenges[selectedCategory] 
      : allChallenges[selectedCategory].filter(challenge => !completed.includes(challenge.id));
  };

  // Simulate loading saved data
  useEffect(() => {
    // In a real app, you would fetch this data from an API or local storage
    const savedCompleted = JSON.parse(localStorage.getItem('completedChallenges')) || [];
    const savedStreak = JSON.parse(localStorage.getItem('challengeStreak')) || 0;
    const savedPoints = JSON.parse(localStorage.getItem('challengePoints')) || 0;
    
    setCompleted(savedCompleted);
    setStreakCount(savedStreak);
    setPointsEarned(savedPoints);
  }, []);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem('completedChallenges', JSON.stringify(completed));
    localStorage.setItem('challengeStreak', JSON.stringify(streakCount));
    localStorage.setItem('challengePoints', JSON.stringify(pointsEarned));
  }, [completed, streakCount, pointsEarned]);

  const toggleComplete = (challengeId, points) => {
    setCompleted(prev => {
      if (prev.includes(challengeId)) {
        // If challenge was completed and now being uncompleted, remove points
        setPointsEarned(current => current - points);
        return prev.filter(id => id !== challengeId);
      } else {
        // If challenge is being completed, add points and show confetti
        setPointsEarned(current => current + points);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        return [...prev, challengeId];
      }
    });
  };

  // Function to reset daily challenges
  const resetChallenges = () => {
    if (window.confirm('Are you sure you want to reset all challenges? This will clear your completed challenges but keep your streak and points.')) {
      setCompleted([]);
      // If they had completed at least 3 challenges today, increase streak
      if (completed.length >= 3) {
        setStreakCount(prev => prev + 1);
      }
    }
  };

  // Function to get challenge difficulty class
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  const filteredChallenges = getFilteredChallenges();

  return (
    <div className={`feature-container ${darkMode ? 'dark-mode' : ''}`}>
      {showConfetti && <div className="confetti-container">🎉</div>}
      
      <div className="challenge-header">
        <h1>Daily Health Challenges</h1>
        <div className="challenge-stats">
          <div className="stat">
            <span className="stat-value">{streakCount}</span>
            <span className="stat-label">Day Streak</span>
          </div>
          <div className="stat">
            <span className="stat-value">{pointsEarned}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat">
            <span className="stat-value">{completed.length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>
      
      <div className="challenge-filters">
        <div className="category-filters">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          <button 
            className={selectedCategory === 'physical' ? 'active' : ''} 
            onClick={() => setSelectedCategory('physical')}
          >
            Physical
          </button>
          <button 
            className={selectedCategory === 'nutrition' ? 'active' : ''} 
            onClick={() => setSelectedCategory('nutrition')}
          >
            Nutrition
          </button>
          <button 
            className={selectedCategory === 'wellness' ? 'active' : ''} 
            onClick={() => setSelectedCategory('wellness')}
          >
            Wellness
          </button>
          <button 
            className={selectedCategory === 'social' ? 'active' : ''} 
            onClick={() => setSelectedCategory('social')}
          >
            Social
          </button>
        </div>
        
        <div className="display-options">
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={showCompletedChallenges} 
              onChange={() => setShowCompletedChallenges(!showCompletedChallenges)} 
            />
            Show Completed
          </label>
          <button className="reset-button" onClick={resetChallenges}>
            Reset Daily Challenges
          </button>
        </div>
      </div>
      
      <div className="challenges-list">
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge) => (
            <div 
              key={challenge.id}
              onClick={() => toggleComplete(challenge.id, challenge.points)}
              className={`challenge-item ${completed.includes(challenge.id) ? 'completed' : ''} ${getDifficultyClass(challenge.difficulty)}`}
            >
              <div className="challenge-content">
                <span className="challenge-icon">🔹</span>
                <span className="challenge-text">{challenge.text}</span>
              </div>
              <div className="challenge-meta">
                <span className="challenge-points">{challenge.points} pts</span>
                {completed.includes(challenge.id) && <span className="check-icon">✓</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="no-challenges">
            <p>No challenges available in this category. {!showCompletedChallenges && 'All challenges completed!'}</p>
          </div>
        )}
      </div>
      
      <div className="challenge-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min((completed.length / 15) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completed.length}/15 challenges completed
          {completed.length >= 15 && " - Congratulations! You've completed all challenges for today!"}
        </div>
      </div>
      
      <div className="challenge-rewards">
        <h3>Rewards Unlocked</h3>
        <div className="rewards-list">
          <div className={`reward-item ${pointsEarned >= 50 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">🥉</span>
            <span>Bronze Badge (50 points)</span>
          </div>
          <div className={`reward-item ${pointsEarned >= 100 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">🥈</span>
            <span>Silver Badge (100 points)</span>
          </div>
          <div className={`reward-item ${pointsEarned >= 200 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">🥇</span>
            <span>Gold Badge (200 points)</span>
          </div>
          <div className={`reward-item ${streakCount >= 7 ? 'unlocked' : 'locked'}`}>
            <span className="reward-icon">🔥</span>
            <span>Weekly Warrior (7 day streak)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyChallenges;