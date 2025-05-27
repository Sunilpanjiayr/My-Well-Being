import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { useTheme } from '../../../contexts/ThemeContext';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const { darkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = auth.currentUser;

  // Generate all possible time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      if (hour !== 13) { // Skip lunch hour
        const time = hour < 12 
          ? `${hour}:00 AM` 
          : `${hour === 12 ? 12 : hour - 12}:00 PM`;
        slots.push({
          time,
          available: true
        });
      }
    }
    return slots;
  };

  // Load doctor's schedule for selected date
  useEffect(() => {
    const loadSchedule = async () => {
      if (!selectedDate || !user) return;

      try {
        setLoading(true);
        const scheduleRef = doc(db, 'doctorSchedules', `${user.uid}_${selectedDate}`);
        const scheduleSnap = await getDoc(scheduleRef);

        if (scheduleSnap.exists()) {
          setAvailableSlots(scheduleSnap.data().slots);
        } else {
          setAvailableSlots(generateTimeSlots());
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
        setError('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [selectedDate, user]);

  // Handle slot toggle
  const handleSlotToggle = (index) => {
    setAvailableSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = {
        ...newSlots[index],
        available: !newSlots[index].available
      };
      return newSlots;
    });
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    if (!selectedDate || !user) return;

    try {
      setLoading(true);
      setError('');
      
      const scheduleRef = doc(db, 'doctorSchedules', `${user.uid}_${selectedDate}`);
      await setDoc(scheduleRef, {
        doctorId: user.uid,
        date: selectedDate,
        slots: availableSlots,
        updatedAt: new Date().toISOString()
      });

      setSuccess('Schedule updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className={`doctor-schedule ${darkMode ? 'dark' : ''}`}>
      <h2>Update Schedule</h2>
      <p>Set your availability for specific dates</p>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="schedule-form">
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            required
          />
        </div>

        {selectedDate && (
          <>
            <div className="time-slots">
              <h3>Available Time Slots</h3>
              <p>Click to toggle availability</p>
              <div className="slots-grid">
                {availableSlots.map((slot, index) => (
                  <button
                    key={slot.time}
                    className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}
                    onClick={() => handleSlotToggle(index)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="save-button"
              onClick={handleSaveSchedule}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule; 