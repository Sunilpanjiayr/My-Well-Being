// src/components/features/medicineReminders/MedicineReminders.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './MedicineReminders.css';

function MedicineReminders() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('medications');
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [addMedicationModal, setAddMedicationModal] = useState(false);
  const [addReminderModal, setAddReminderModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationTime, setNotificationTime] = useState('');
  const [todayReminders, setTodayReminders] = useState([]);
  
  // New medication form state
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    units: 'mg',
    frequency: 'daily',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#4a90e2',
    notes: '',
    refillReminder: false,
    refillDate: '',
    quantity: '',
    prescribedBy: '',
    category: 'prescription'
  });
  
  // New reminder form state
  const [newReminder, setNewReminder] = useState({
    medicationId: '',
    time: '08:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    enabled: true,
    notes: ''
  });
  
  // Medication categories
  const medicationCategories = [
    { id: 'all', name: 'All Medications' },
    { id: 'prescription', name: 'Prescription' },
    { id: 'over-the-counter', name: 'Over-the-counter' },
    { id: 'supplement', name: 'Supplements' },
    { id: 'vitamin', name: 'Vitamins' }
  ];
  
  // Dosage units
  const dosageUnits = ['mg', 'ml', 'g', 'mcg', 'IU', 'tablet(s)', 'capsule(s)', 'drop(s)', 'spray(s)', 'patch'];
  
  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'three-times-daily', label: 'Three Times Daily' },
    { value: 'four-times-daily', label: 'Four Times Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Twice Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as-needed', label: 'As Needed' },
    { value: 'custom', label: 'Custom Schedule' }
  ];
  
  // Days of the week
  const daysOfWeek = [
    { id: 'monday', label: 'Monday', shortLabel: 'M' },
    { id: 'tuesday', label: 'Tuesday', shortLabel: 'T' },
    { id: 'wednesday', label: 'Wednesday', shortLabel: 'W' },
    { id: 'thursday', label: 'Thursday', shortLabel: 'T' },
    { id: 'friday', label: 'Friday', shortLabel: 'F' },
    { id: 'saturday', label: 'Saturday', shortLabel: 'S' },
    { id: 'sunday', label: 'Sunday', shortLabel: 'S' }
  ];
  
  // Time slots for reminders
  const timeSlots = [
    { id: 'morning', time: '08:00', label: 'Morning (8:00 AM)' },
    { id: 'noon', time: '12:00', label: 'Noon (12:00 PM)' },
    { id: 'evening', time: '18:00', label: 'Evening (6:00 PM)' },
    { id: 'night', time: '22:00', label: 'Night (10:00 PM)' },
    { id: 'custom', time: '', label: 'Custom Time' }
  ];

  // Load saved data on component mount
  useEffect(() => {
    const savedMedications = JSON.parse(localStorage.getItem('medications')) || [];
    const savedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
    
    setMedications(savedMedications);
    setReminders(savedReminders);
    
    // Update today's reminders
    updateTodayReminders(savedReminders);
    
    // Set up notification time
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setNotificationTime('morning');
    } else if (currentHour < 17) {
      setNotificationTime('afternoon');
    } else {
      setNotificationTime('evening');
    }
  }, []);
  
  // Save data when medications or reminders change
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);
  
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
    updateTodayReminders(reminders);
  }, [reminders]);
  
  // Update today's reminders
  const updateTodayReminders = (remindersList) => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const todayList = remindersList.filter(reminder => {
      // Check if this reminder should be active for today
      if (!reminder.enabled) return false;
      if (!reminder.days.includes(dayOfWeek)) return false;
      
      // Check if related medication is active (not expired)
      const medication = medications.find(med => med.id === reminder.medicationId);
      if (!medication) return false;
      
      // Check medication start/end dates
      const startDate = new Date(medication.startDate);
      const endDate = medication.endDate ? new Date(medication.endDate) : null;
      
      if (today < startDate) return false;
      if (endDate && today > endDate) return false;
      
      return true;
    }).sort((a, b) => {
      // Sort by time
      return a.time.localeCompare(b.time);
    });
    
    setTodayReminders(todayList);
  };
  
  // Handle new medication submission
  const handleAddMedication = (e) => {
    e.preventDefault();
    
    const medication = {
      ...newMedication,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    };
    
    setMedications([...medications, medication]);
    
    // Reset form and close modal
    setNewMedication({
      name: '',
      dosage: '',
      units: 'mg',
      frequency: 'daily',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      color: '#4a90e2',
      notes: '',
      refillReminder: false,
      refillDate: '',
      quantity: '',
      prescribedBy: '',
      category: 'prescription'
    });
    
    setAddMedicationModal(false);
    
    // If there are no reminders yet, prompt to add one
    if (reminders.length === 0) {
      setNewReminder({
        ...newReminder,
        medicationId: medication.id
      });
      setAddReminderModal(true);
    }
  };
  
  // Handle new reminder submission
  const handleAddReminder = (e) => {
    e.preventDefault();
    
    const reminder = {
      ...newReminder,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString()
    };
    
    setReminders([...reminders, reminder]);
    
    // Reset form and close modal
    setNewReminder({
      medicationId: '',
      time: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      enabled: true,
      notes: ''
    });
    
    setAddReminderModal(false);
  };
  
  // Handle form input changes for medication
  const handleMedicationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedication({
      ...newMedication,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form input changes for reminder
  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setNewReminder({
      ...newReminder,
      [name]: value
    });
  };
  
  // Handle day selection for reminder
  const handleDayToggle = (dayId) => {
    const updatedDays = [...newReminder.days];
    
    if (updatedDays.includes(dayId)) {
      // Remove day if already selected
      const index = updatedDays.indexOf(dayId);
      updatedDays.splice(index, 1);
    } else {
      // Add day if not selected
      updatedDays.push(dayId);
    }
    
    setNewReminder({
      ...newReminder,
      days: updatedDays
    });
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time) => {
    if (time === 'custom') {
      // Keep current time for custom selection
      return;
    }
    
    setNewReminder({
      ...newReminder,
      time: time
    });
  };
  
  // Delete medication
  const deleteMedication = (medicationId) => {
    // Delete medication
    const updatedMedications = medications.filter(med => med.id !== medicationId);
    setMedications(updatedMedications);
    
    // Delete all associated reminders
    const updatedReminders = reminders.filter(rem => rem.medicationId !== medicationId);
    setReminders(updatedReminders);
    
    // If viewing this medication, go back to list
    if (selectedMedication && selectedMedication.id === medicationId) {
      setSelectedMedication(null);
    }
  };
  
  // Delete reminder
  const deleteReminder = (reminderId) => {
    const updatedReminders = reminders.filter(rem => rem.id !== reminderId);
    setReminders(updatedReminders);
  };
  
  // Toggle reminder enabled state
  const toggleReminderEnabled = (reminderId) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        return {
          ...reminder,
          enabled: !reminder.enabled
        };
      }
      return reminder;
    });
    
    setReminders(updatedReminders);
  };
  
  // Get medication by ID
  const getMedicationById = (id) => {
    return medications.find(med => med.id === id) || null;
  };
  
  // Get reminders for a medication
  const getRemindersForMedication = (medicationId) => {
    return reminders.filter(reminder => reminder.medicationId === medicationId);
  };
  
  // Get formatted time
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const timeObj = new Date();
      timeObj.setHours(parseInt(hours, 10));
      timeObj.setMinutes(parseInt(minutes, 10));
      
      return timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };
  
  // Format day names
  const formatDays = (daysList) => {
    if (daysList.length === 7) {
      return 'Every day';
    }
    
    if (daysList.length === 0) {
      return 'No days selected';
    }
    
    if (
      daysList.includes('monday') && 
      daysList.includes('tuesday') && 
      daysList.includes('wednesday') && 
      daysList.includes('thursday') && 
      daysList.includes('friday') && 
      !daysList.includes('saturday') && 
      !daysList.includes('sunday')
    ) {
      return 'Weekdays';
    }
    
    if (
      !daysList.includes('monday') && 
      !daysList.includes('tuesday') && 
      !daysList.includes('wednesday') && 
      !daysList.includes('thursday') && 
      !daysList.includes('friday') && 
      daysList.includes('saturday') && 
      daysList.includes('sunday')
    ) {
      return 'Weekends';
    }
    
    return daysList.map(day => {
      return day.charAt(0).toUpperCase() + day.slice(1, 3);
    }).join(', ');
  };
  
  // Check if medication needs refill
  const needsRefill = (medication) => {
    if (!medication.refillReminder || !medication.refillDate) return false;
    
    const today = new Date();
    const refillDate = new Date(medication.refillDate);
    const timeDiff = refillDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff <= 7;
  };
  
  // Get filtered medications based on search and category
  const getFilteredMedications = () => {
    const filtered = medications.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };
  
  return (
    <div className={`medicine-reminders ${darkMode ? 'dark-mode' : ''}`}>
      {/* Add Medication Modal */}
      {addMedicationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Medication</h2>
              <button className="close-button" onClick={() => setAddMedicationModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddMedication} className="medication-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="medName">Medication Name</label>
                  <input
                    id="medName"
                    name="name"
                    type="text"
                    value={newMedication.name}
                    onChange={handleMedicationChange}
                    required
                    placeholder="Enter medication name"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medDosage">Dosage</label>
                    <input
                      id="medDosage"
                      name="dosage"
                      type="text"
                      value={newMedication.dosage}
                      onChange={handleMedicationChange}
                      required
                      placeholder="Dosage amount"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medUnits">Units</label>
                    <select
                      id="medUnits"
                      name="units"
                      value={newMedication.units}
                      onChange={handleMedicationChange}
                    >
                      {dosageUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="medFrequency">Frequency</label>
                  <select
                    id="medFrequency"
                    name="frequency"
                    value={newMedication.frequency}
                    onChange={handleMedicationChange}
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="medInstructions">Instructions</label>
                  <textarea
                    id="medInstructions"
                    name="instructions"
                    value={newMedication.instructions}
                    onChange={handleMedicationChange}
                    placeholder="E.g., Take with food, Take before bedtime"
                  ></textarea>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Schedule & Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medStartDate">Start Date</label>
                    <input
                      id="medStartDate"
                      name="startDate"
                      type="date"
                      value={newMedication.startDate}
                      onChange={handleMedicationChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medEndDate">End Date (Optional)</label>
                    <input
                      id="medEndDate"
                      name="endDate"
                      type="date"
                      value={newMedication.endDate}
                      onChange={handleMedicationChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="medCategory">Category</label>
                  <select
                    id="medCategory"
                    name="category"
                    value={newMedication.category}
                    onChange={handleMedicationChange}
                  >
                    {medicationCategories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="medColor">Color Label</label>
                  <input
                    id="medColor"
                    name="color"
                    type="color"
                    value={newMedication.color}
                    onChange={handleMedicationChange}
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h3>Refill Information</h3>
                
                <div className="form-group checkbox-group">
                  <input
                    id="medRefillReminder"
                    name="refillReminder"
                    type="checkbox"
                    checked={newMedication.refillReminder}
                    onChange={handleMedicationChange}
                  />
                  <label htmlFor="medRefillReminder">Enable Refill Reminder</label>
                </div>
                
                {newMedication.refillReminder && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="medRefillDate">Refill Date</label>
                      <input
                        id="medRefillDate"
                        name="refillDate"
                        type="date"
                        value={newMedication.refillDate}
                        onChange={handleMedicationChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="medQuantity">Quantity Remaining</label>
                      <input
                        id="medQuantity"
                        name="quantity"
                        type="number"
                        value={newMedication.quantity}
                        onChange={handleMedicationChange}
                        placeholder="Number of doses left"
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="medPrescribedBy">Prescribed By (Optional)</label>
                  <input
                    id="medPrescribedBy"
                    name="prescribedBy"
                    type="text"
                    value={newMedication.prescribedBy}
                    onChange={handleMedicationChange}
                    placeholder="Doctor's name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="medNotes">Additional Notes</label>
                  <textarea
                    id="medNotes"
                    name="notes"
                    value={newMedication.notes}
                    onChange={handleMedicationChange}
                    placeholder="Any other important information"
                  ></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Add Medication</button>
                <button type="button" className="secondary-button" onClick={() => setAddMedicationModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Reminder Modal */}
      {addReminderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set Medication Reminder</h2>
              <button className="close-button" onClick={() => setAddReminderModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddReminder} className="reminder-form">
              <div className="form-group">
                <label htmlFor="reminderMedication">Medication</label>
                <select
                  id="reminderMedication"
                  name="medicationId"
                  value={newReminder.medicationId}
                  onChange={handleReminderChange}
                  required
                >
                  <option value="" disabled>Select a medication</option>
                  {medications.map(med => (
                    <option key={med.id} value={med.id}>{med.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Time</label>
                <div className="time-slots">
                  {timeSlots.map(slot => (
                    <div 
                      key={slot.id}
                      className={`time-slot ${newReminder.time === slot.time ? 'active' : ''}`}
                      onClick={() => handleTimeSlotSelect(slot.time)}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
                
                <div className="custom-time-input">
                  <label htmlFor="reminderTime">Custom Time</label>
                  <input
                    id="reminderTime"
                    name="time"
                    type="time"
                    value={newReminder.time}
                    onChange={handleReminderChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Days</label>
                <div className="day-selector">
                  {daysOfWeek.map(day => (
                    <div 
                      key={day.id}
                      className={`day-option ${newReminder.days.includes(day.id) ? 'selected' : ''}`}
                      onClick={() => handleDayToggle(day.id)}
                    >
                      <span className="day-short">{day.shortLabel}</span>
                      <span className="day-long">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reminderNotes">Reminder Notes (Optional)</label>
                <textarea
                  id="reminderNotes"
                  name="notes"
                  value={newReminder.notes}
                  onChange={handleReminderChange}
                  placeholder="Add specific instructions for this reminder"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Set Reminder</button>
                <button type="button" className="secondary-button" onClick={() => setAddReminderModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="medicine-reminder-header">
        <div className="header-content">
          <h1>Medicine Reminder</h1>
          <p>Track, manage, and set reminders for your medications</p>
        </div>
        <button className="add-medication-button" onClick={() => setAddMedicationModal(true)}>
          <span className="medication-icon">💊</span>
          Add Medication
        </button>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('medications')}
          className={activeTab === 'medications' ? 'active' : ''}
        >
          My Medications
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={activeTab === 'reminders' ? 'active' : ''}
        >
          Reminders
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={activeTab === 'schedule' ? 'active' : ''}
        >
          Schedule
        </button>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'medications' && (
          <div className="medications-tab">
            <div className="search-filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {selectedMedication ? (
              <div className="medication-details">
                <div className="details-header">
                  <button 
                    className="back-button"
                    onClick={() => setSelectedMedication(null)}
                  >
                    ← Back
                  </button>
                  <div className="medication-actions">
                    <button className="edit-button">Edit</button>
                    <button 
                      className="delete-button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${selectedMedication.name}?`)) {
                          deleteMedication(selectedMedication.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="medication-title-section">
                  <div 
                    className="medication-color-indicator" 
                    style={{ backgroundColor: selectedMedication.color }}
                  ></div>
                  <div className="medication-title-content">
                    <h2>{selectedMedication.name}</h2>
                    <div className="medication-category-tag">
                      {medicationCategories.find(cat => cat.id === selectedMedication.category)?.name}
                    </div>
                  </div>
                </div>
                
                <div className="medication-info-card">
                  <h3>Dosage & Instructions</h3>
                  <div className="info-row">
                    <div className="info-label">Dosage</div>
                    <div className="info-value">{selectedMedication.dosage} {selectedMedication.units}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Frequency</div>
                    <div className="info-value">
                      {frequencyOptions.find(opt => opt.value === selectedMedication.frequency)?.label}
                    </div>
                  </div>
                  {selectedMedication.instructions && (
                    <div className="info-row">
                      <div className="info-label">Instructions</div>
                      <div className="info-value">{selectedMedication.instructions}</div>
                    </div>
                  )}
                </div>
                
                <div className="medication-info-card">
                  <h3>Schedule</h3>
                  <div className="info-row">
                    <div className="info-label">Start Date</div>
                    <div className="info-value">{new Date(selectedMedication.startDate).toLocaleDateString()}</div>
                  </div>
                  {selectedMedication.endDate && (
                    <div className="info-row">
                      <div className="info-label">End Date</div>
                      <div className="info-value">{new Date(selectedMedication.endDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                
                {selectedMedication.refillReminder && (
                  <div className="medication-info-card">
                    <h3>Refill Information</h3>
                    {selectedMedication.refillDate && (
                      <div className="info-row">
                        <div className="info-label">Next Refill</div>
                        <div className={`info-value ${needsRefill(selectedMedication) ? 'refill-needed' : ''}`}>
                          {new Date(selectedMedication.refillDate).toLocaleDateString()}
                          {needsRefill(selectedMedication) && (
                            <span className="refill-badge">Refill Soon</span>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedMedication.quantity && (
                      <div className="info-row">
                        <div className="info-label">Remaining</div>
                        <div className="info-value">{selectedMedication.quantity} doses</div>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedMedication.prescribedBy && (
                  <div className="medication-info-card">
                    <h3>Prescription Details</h3>
                    <div className="info-row">
                      <div className="info-label">Prescribed By</div>
                      <div className="info-value">{selectedMedication.prescribedBy}</div>
                    </div>
                  </div>
                )}
                
                {selectedMedication.notes && (
                  <div className="medication-info-card">
                    <h3>Additional Notes</h3>
                    <div className="info-value notes-value">{selectedMedication.notes}</div>
                  </div>
                )}
                
                <div className="medication-reminders-section">
                  <div className="section-header">
                    <h3>Reminders</h3>
                    <button 
                      className="add-reminder-button"
                      onClick={() => {
                        setNewReminder({
                          ...newReminder,
                          medicationId: selectedMedication.id
                        });
                        setAddReminderModal(true);
                      }}
                    >
                      + Add Reminder
                    </button>
                  </div>
                  
                  {getRemindersForMedication(selectedMedication.id).length > 0 ? (
                    <div className="reminder-list">
                      {getRemindersForMedication(selectedMedication.id).map(reminder => (
                        <div key={reminder.id} className={`reminder-item ${!reminder.enabled ? 'disabled' : ''}`}>
                          <div className="reminder-time">{formatTime(reminder.time)}</div>
                          <div className="reminder-info">
                            <div className="reminder-days">{formatDays(reminder.days)}</div>
                            {reminder.notes && <div className="reminder-notes">{reminder.notes}</div>}
                          </div>
                          <div className="reminder-actions">
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={reminder.enabled}
                                onChange={() => toggleReminderEnabled(reminder.id)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                            <button 
                              className="delete-reminder" 
                              onClick={() => {
                                if (window.confirm("Delete this reminder?")) {
                                  deleteReminder(reminder.id);
                                }
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-reminders-message">
                      <p>No reminders set for this medication.</p>
                      <button 
                        className="primary-button"
                        onClick={() => {
                          setNewReminder({
                            ...newReminder,
                            medicationId: selectedMedication.id
                          });
                          setAddReminderModal(true);
                        }}
                      >
                        Set First Reminder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="medications-list">
                {medications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💊</div>
                    <h3>No Medications Added</h3>
                    <p>Add your first medication to start tracking</p>
                    <button className="primary-button" onClick={() => setAddMedicationModal(true)}>
                      Add Your First Medication
                    </button>
                  </div>
                ) : (
                  <>
                    {getFilteredMedications().length > 0 ? (
                      <div className="medications-grid">
                        {getFilteredMedications().map(medication => (
                          <div 
                            key={medication.id} 
                            className="medication-card"
                            onClick={() => setSelectedMedication(medication)}
                          >
                            <div className="medication-card-header">
                              <div 
                                className="medication-color" 
                                style={{ backgroundColor: medication.color }}
                              ></div>
                              <div className="medication-name">{medication.name}</div>
                              {needsRefill(medication) && (
                                <div className="refill-indicator">Refill Soon</div>
                              )}
                            </div>
                            <div className="medication-dosage">
                              {medication.dosage} {medication.units}
                            </div>
                            <div className="medication-frequency">
                              {frequencyOptions.find(opt => opt.value === medication.frequency)?.label}
                            </div>
                            <div className="medication-reminders">
                              {getRemindersForMedication(medication.id).length > 0 ? (
                                <div className="reminders-count">
                                  {getRemindersForMedication(medication.id).length} reminder(s)
                                </div>
                              ) : (
                                <div className="no-reminders">No reminders set</div>
                              )}
                            </div>
                            <button className="view-details">View Details</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-results">
                        <p>No medications match your search.</p>
                        <button className="secondary-button" onClick={() => setSearchQuery('')}>
                          Clear Search
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'reminders' && (
          <div className="reminders-tab">
            <div className="actions-bar">
              <button 
                className="add-reminder-button"
                onClick={() => {
                  if (medications.length === 0) {
                    setAddMedicationModal(true);
                  } else {
                    setAddReminderModal(true);
                  }
                }}
              >
                + Add New Reminder
              </button>
            </div>
            
            <div className="reminders-overview">
              <div className="today-reminders-card">
                <h3>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                
                {todayReminders.length > 0 ? (
                  <div className="today-reminders-list">
                    {todayReminders.map(reminder => {
                      const medication = getMedicationById(reminder.medicationId);
                      if (!medication) return null;
                      
                      return (
                        <div key={reminder.id} className="today-reminder-item">
                          <div className="reminder-time-block">
                            <div className="reminder-time">{formatTime(reminder.time)}</div>
                          </div>
                          
                          <div 
                            className="medication-color-dot"
                            style={{ backgroundColor: medication.color }}
                          ></div>
                          
                          <div className="reminder-content">
                            <div className="reminder-medication-name">{medication.name}</div>
                            <div className="reminder-dosage">{medication.dosage} {medication.units}</div>
                            {reminder.notes && <div className="reminder-notes">{reminder.notes}</div>}
                          </div>
                          
                          <div className="reminder-actions">
                            <button className="mark-taken-button">
                              ✓ Mark as Taken
                            </button>
                            <button className="skip-button">
                              Skip
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-reminders-today">
                    <p>No medication reminders for today.</p>
                  </div>
                )}
              </div>
              
              <div className="all-reminders-section">
                <h3>All Scheduled Reminders</h3>
                
                {reminders.length > 0 ? (
                  <div className="reminders-by-medication">
                    {medications.map(medication => {
                      const medReminders = getRemindersForMedication(medication.id);
                      if (medReminders.length === 0) return null;
                      
                      return (
                        <div key={medication.id} className="medication-reminders-group">
                          <div className="medication-group-header">
                            <div 
                              className="medication-color-block"
                              style={{ backgroundColor: medication.color }}
                            ></div>
                            <div className="medication-group-name">
                              {medication.name}
                            </div>
                          </div>
                          
                          <div className="medication-reminders-items">
                            {medReminders.map(reminder => (
                              <div key={reminder.id} className={`reminder-list-item ${!reminder.enabled ? 'disabled' : ''}`}>
                                <div className="reminder-time">{formatTime(reminder.time)}</div>
                                <div className="reminder-days">{formatDays(reminder.days)}</div>
                                <div className="reminder-actions">
                                  <label className="toggle-switch small">
                                    <input 
                                      type="checkbox" 
                                      checked={reminder.enabled}
                                      onChange={() => toggleReminderEnabled(reminder.id)}
                                    />
                                    <span className="toggle-slider"></span>
                                  </label>
                                  <button 
                                    className="delete-reminder-small" 
                                    onClick={() => {
                                      if (window.confirm("Delete this reminder?")) {
                                        deleteReminder(reminder.id);
                                      }
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-reminders-message">
                    <p>No reminders have been set up yet.</p>
                    <button 
                      className="primary-button"
                      onClick={() => {
                        if (medications.length === 0) {
                          setAddMedicationModal(true);
                        } else {
                          setAddReminderModal(true);
                        }
                      }}
                    >
                      {medications.length === 0 ? 'Add Medication First' : 'Set Your First Reminder'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className="schedule-tab">
            <div className="weekly-schedule">
              <h3>Weekly Schedule</h3>
              
              {reminders.length > 0 ? (
                <div className="schedule-grid">
                  <div className="schedule-header">
                    <div className="time-column">Time</div>
                    {daysOfWeek.map(day => (
                      <div key={day.id} className="day-column">
                        <div className="day-name">{day.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="schedule-body">
                    {/* Morning time slot */}
                    <div className="time-slot-row">
                      <div className="time-label">Morning</div>
                      
                      {daysOfWeek.map(day => {
                        const morningReminders = reminders.filter(rem => {
                          const remHour = parseInt(rem.time.split(':')[0]);
                          return rem.days.includes(day.id) && rem.enabled && remHour >= 5 && remHour < 12;
                        });
                        
                        return (
                          <div key={day.id} className="day-cell">
                            {morningReminders.map(reminder => {
                              const medication = getMedicationById(reminder.medicationId);
                              if (!medication) return null;
                              
                              return (
                                <div 
                                  key={reminder.id} 
                                  className="schedule-pill"
                                  style={{ backgroundColor: medication.color }}
                                >
                                  <div className="pill-time">{formatTime(reminder.time)}</div>
                                  <div className="pill-med">{medication.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Afternoon time slot */}
                    <div className="time-slot-row">
                      <div className="time-label">Afternoon</div>
                      
                      {daysOfWeek.map(day => {
                        const afternoonReminders = reminders.filter(rem => {
                          const remHour = parseInt(rem.time.split(':')[0]);
                          return rem.days.includes(day.id) && rem.enabled && remHour >= 12 && remHour < 17;
                        });
                        
                        return (
                          <div key={day.id} className="day-cell">
                            {afternoonReminders.map(reminder => {
                              const medication = getMedicationById(reminder.medicationId);
                              if (!medication) return null;
                              
                              return (
                                <div 
                                  key={reminder.id} 
                                  className="schedule-pill"
                                  style={{ backgroundColor: medication.color }}
                                >
                                  <div className="pill-time">{formatTime(reminder.time)}</div>
                                  <div className="pill-med">{medication.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Evening time slot */}
                    <div className="time-slot-row">
                      <div className="time-label">Evening</div>
                      
                      {daysOfWeek.map(day => {
                        const eveningReminders = reminders.filter(rem => {
                          const remHour = parseInt(rem.time.split(':')[0]);
                          return rem.days.includes(day.id) && rem.enabled && remHour >= 17 && remHour < 21;
                        });
                        
                        return (
                          <div key={day.id} className="day-cell">
                            {eveningReminders.map(reminder => {
                              const medication = getMedicationById(reminder.medicationId);
                              if (!medication) return null;
                              
                              return (
                                <div 
                                  key={reminder.id} 
                                  className="schedule-pill"
                                  style={{ backgroundColor: medication.color }}
                                >
                                  <div className="pill-time">{formatTime(reminder.time)}</div>
                                  <div className="pill-med">{medication.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Night time slot */}
                    <div className="time-slot-row">
                      <div className="time-label">Night</div>
                      
                      {daysOfWeek.map(day => {
                        const nightReminders = reminders.filter(rem => {
                          const remHour = parseInt(rem.time.split(':')[0]);
                          return rem.days.includes(day.id) && rem.enabled && (remHour >= 21 || remHour < 5);
                        });
                        
                        return (
                          <div key={day.id} className="day-cell">
                            {nightReminders.map(reminder => {
                              const medication = getMedicationById(reminder.medicationId);
                              if (!medication) return null;
                              
                              return (
                                <div 
                                  key={reminder.id} 
                                  className="schedule-pill"
                                  style={{ backgroundColor: medication.color }}
                                >
                                  <div className="pill-time">{formatTime(reminder.time)}</div>
                                  <div className="pill-med">{medication.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-schedule">
                  <div className="empty-icon">⏰</div>
                  <h3>No Reminders Scheduled</h3>
                  <p>Add medications and set reminders to build your schedule</p>
                  <button 
                    className="primary-button"
                    onClick={() => {
                      if (medications.length === 0) {
                        setAddMedicationModal(true);
                      } else {
                        setAddReminderModal(true);
                      }
                    }}
                  >
                    {medications.length === 0 ? 'Add Your First Medication' : 'Set Your First Reminder'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Refill Reminders */}
            <div className="refill-reminders-section">
              <h3>Upcoming Refills</h3>
              
              {medications.some(med => needsRefill(med)) ? (
                <div className="refill-cards">
                  {medications.filter(med => needsRefill(med)).map(medication => {
                    const refillDate = new Date(medication.refillDate);
                    const today = new Date();
                    const timeDiff = refillDate.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    
                    return (
                      <div key={medication.id} className="refill-card">
                        <div className="refill-header">
                          <div 
                            className="medication-color-dot"
                            style={{ backgroundColor: medication.color }}
                          ></div>
                          <div className="medication-name">{medication.name}</div>
                        </div>
                        <div className="refill-date">
                          Refill by: {refillDate.toLocaleDateString()}
                        </div>
                        <div className={`days-remaining ${daysDiff <= 3 ? 'urgent' : ''}`}>
                          {daysDiff <= 0 ? 'Refill now!' : `${daysDiff} days remaining`}
                        </div>
                        {medication.quantity && (
                          <div className="quantity-remaining">
                            {medication.quantity} doses remaining
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-refills-message">
                  <p>No upcoming refills needed.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Disclaimer */}
      <div className="medicine-disclaimer">
        <p><strong>Disclaimer:</strong> This medicine reminder system is for informational and reminder purposes only. It is not intended to serve as a substitute for professional medical advice, diagnosis, or treatment. Always consult your doctor or healthcare provider regarding your medications and medical conditions.</p>
      </div>
    </div>
  );
}

export default MedicineReminders;