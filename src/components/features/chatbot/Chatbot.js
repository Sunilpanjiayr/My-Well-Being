import './Chatbot.css';
// src/components/features/chatbot/ProfessionalChatbot.js
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './Chatbot.css';

// SVG Icon Components for better aesthetics
const Icons = {
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clear: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21M5 6V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Assistant: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Water: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L6 11C4.34 13.33 4.8 16.88 7.5 18.5C8.21 18.96 9.05 19.19 9.9 19.19C10.75 19.19 11.59 18.96 12.3 18.5C14.99 16.89 15.46 13.33 13.8 11L12 2Z" stroke="#4299e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#ebf8ff"/>
    </svg>
  ),
  Heart: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3336 4.1017 19.7372 3.69545 19.0871 3.4188C18.437 3.14215 17.7439 3 17.0423 3C16.3407 3 15.6476 3.14215 14.9975 3.4188C14.3474 3.69545 13.751 4.1017 13.2447 4.61L12.0001 5.86L10.7554 4.61C9.7307 3.58107 8.3444 3.00001 6.9578 3.00001C5.5712 3.00001 4.1849 3.58107 3.1602 4.61C2.1355 5.63894 1.5579 7.03332 1.5579 8.42C1.5579 9.80667 2.1355 11.2011 3.1602 12.23L4.4049 13.48L12.0001 21.09L19.5953 13.48L20.84 12.23C21.3483 11.7237 21.7545 11.1272 22.0312 10.4771C22.3078 9.82698 22.45 9.1339 22.45 8.43225C22.45 7.7306 22.3078 7.03752 22.0312 6.38743C21.7545 5.73734 21.3483 5.14086 20.84 4.63452V4.61Z" stroke="#f56565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fed7d7"/>
    </svg>
  ),
  Sleep: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 4C19.0503 5.5643 20.2751 7.95367 20.2751 10.5455C20.2751 15.7392 16.0728 20 10.95 20C7.5433 20 4.54228 18.2875 2.75 15.6275C4.04079 16.9555 5.8308 17.7893 7.82278 17.7893C12.237 17.7893 15.818 14.1699 15.818 9.70654C15.818 7.69452 14.9904 5.66556 14.9904 5.66556C14.9904 5.66556 16.0385 4.83367 17 4Z" stroke="#805ad5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#e9d8fd"/>
    </svg>
  ),
  Steps: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 5.5C19 6.88071 17.8807 8 16.5 8C15.1193 8 14 6.88071 14 5.5C14 4.11929 15.1193 3 16.5 3C17.8807 3 19 4.11929 19 5.5Z" stroke="#38a169" strokeWidth="2" fill="#c6f6d5"/>
      <path d="M10 19C10 20.1046 9.10457 21 8 21C6.89543 21 6 20.1046 6 19C6 17.8954 6.89543 17 8 17C9.10457 17 10 17.8954 10 19Z" stroke="#38a169" strokeWidth="2" fill="#c6f6d5"/>
      <path d="M17.39 17.72L15.5 15L9.5 10C8.73 10.9 7.59 11.5 6.31 11.5C6.2 11.5 6.1 11.49 6 11.48V21H8V17.19C8.53 17.07 9 16.6 9 16C9 15.4 8.53 14.93 8 14.81V13.2C9.41 12.73 10.23 11.32 9.88 9.88C9.59 8.73 8.63 7.89 7.5 7.74V6.43C8.4 5.5 8.11 5 6.85 5C5.11 5 5.5 6.11 5.5 6.43V7.74C4.36 7.89 3.4 8.73 3.12 9.88C2.77 11.31 3.58 12.72 5 13.19V21H3V11.49C2.89 11.5 2.79 11.5 2.69 11.5C1.43 11.5 0.3 10.93 0.54 10C0.7 9.37 1.13 8.87 1.69 8.63L11.5 5C12.31 4.67 12.38 4.62 13 5.5L17.39 17.72Z" stroke="#38a169" strokeWidth="2" fill="#c6f6d5"/>
    </svg>
  )
};

function ProfessionalChatbot() {
  // State management with enhanced defaults
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(1);
  const [userName, setUserName] = useState('');
  
  // User health data - would be fetched from your backend in a real app
  const [userHealth, setUserHealth] = useState({
    profile: {
      name: '',
      age: 32,
      height: 175, // cm
      weight: 70, // kg
      bmi: 22.9,
      conditions: ['Mild hypertension'],
      allergies: ['Pollen'],
      lastCheckup: '2023-11-15'
    },
    metrics: {
      steps: 7842,
      stepsGoal: 10000,
      heartRate: 72,
      bloodPressure: { systolic: 128, diastolic: 82, timestamp: '2023-12-01 08:30' },
      sleepHours: 6.5,
      sleepGoal: 8,
      waterIntake: 1.6,
      waterGoal: 2.5,
      medications: [
        { name: 'Vitamin D', dosage: '1000 IU', nextDose: '20:00', schedule: 'Daily' },
        { name: 'Loratadine', dosage: '10mg', nextDose: '08:00', schedule: 'As needed' }
      ],
      appointments: [
        { doctor: 'Dr. Williams', specialty: 'Primary Care', date: '2024-01-15', time: '14:30' }
      ]
    },
    goals: {
      active: [
        { type: 'Steps', target: '10,000 daily', progress: 78 },
        { type: 'Sleep', target: '8 hours nightly', progress: 81 },
        { type: 'Water', target: '2.5L daily', progress: 64 }
      ]
    },
    recentActivity: [
      { type: 'Water', description: 'Logged 300ml water intake', timestamp: '10:45' },
      { type: 'Steps', description: 'Completed 2,500 steps', timestamp: '09:30' },
      { type: 'Medication', description: 'Took Vitamin D', timestamp: 'Yesterday, 20:00' }
    ]
  });

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { darkMode } = useTheme();
  
  // Initialize the chat with a welcome message and user info
  useEffect(() => {
    // Fetch user data from your backend
    // This is a placeholder - in a real app, you would make an API call
    const fetchUserData = async () => {
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // In a real app: const userData = await api.getUserProfile();
        const userData = {
          name: 'Sunil',
          // other user data
        };
        
        setUserName(userData.name);
        setUserHealth(prevState => ({
          ...prevState,
          profile: {
            ...prevState.profile,
            name: userData.name
          }
        }));
        
        // Set personalized welcome message
        const currentHour = new Date().getHours();
        let greeting = "Hello";
        
        if (currentHour < 12) {
          greeting = "Good morning";
        } else if (currentHour < 18) {
          greeting = "Good afternoon";
        } else {
          greeting = "Good evening";
        }
        
        setMessages([{ 
          text: `${greeting}, ${userData.name}. I'm your personal health assistant. How may I assist you today?`, 
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        
        // Set personalized suggested queries
        updateSuggestedQueriesForUser(userData.name);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback welcome message
        setMessages([{ 
          text: "Welcome to My Well Being. I'm your personal health assistant. How may I help you today?", 
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };
    
    fetchUserData();
  }, []);

  // Comprehensive health knowledge base
  const healthKnowledgeBase = {
    // General Health
    generalHealth: {
      "bmi calculation": "Your current BMI is {userHealth.profile.bmi}, which is within the normal range (18.5-24.9). BMI is calculated using your height and weight and provides a general indicator of body composition. Would you like me to explain what this means for your health?",
      
      "blood pressure reading": "Your most recent blood pressure reading was {userHealth.metrics.bloodPressure.systolic}/{userHealth.metrics.bloodPressure.diastolic} mmHg on {userHealth.metrics.bloodPressure.timestamp}. This falls into the category of elevated blood pressure. Regular monitoring and lifestyle modifications can help manage this. Would you like some evidence-based strategies for blood pressure management?",
      
      "checkup schedule": "According to your records, your last checkup was on {userHealth.profile.lastCheckup}. For adults with mild hypertension, it's recommended to have checkups every 3-6 months. Your next appointment is scheduled with Dr. Williams on {userHealth.metrics.appointments[0].date}. Would you like me to set a reminder?",
      
      "improve immune system": "To strengthen your immune system, focus on: adequate sleep (7-9 hours nightly), regular physical activity, a diet rich in fruits and vegetables, stress management, and proper hydration. Would you like personalized recommendations based on your current health data?",
      
      "recommended screenings": "Based on your profile, recommended screenings include: annual blood pressure monitoring, cholesterol check every 4-5 years, and blood glucose testing every 3 years. Your records indicate you're due for a cholesterol screening. Would you like information on preparing for this test?"
    },
    
    // Nutrition & Hydration
    nutrition: {
      "daily water intake": "Your water intake today is {userHealth.metrics.waterIntake}L, which is {Math.round(userHealth.metrics.waterIntake/userHealth.metrics.waterGoal*100)}% of your 2.5L daily goal. Proper hydration supports cognitive function, joint health, temperature regulation, and toxin elimination. Would you like to log additional water intake?",
      
      "dietary recommendations hypertension": "For managing mild hypertension, clinical guidelines recommend the DASH diet (Dietary Approaches to Stop Hypertension): rich in fruits, vegetables, whole grains, and low-fat dairy, while limiting sodium, saturated fats, and added sugars. Would you like a sample DASH meal plan?",
      
      "protein requirements": "Based on your profile, your daily protein requirement is approximately 56g per day (0.8g per kg of body weight). This supports muscle maintenance, enzyme production, and immune function. Would you like high-quality protein source recommendations?",
      
      "balanced meal components": "A nutritionally balanced meal includes: lean protein (25% of plate), complex carbohydrates (25% of plate), and vegetables/fruits (50% of plate), plus a small amount of healthy fats. Would you like specific meal suggestions based on these proportions?",
      
      "anti-inflammatory foods": "Anti-inflammatory foods that may benefit your mild hypertension include: fatty fish rich in omega-3s, berries, leafy greens, nuts, olive oil, and turmeric. Would you like to learn about incorporating these into your meal planning?"
    },
    
    // Physical Activity
    activity: {
      "step count": "You've taken {userHealth.metrics.steps.toLocaleString()} steps today, which is {Math.round(userHealth.metrics.steps/userHealth.metrics.stepsGoal*100)}% of your daily goal. Regular walking improves cardiovascular health, supports weight management, and can help regulate blood pressure. Would you like to set a walking reminder?",
      
      "exercise recommendations hypertension": "For mild hypertension, the American College of Cardiology recommends 150 minutes of moderate-intensity aerobic activity weekly, plus resistance training twice weekly. Activities like brisk walking, swimming, and cycling are particularly beneficial. Would you like a personalized exercise plan?",
      
      "optimal exercise intensity": "For your profile, moderate-intensity exercise is recommended, where you can talk but not sing during activity. This typically corresponds to 50-70% of your maximum heart rate, or around 95-120 beats per minute for you. Would you like guidance on measuring exercise intensity?",
      
      "strength training benefits": "Regular strength training increases muscle mass, improves metabolic rate, enhances bone density, and supports better glucose metabolism. For your health profile, 2-3 sessions weekly focusing on major muscle groups is optimal. Would you like beginner-friendly strength exercises?",
      
      "exercise recovery": "Proper recovery between exercise sessions is essential for your health profile. Key components include: adequate hydration, protein intake within 30 minutes post-exercise, quality sleep, and alternating muscle groups. Would you like recommendations for post-exercise nutrition?"
    },
    
    // Sleep Health
    sleep: {
      "sleep quality": "Your sleep data indicates an average of {userHealth.metrics.sleepHours} hours nightly, which is below your goal of {userHealth.metrics.sleepGoal} hours. Quality sleep is critical for cardiovascular health, especially with mild hypertension. Would you like evidence-based strategies to improve your sleep duration and quality?",
      
      "optimal sleep duration": "The American Academy of Sleep Medicine recommends 7-9 hours of sleep for adults. With your mild hypertension, adequate sleep is particularly important for blood pressure regulation. Your current average is {userHealth.metrics.sleepHours} hours. Would you like to establish a sleep improvement plan?",
      
      "sleep stages": "Healthy sleep cycles through several stages: light sleep, deep sleep, and REM sleep. Deep sleep is crucial for physical restoration, while REM sleep supports cognitive function and memory consolidation. Would you like information on optimizing your sleep environment to improve these cycles?",
      
      "sleep and hypertension": "Research from the American Heart Association shows that insufficient sleep can elevate blood pressure and increase cardiovascular risk. For individuals with mild hypertension, sleep optimization is a recommended non-pharmacological intervention. Would you like techniques to improve your sleep routine?",
      
      "circadian rhythm": "Your circadian rhythm regulates sleep-wake cycles, hormone release, and body temperature. Regular sleep-wake times strengthen this internal clock. Based on your data, establishing consistent bedtime and wake times could improve your sleep quality. Would you like to set up sleep schedule reminders?"
    },
    
    // Medication Management
    medications: {
      "medication schedule": "You have {userHealth.metrics.medications.length} active medications. Your next dose of {userHealth.metrics.medications[0].name} ({userHealth.metrics.medications[0].dosage}) is scheduled for {userHealth.metrics.medications[0].nextDose}. Would you like to review your complete medication schedule or set up a reminder?",
      
      "medication adherence": "Consistent medication adherence is essential for managing health conditions effectively. Research shows that using reminders and establishing medication routines significantly improves adherence rates. Would you like to set up a customized medication reminder system?",
      
      "supplement interactions": "Vitamin D supplements generally have minimal interactions with other medications. However, they should be taken with food containing some fat for optimal absorption. Would you like information about proper timing for your specific supplements?",
      
      "side effect monitoring": "It's important to monitor for potential side effects from medications. For your current prescriptions, key observations include: changes in energy levels, digestive symptoms, or skin reactions. Would you like to set up a symptom tracking system?",
      
      "refill planning": "Proactive refill planning helps prevent medication gaps. Based on your current supply, you should request refills approximately 7 days before completion. Would you like to set up automated refill reminders?"
    },
    
    // Stress Management
    stress: {
      "stress reduction techniques": "Evidence-based stress management techniques include: deep breathing exercises, progressive muscle relaxation, mindfulness meditation, regular physical activity, and adequate sleep. For individuals with mild hypertension, stress management is particularly beneficial. Would you like guided instructions for any of these techniques?",
      
      "mindfulness practice": "Mindfulness practice involves focusing attention on the present moment without judgment. Research shows regular practice can reduce blood pressure and stress hormones. A simple starting point is 5-minute daily breath awareness. Would you like to establish a mindfulness routine?",
      
      "stress and hypertension": "Chronic stress can contribute to elevated blood pressure through sustained release of stress hormones. Managing stress effectively is an important component of your hypertension management plan. Would you like practical strategies for implementing stress reduction in your daily routine?",
      
      "work-life balance": "Maintaining healthy boundaries between work and personal life supports overall wellbeing and stress management. This includes designated non-work time, regular breaks, and prioritizing restorative activities. Would you like recommendations for improving your work-life balance?",
      
      "social connection": "Strong social connections are associated with better stress resilience and improved cardiovascular health. Regular meaningful interaction with supportive individuals provides emotional benefits and practical support for health goals. Would you like suggestions for enhancing social connections?"
    }
  };

  // Professional, evidence-based response templates
  const responseTemplates = {
    greeting: (name) => `Hello, ${name}. I'm your personal health assistant. How may I help you today?`,
    
    checkIn: (name) => `Good to see you, ${name}. How have you been feeling since our last conversation?`,
    
    waterReminder: (data) => `Your water intake today is ${data.current}L (${Math.round(data.current/data.goal*100)}% of your ${data.goal}L daily goal). Staying properly hydrated is important for your overall health, particularly with your mild hypertension. Would you like to log additional water intake?`,
    
    medicationReminder: (med) => `It's time for your scheduled dose of ${med.name} (${med.dosage}). Would you like to mark this as taken or snooze this reminder?`,
    
    appointmentReminder: (appt) => `You have an upcoming appointment with ${appt.doctor} (${appt.specialty}) on ${appt.date} at ${appt.time}. Would you like to review preparation instructions or set a reminder?`,
    
    goalProgress: (goal) => `You're making good progress on your ${goal.type} goal. You're currently at ${goal.progress}% of your target (${goal.target}). Keep up the great work!`,
    
    healthTip: (condition) => `Daily health tip for managing ${condition}: The DASH diet, which emphasizes fruits, vegetables, whole grains, and low-fat dairy while limiting sodium, has been clinically proven to help reduce blood pressure. Would you like some DASH diet recipes?`,
    
    sleepRecommendation: (data) => `Your sleep data shows an average of ${data.current} hours per night, which is below your target of ${data.goal} hours. Adequate sleep is essential for cardiovascular health. Would you like some evidence-based strategies to improve your sleep quality?`,
    
    exerciseMotivation: (steps) => `You've taken ${steps.toLocaleString()} steps today. Just a short 10-minute walk would add approximately 1,000 more steps toward your daily goal. Even brief activity sessions provide health benefits. Would you like a walking route suggestion?`,
    
    notUnderstood: () => `I want to make sure I provide you with accurate information. Could you please rephrase your question or provide more details about what you're looking for?`,
    
    thankYou: (name) => `You're welcome, ${name}. I'm here to support your health journey. Is there anything else I can assist you with today?`
  };

  // Function to generate personalized, professional responses
  const generateResponse = (userInput) => {
    const normalizedInput = userInput.toLowerCase().trim();
    let response = '';
    
    // Greeting patterns
    if (/\b(hello|hi|hey|greetings)\b/i.test(normalizedInput)) {
      const currentHour = new Date().getHours();
      let timeGreeting = "Hello";
      
      if (currentHour < 12) {
        timeGreeting = "Good morning";
      } else if (currentHour < 18) {
        timeGreeting = "Good afternoon";
      } else {
        timeGreeting = "Good evening";
      }
      
      return `${timeGreeting}, ${userHealth.profile.name}. How may I assist with your health management today?`;
    }
    
    // Search in knowledge base for relevant information
    for (const category in healthKnowledgeBase) {
      for (const topic in healthKnowledgeBase[category]) {
        if (normalizedInput.includes(topic) || 
            // Check if any word from the topic is in the input
            topic.split(' ').some(word => word.length > 3 && normalizedInput.includes(word))) {
          
          // Personalize response with user data
          response = healthKnowledgeBase[category][topic]
            .replace('{userHealth.profile.bmi}', userHealth.profile.bmi)
            .replace('{userHealth.metrics.bloodPressure.systolic}', userHealth.metrics.bloodPressure.systolic)
            .replace('{userHealth.metrics.bloodPressure.diastolic}', userHealth.metrics.bloodPressure.diastolic)
            .replace('{userHealth.metrics.bloodPressure.timestamp}', userHealth.metrics.bloodPressure.timestamp)
            .replace('{userHealth.profile.lastCheckup}', userHealth.profile.lastCheckup)
            .replace('{userHealth.metrics.appointments[0].date}', userHealth.metrics.appointments[0].date)
            .replace('{userHealth.metrics.waterIntake}', userHealth.metrics.waterIntake)
            .replace('{Math.round(userHealth.metrics.waterIntake/userHealth.metrics.waterGoal*100)}', 
                    Math.round(userHealth.metrics.waterIntake/userHealth.metrics.waterGoal*100))
            .replace('{userHealth.metrics.steps.toLocaleString()}', userHealth.metrics.steps.toLocaleString())
            .replace('{Math.round(userHealth.metrics.steps/userHealth.metrics.stepsGoal*100)}',
                    Math.round(userHealth.metrics.steps/userHealth.metrics.stepsGoal*100))
            .replace('{userHealth.metrics.sleepHours}', userHealth.metrics.sleepHours)
            .replace('{userHealth.metrics.sleepGoal}', userHealth.metrics.sleepGoal)
            .replace('{userHealth.metrics.medications.length}', userHealth.metrics.medications.length)
            .replace('{userHealth.metrics.medications[0].name}', userHealth.metrics.medications[0].name)
            .replace('{userHealth.metrics.medications[0].dosage}', userHealth.metrics.medications[0].dosage)
            .replace('{userHealth.metrics.medications[0].nextDose}', userHealth.metrics.medications[0].nextDose);
          
          return response;
        }
      }
    }
    
    // Check for specific health metrics queries
    if (/\b(steps|walked|walking|step count)\b/i.test(normalizedInput)) {
      return responseTemplates.exerciseMotivation(userHealth.metrics.steps);
    }
    
    if (/\b(heart rate|pulse|heartbeat|bpm)\b/i.test(normalizedInput)) {
      return `Your most recent heart rate reading was ${userHealth.metrics.heartRate} bpm, which is within the normal resting range. Regular cardiovascular exercise can help maintain a healthy heart rate. Would you like to view your heart rate trends over time?`;
    }
    
    if (/\b(water|hydration|drink|fluid|thirsty)\b/i.test(normalizedInput)) {
      return responseTemplates.waterReminder({
        current: userHealth.metrics.waterIntake,
        goal: userHealth.metrics.waterGoal
      });
    }
    
    if (/\b(sleep|slept|insomnia|rest|tired|fatigue)\b/i.test(normalizedInput)) {
      return responseTemplates.sleepRecommendation({
        current: userHealth.metrics.sleepHours,
        goal: userHealth.metrics.sleepGoal
      });
    }
    
    if (/\b(medicine|medication|pill|drug|prescription|dose|vitamin)\b/i.test(normalizedInput)) {
      return `You have ${userHealth.metrics.medications.length} active medications. Your next dose of ${userHealth.metrics.medications[0].name} (${userHealth.metrics.medications[0].dosage}) is scheduled for ${userHealth.metrics.medications[0].nextDose}. Would you like me to set a reminder or review your complete medication schedule?`;
    }
    
    if (/\b(appointment|doctor|visit|checkup|exam)\b/i.test(normalizedInput)) {
      return `Your next appointment is with ${userHealth.metrics.appointments[0].doctor} (${userHealth.metrics.appointments[0].specialty}) on ${userHealth.metrics.appointments[0].date} at ${userHealth.metrics.appointments[0].time}. Would you like me to set a reminder, help you prepare, or provide transportation options?`;
    }
    
    if (/\b(goal|target|progress|achievement)\b/i.test(normalizedInput)) {
      const activeGoals = userHealth.goals.active;
      let goalResponse = "You have the following active health goals:\n\n";
      
      activeGoals.forEach(goal => {
        goalResponse += `• ${goal.type}: ${goal.progress}% of your target (${goal.target})\n`;
      });
      
      goalResponse += "\nWould you like to update your progress or set a new health goal?";
      return goalResponse;
    }
    
    if (/\b(blood pressure|hypertension|bp)\b/i.test(normalizedInput)) {
      return `Your most recent blood pressure reading was ${userHealth.metrics.bloodPressure.systolic}/${userHealth.metrics.bloodPressure.diastolic} mmHg on ${userHealth.metrics.bloodPressure.timestamp}. This indicates mild hypertension. Evidence-based recommendations include: reducing sodium intake, regular physical activity, stress management, adequate sleep, and medication adherence. Would you like a detailed action plan for blood pressure management?`;
    }
    
    // Handle help requests
    if (/\b(help|assist|support|guide|what can you do)\b/i.test(normalizedInput)) {
      return `I can assist you with various aspects of your health management:

• Tracking health metrics (steps, sleep, water intake, heart rate)
• Managing your medication schedule and reminders
• Providing evidence-based information about health conditions
• Monitoring your progress toward health goals
• Sending appointment reminders and preparation guidance
• Offering personalized wellness recommendations

What specific area of your health would you like assistance with today?`;
    }
    
    // Handle thank you messages
    if (/\b(thank|thanks|appreciate)\b/i.test(normalizedInput)) {
      return responseTemplates.thankYou(userHealth.profile.name || 'there');
    }
    
    // Default response if no specific pattern matches
    return `I'd like to provide you with relevant health information. Could you please clarify what specific aspect of your health you're interested in? I can help with tracking metrics, medication management, appointment scheduling, or provide evidence-based guidance on health conditions.`;
  };

  // Initial suggested queries based on user profile and time of day
  const updateSuggestedQueriesForUser = (userName) => {
    const hour = new Date().getHours();
    
    // Morning suggestions (6 AM - 11 AM)
    if (hour >= 6 && hour < 11) {
      setSuggestedQueries([
        "Track today's water intake",
        "Morning wellness routine",
        "Check medication schedule",
        "Log sleep quality",
        "Blood pressure log"
      ]);
    }
    // Midday suggestions (11 AM - 3 PM)
    else if (hour >= 11 && hour < 15) {
      setSuggestedQueries([
        "Update water intake",
        "Afternoon stress management",
        "Check step count",
        "Nutrition recommendations",
        "Health goal progress"
      ]);
    }
    // Evening suggestions (3 PM - 9 PM)
    else if (hour >= 15 && hour < 21) {
      setSuggestedQueries([
        "Evening medication reminder",
        "Daily health summary",
        "Exercise recommendations",
        "Sleep preparation tips",
        "Tomorrow's health plan"
      ]);
    }
    // Night suggestions (9 PM - 6 AM)
    else {
      setSuggestedQueries([
        "Sleep improvement strategies",
        "Relaxation techniques",
        "Tomorrow's medication schedule",
        "Blood pressure management",
        "Weekly health review"
      ]);
    }
  };

  // Update suggested queries based on user context/conversation
  const updateSuggestedQueries = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    // Nutrition related
    if (/\b(nutrition|food|diet|eat|meal|sodium|dash diet)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "DASH diet recommendations",
        "Sodium reduction strategies",
        "Heart-healthy recipes",
        "Nutrition for hypertension",
        "Meal planning assistance"
      ]);
      return;
    }
    
    // Physical activity related
    if (/\b(exercise|activity|workout|fitness|steps|walking|cardio)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "Cardio recommendations",
        "Track exercise progress",
        "Step count analysis",
        "Exercise for hypertension",
        "Activity goal adjustment"
      ]);
      return;
    }
    
    // Sleep related
    if (/\b(sleep|insomnia|tired|rest|fatigue|bed|bedtime)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "Sleep quality assessment",
        "Sleep hygiene recommendations",
        "Sleep and blood pressure",
        "Bedtime routine optimization",
        "Sleep tracking insights"
      ]);
      return;
    }
    
    // Medication related
    if (/\b(medicine|medication|pill|prescription|dose|reminder)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "Medication schedule review",
        "Set medication reminders",
        "Medication adherence tips",
        "Refill planning assistance",
        "Supplement recommendations"
      ]);
      return;
    }
    
    // Blood pressure related
    if (/\b(blood pressure|hypertension|bp|systolic|diastolic)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "Blood pressure tracking",
        "Hypertension management plan",
        "BP measurement technique",
        "Factors affecting blood pressure",
        "BP monitoring schedule"
      ]);
      return;
    }
    
    // Health goals related
    if (/\b(goal|target|progress|improve|achieve|success)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "Update health goals",
        "Goal progress analysis",
        "Health achievement celebration",
        "Adjust goal targets",
        "New health goal recommendations"
      ]);
      return;
    }
    
    // Appointment related
    if (/\b(appointment|doctor|visit|checkup|exam|specialist)\b/i.test(lowerInput)) {
      setSuggestedQueries([
        "Appointment reminders",
        "Preparation guidelines",
        "Health questions for doctor",
        "Medical records access",
        "Follow-up scheduling"
      ]);
      return;
    }
    
    // Default suggestions based on user profile
    setSuggestedQueries([
      "Daily health summary",
      "Blood pressure management",
      "Update water intake",
      "Medication schedule",
      "Health goal progress"
    ]);
  };

  // Analytics tracking for health insights
  const trackHealthInteraction = (actionType, detail) => {
    // In a real app, this would connect to your analytics service
    console.log(`Health Assistant Analytics: ${actionType} - ${detail} - ${new Date().toISOString()}`);
    
    // Example of data you might collect:
    const analyticData = {
      userId: "user_" + userName.toLowerCase(),
      actionType: actionType,
      detail: detail,
      timestamp: new Date().toISOString(),
      healthContext: {
        recentMetrics: {
          stepsProgress: Math.round(userHealth.metrics.steps/userHealth.metrics.stepsGoal*100),
          sleepProgress: Math.round(userHealth.metrics.sleepHours/userHealth.metrics.sleepGoal*100),
          hydrationProgress: Math.round(userHealth.metrics.waterIntake/userHealth.metrics.waterGoal*100)
        }
      }
    };
    
    // This would be sent to your backend
    // api.trackAnalytics(analyticData);
  };

  // Handle when user opens/closes the chat
  useEffect(() => {
    if (isOpen) {
      trackHealthInteraction('ChatOpened', 'User opened the health assistant interface');
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSuggestedQuery = (query) => {
    const userMessage = {
      text: query,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsOpen(true);
    
    // Track the interaction
    trackHealthInteraction('SuggestedQuerySelected', `User selected: ${query}`);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Process the query with a natural delay
    setTimeout(() => {
      setIsTyping(false);
      const assistantReply = {
        text: generateResponse(query),
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [...prevMessages, assistantReply]);
      
      // Update suggested queries based on context
      updateSuggestedQueries(query);
    }, 1200);
  };

  // Handle when user sends a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (input.trim() === '') return;
    
    // Track the user's query
    trackHealthInteraction('MessageSent', `User query: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`);
    
    // Add user message
    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Dynamic response delay based on message complexity
    // Longer messages get longer delays to simulate thoughtful responses
    const responseDelay = Math.min(2000, Math.max(1000, input.length * 20));
    
    setTimeout(() => {
      setIsTyping(false);
      const assistantResponse = generateResponse(input);
      const assistantReply = {
        text: assistantResponse,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [...prevMessages, assistantReply]);
      
      // Track the assistant's response
      trackHealthInteraction('AssistantResponse', `Replied to: ${input.substring(0, 30)}...`);
      
      // Update suggested queries based on conversation context
      updateSuggestedQueries(input);
    }, responseDelay);
  };

  // Clear chat history
  const handleClearChat = () => {
    const currentHour = new Date().getHours();
    let greeting = "Hello";
    
    if (currentHour < 12) {
      greeting = "Good morning";
    } else if (currentHour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    
    setMessages([{
      text: `${greeting}, ${userName || 'there'}. I'm your personal health assistant. How may I assist you today?`,
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    trackHealthInteraction('ConversationCleared', 'User cleared chat history');
    updateSuggestedQueriesForUser(userName);
  };

  // Render health metrics dashboard
  const renderHealthMetrics = () => {
    return (
      <div className="health-metrics">
        <div className="metric">
          <div className="metric-icon"><Icons.Water /></div>
          <div className="metric-info">
            <div className="metric-value">{userHealth.metrics.waterIntake}L</div>
            <div className="metric-label">of {userHealth.metrics.waterGoal}L</div>
          </div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${Math.min(100, Math.round(userHealth.metrics.waterIntake/userHealth.metrics.waterGoal*100))}%` }}
            ></div>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-icon"><Icons.Heart /></div>
          <div className="metric-info">
            <div className="metric-value">{userHealth.metrics.bloodPressure.systolic}/{userHealth.metrics.bloodPressure.diastolic}</div>
            <div className="metric-label">BP (mmHg)</div>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-icon"><Icons.Steps /></div>
          <div className="metric-info">
            <div className="metric-value">{Math.round(userHealth.metrics.steps/1000)}k</div>
            <div className="metric-label">of {userHealth.metrics.stepsGoal/1000}k steps</div>
          </div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${Math.min(100, Math.round(userHealth.metrics.steps/userHealth.metrics.stepsGoal*100))}%` }}
            ></div>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-icon"><Icons.Sleep /></div>
          <div className="metric-info">
            <div className="metric-value">{userHealth.metrics.sleepHours}h</div>
            <div className="metric-label">of {userHealth.metrics.sleepGoal}h sleep</div>
          </div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${Math.min(100, Math.round(userHealth.metrics.sleepHours/userHealth.metrics.sleepGoal*100))}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`chatbot-container integrated ${darkMode ? 'dark' : ''}`}>
      {/* Chat toggle button */}
      <button 
        className="chat-toggle-btn"
        onClick={toggleChat}
        aria-label={isOpen ? "Close health assistant" : "Open health assistant"}
      >
        {isOpen ? <Icons.Close /> : <Icons.Assistant />}
        {!isOpen && unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
      </button>
      
      {/* Chat window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-left">
            <div className="header-avatar"><Icons.Assistant /></div>
            <div className="header-info">
              <h3>Health Assistant</h3>
              <span className="status-indicator">Online</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="clear-btn"
              onClick={handleClearChat}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Icons.Clear />
            </button>
            <button 
              className="close-btn"
              onClick={toggleChat}
              aria-label="Close health assistant"
            >
              <Icons.Close />
            </button>
          </div>
        </div>
        
        <div className="messages-container">
          {/* Health metrics dashboard */}
          {renderHealthMetrics()}
          
          {/* Chat messages */}
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender}`}
            >
              {message.sender === "assistant" && (
                <div className="avatar assistant-avatar"><Icons.Assistant /></div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {message.text}
                </div>
                <div className="message-timestamp">{message.timestamp}</div>
              </div>
              {message.sender === "user" && (
                <div className="avatar user-avatar"><Icons.User /></div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="message assistant">
              <div className="avatar assistant-avatar"><Icons.Assistant /></div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggested queries */}
        <div className="suggested-queries">
          {suggestedQueries.map((query, index) => (
            <button 
              key={index}
              className="query-pill"
              onClick={() => handleSuggestedQuery(query)}
            >
              {query}
            </button>
          ))}
        </div>
        
        {/* Input form */}
        <form className="input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your health..."
            aria-label="Chat message"
            ref={inputRef}
          />
          <button 
            type="submit"
            disabled={input.trim() === ''}
            aria-label="Send message"
            className="send-button"
          >
            <Icons.Send />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessionalChatbot;