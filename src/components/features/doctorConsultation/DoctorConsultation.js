// src/components/features/doctorConsultation/DoctorConsultation.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './DoctorConsultation.css';

function DoctorConsultation() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('findDoctor');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [bookingStep, setBookingStep] = useState(1);
  const [consultationReason, setConsultationReason] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [medicalDocuments, setMedicalDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load saved appointments on component mount
  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem('doctorAppointments')) || [];
    setAppointments(savedAppointments);
  }, []);

  // Save appointments to localStorage when they change
  useEffect(() => {
    localStorage.setItem('doctorAppointments', JSON.stringify(appointments));
  }, [appointments]);

  // List of medical specialties
  const specialties = [
    'All Specialties',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Psychiatrist',
    'Orthopedist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist'
  ];

  // Comprehensive list of doctors with details
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Deb',
      specialty: 'General Physician',
      experience: '12 years',
      rating: 4.8,
      reviews: 124,
      avatar: '👩‍⚕️',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      about: 'Dr. Johnson specializes in preventive care and chronic disease management. She takes a holistic approach to patient care, focusing on lifestyle modifications alongside medical treatments.',
      education: 'MD from Stanford University',
      languages: ['English', 'Spanish'],
      consultationFee: 50
    },
    {
      id: 2,
      name: 'Dr. Sunil Panjiyar',
      specialty: 'Cardiologist',
      experience: '15 years',
      rating: 4.9,
      reviews: 189,
      avatar: '👨‍⚕️',
      availability: ['Monday', 'Thursday', 'Friday'],
      about: 'Dr. Patel is a board-certified cardiologist specializing in interventional cardiology and heart disease prevention. He has performed over 1,000 cardiac procedures.',
      education: 'MD from Johns Hopkins University, Fellowship in Cardiology',
      languages: ['English', 'Hindi', 'Gujarati'],
      consultationFee: 85
    },
    {
      id: 3,
      name: 'Dr. Prateeti Sengupta',
      specialty: 'Dermatologist',
      experience: '8 years',
      rating: 4.7,
      reviews: 156,
      avatar: '👩‍⚕️',
      availability: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      about: 'Dr. Chen specializes in medical, surgical, and cosmetic dermatology. She has expertise in treating acne, eczema, psoriasis, and skin cancer.',
      education: 'MD from Yale University, Dermatology Residency at NYU',
      languages: ['English', 'Mandarin'],
      consultationFee: 75
    },
    {
      id: 4,
      name: 'Dr. Swanga Jain',
      specialty: 'Neurologist',
      experience: '20 years',
      rating: 4.9,
      reviews: 211,
      avatar: '👨‍⚕️',
      availability: ['Monday', 'Wednesday', 'Friday'],
      about: 'Dr. Wilson is a neurologist with extensive experience in treating headaches, epilepsy, movement disorders, and neurodegenerative diseases.',
      education: 'MD from Harvard Medical School, Neurology Fellowship at Mayo Clinic',
      languages: ['English'],
      consultationFee: 90
    },
    {
      id: 5,
      name: 'Dr. Sofia Khan',
      specialty: 'Pediatrician',
      experience: '10 years',
      rating: 4.8,
      reviews: 178,
      avatar: '👩‍⚕️',
      availability: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
      about: 'Dr. Rodriguez is passionate about childrens health and development. She specializes in newborn care, childhood immunizations, and developmental assessments.',
      education: 'MD from University of California, Pediatric Residency at Children\'s Hospital',
      languages: ['English', 'Spanish'],
      consultationFee: 60
    },
    {
      id: 6,
      name: 'Dr. Jai Shah',
      specialty: 'Psychiatrist',
      experience: '14 years',
      rating: 4.6,
      reviews: 132,
      avatar: '👨‍⚕️',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      about: 'Dr. Kim specializes in mood disorders, anxiety, and PTSD. He takes an integrative approach combining medication management with therapy techniques.',
      education: 'MD from Columbia University, Psychiatry Residency at Massachusetts General Hospital',
      languages: ['English', 'Korean'],
      consultationFee: 80
    }
  ];

  // Filter doctors based on specialty and search query
  const filteredDoctors = doctors.filter(doctor => {
    // Filter by specialty
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            selectedSpecialty === 'All Specialties' || 
                            doctor.specialty === selectedSpecialty;
    
    // Filter by search query
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSpecialty && matchesSearch;
  });

  // Generate time slots for the selected date
  const getTimeSlots = () => {
    const slots = [];
    // Start at 9 AM and end at 5 PM
    for (let hour = 9; hour <= 17; hour++) {
      // Skip lunch hour
      if (hour !== 12) {
        const time = hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`;
        slots.push(time);
      }
    }
    return slots;
  };

  // Get upcoming appointments
  const getUpcomingAppointments = () => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
      return appointmentDate > new Date();
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA - dateB;
    });
  };

  // Get past appointments
  const getPastAppointments = () => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
      return appointmentDate <= new Date();
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB - dateA; // Sort in descending order
    });
  };

  // Handle appointment booking
  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationReason) {
      alert('Please fill in all required fields');
      return;
    }

    const newAppointment = {
      id: Date.now(),
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      reason: consultationReason,
      status: 'confirmed',
      documents: medicalDocuments
    };

    setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
    setShowBookingSuccess(true);
    
    // Reset form
    setTimeout(() => {
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setConsultationType('video');
      setConsultationReason('');
      setMedicalDocuments([]);
      setBookingStep(1);
      setShowBookingSuccess(false);
      setActiveTab('myAppointments');
    }, 3000);
  };

  // Handle document upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // After "upload" is complete, add files to state
    setTimeout(() => {
      const newDocuments = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }));
      
      setMedicalDocuments(prev => [...prev, ...newDocuments]);
    }, 3000);
  };

  // Cancel an appointment
  const cancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'cancelled' } 
            : appointment
        )
      );
    }
  };

  // Get the next available date
  const getNextAvailableDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render different tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'findDoctor':
        return (
          <div className="find-doctor-tab">
            <div className="search-filters">
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search doctors by name or specialty" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-button">Search</button>
              </div>
              
              <div className="specialty-filter">
                <select 
                  value={selectedSpecialty} 
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  {specialties.map((specialty, index) => (
                    <option key={index} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="doctors-list">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="doctor-card" onClick={() => setSelectedDoctor(doctor)}>
                    <div className="doctor-avatar">{doctor.avatar}</div>
                    <div className="doctor-info">
                      <h3>{doctor.name}</h3>
                      <p className="doctor-specialty">{doctor.specialty}</p>
                      <p className="doctor-experience">{doctor.experience} experience</p>
                      <div className="doctor-rating">
                        <span className="rating-stars">{'★'.repeat(Math.floor(doctor.rating))}{'☆'.repeat(5 - Math.floor(doctor.rating))}</span>
                        <span className="rating-number">{doctor.rating} ({doctor.reviews} reviews)</span>
                      </div>
                      <p className="doctor-fee">Consultation fee: ${doctor.consultationFee}</p>
                    </div>
                    <button className="book-button">Book Appointment</button>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No doctors found matching your search criteria</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'bookAppointment':
        return (
          <div className="book-appointment-tab">
            {showBookingSuccess ? (
              <div className="booking-success">
                <div className="success-icon">✅</div>
                <h2>Appointment Booked Successfully!</h2>
                <p>Your appointment has been confirmed. You will receive a confirmation email shortly.</p>
              </div>
            ) : (
              <>
                <div className="booking-steps">
                  <div className={`step ${bookingStep >= 1 ? 'active' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-text">Doctor Selection</span>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step ${bookingStep >= 2 ? 'active' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-text">Date & Time</span>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-text">Consultation Details</span>
                  </div>
                </div>
                
                {bookingStep === 1 && (
                  <div className="booking-step-content">
                    <h3>Select a Doctor</h3>
                    {selectedDoctor ? (
                      <div className="selected-doctor-details">
                        <div className="doctor-header">
                          <div className="doctor-avatar-large">{selectedDoctor.avatar}</div>
                          <div>
                            <h2>{selectedDoctor.name}</h2>
                            <p>{selectedDoctor.specialty}</p>
                          </div>
                        </div>
                        
                        <div className="doctor-details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Experience</span>
                            <span className="detail-value">{selectedDoctor.experience}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Rating</span>
                            <span className="detail-value">{selectedDoctor.rating} ★ ({selectedDoctor.reviews} reviews)</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Consultation Fee</span>
                            <span className="detail-value">${selectedDoctor.consultationFee}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Languages</span>
                            <span className="detail-value">{selectedDoctor.languages.join(', ')}</span>
                          </div>
                        </div>
                        
                        <div className="doctor-about">
                          <h3>About</h3>
                          <p>{selectedDoctor.about}</p>
                        </div>
                        
                        <div className="doctor-education">
                          <h3>Education</h3>
                          <p>{selectedDoctor.education}</p>
                        </div>
                        
                        <div className="doctor-availability">
                          <h3>Available Days</h3>
                          <div className="availability-days">
                            {selectedDoctor.availability.map((day, index) => (
                              <span key={index} className="availability-day">{day}</span>
                            ))}
                          </div>
                        </div>
                        
                        <button 
                          className="next-step-button" 
                          onClick={() => setBookingStep(2)}
                        >
                          Continue with Selected Doctor →
                        </button>
                        <button 
                          className="change-doctor-button" 
                          onClick={() => setSelectedDoctor(null)}
                        >
                          Change Doctor
                        </button>
                      </div>
                    ) : (
                      <div className="doctor-selection">
                        <p>Please select a doctor from the doctor list to continue booking</p>
                        <button 
                          className="find-doctor-button" 
                          onClick={() => setActiveTab('findDoctor')}
                        >
                          Find a Doctor
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {bookingStep === 2 && (
                  <div className="booking-step-content">
                    <h3>Select Date and Time</h3>
                    <div className="date-time-selection">
                      <div className="date-selection">
                        <label>Appointment Date</label>
                        <input
                        // src/components/features/doctorConsultation/DoctorConsultation.js (continued)
                        type="date" 
                        value={selectedDate}
                        min={getNextAvailableDate()}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="time-selection">
                      <label>Appointment Time</label>
                      <div className="time-slots">
                        {selectedDate ? (
                          getTimeSlots().map((time, index) => (
                            <button
                              key={index}
                              className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </button>
                          ))
                        ) : (
                          <p className="select-date-message">Please select a date first</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="consultation-type">
                      <label>Consultation Type</label>
                      <div className="type-options">
                        <button
                          className={`type-option ${consultationType === 'video' ? 'selected' : ''}`}
                          onClick={() => setConsultationType('video')}
                        >
                          <span className="type-icon">📹</span>
                          <span>Video Call</span>
                        </button>
                        <button
                          className={`type-option ${consultationType === 'audio' ? 'selected' : ''}`}
                          onClick={() => setConsultationType('audio')}
                        >
                          <span className="type-icon">📞</span>
                          <span>Audio Call</span>
                        </button>
                        <button
                          className={`type-option ${consultationType === 'in-person' ? 'selected' : ''}`}
                          onClick={() => setConsultationType('in-person')}
                        >
                          <span className="type-icon">👨‍⚕️</span>
                          <span>In-Person</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="booking-navigation">
                      <button 
                        className="back-button"
                        onClick={() => setBookingStep(1)}
                      >
                        ← Back
                      </button>
                      <button 
                        className="next-step-button"
                        onClick={() => setBookingStep(3)}
                        disabled={!selectedDate || !selectedTime}
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {bookingStep === 3 && (
                <div className="booking-step-content">
                  <h3>Consultation Details</h3>
                  <div className="consultation-details">
                    <div className="reason-section">
                      <label>Reason for Consultation</label>
                      <textarea
                        value={consultationReason}
                        onChange={(e) => setConsultationReason(e.target.value)}
                        placeholder="Briefly describe your symptoms or reason for the consultation"
                        required
                      />
                    </div>
                    
                    <div className="documents-section">
                      <label>Upload Medical Documents (Optional)</label>
                      <div className="document-upload">
                        <input 
                          type="file" 
                          id="document-upload" 
                          multiple 
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="document-upload" className="upload-button">
                          <span>Select Files</span>
                        </label>
                        <span className="upload-info">Upload lab reports, prescriptions, or previous medical records</span>
                      </div>
                      
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="upload-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <span>Uploading: {uploadProgress}%</span>
                        </div>
                      )}
                      
                      {medicalDocuments.length > 0 && (
                        <div className="uploaded-documents">
                          <h4>Uploaded Documents</h4>
                          <ul className="document-list">
                            {medicalDocuments.map(doc => (
                              <li key={doc.id} className="document-item">
                                <span className="document-icon">📄</span>
                                <span className="document-name">{doc.name}</span>
                                <button 
                                  className="remove-document"
                                  onClick={() => setMedicalDocuments(prev => prev.filter(d => d.id !== doc.id))}
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="booking-summary">
                      <h4>Appointment Summary</h4>
                      <div className="summary-details">
                        <div className="summary-item">
                          <span className="summary-label">Doctor:</span>
                          <span className="summary-value">{selectedDoctor?.name}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Date:</span>
                          <span className="summary-value">{selectedDate ? formatDate(selectedDate) : ''}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Time:</span>
                          <span className="summary-value">{selectedTime}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Type:</span>
                          <span className="summary-value">{
                            consultationType === 'video' ? 'Video Call' : 
                            consultationType === 'audio' ? 'Audio Call' : 'In-Person'
                          }</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Fee:</span>
                          <span className="summary-value">${selectedDoctor?.consultationFee}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="booking-navigation">
                      <button 
                        className="back-button"
                        onClick={() => setBookingStep(2)}
                      >
                        ← Back
                      </button>
                      <button 
                        className="confirm-button"
                        onClick={handleBookAppointment}
                        disabled={!consultationReason}
                      >
                        Confirm Appointment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
      
    case 'myAppointments':
      return (
        <div className="my-appointments-tab">
          <div className="appointments-header">
            <h3>My Appointments</h3>
            <button 
              className="new-appointment-button"
              onClick={() => {
                setSelectedDoctor(null);
                setBookingStep(1);
                setActiveTab('bookAppointment');
              }}
            >
              Book New Appointment
            </button>
          </div>
          
          <div className="appointments-tabs">
            <button 
              className={`appointment-tab ${activeTab === 'myAppointments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('myAppointments')}
            >
              Upcoming
            </button>
            <button 
              className={`appointment-tab ${activeTab === 'pastAppointments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('pastAppointments')}
            >
              Past
            </button>
          </div>
          
          <div className="appointments-list">
            {getUpcomingAppointments().length > 0 ? (
              getUpcomingAppointments().map(appointment => (
                <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
                  <div className="appointment-header">
                    <div className="appointment-doctor">
                      <span className="doctor-avatar">{appointment.doctor.avatar}</span>
                      <div>
                        <h4>{appointment.doctor.name}</h4>
                        <p>{appointment.doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${appointment.status}`}>
                        {appointment.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>Date: {formatDate(appointment.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <span>Time: {appointment.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">
                        {appointment.type === 'video' ? '📹' : 
                         appointment.type === 'audio' ? '📞' : '👨‍⚕️'}
                      </span>
                      <span>
                        Type: {
                          appointment.type === 'video' ? 'Video Call' : 
                          appointment.type === 'audio' ? 'Audio Call' : 'In-Person'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="appointment-reason">
                    <h5>Reason for Visit</h5>
                    <p>{appointment.reason}</p>
                  </div>
                  
                  {appointment.status === 'confirmed' && (
                    <div className="appointment-actions">
                      <button className="join-button">
                        {appointment.type === 'video' ? 'Join Video Call' : 
                         appointment.type === 'audio' ? 'Join Audio Call' : 'Get Directions'}
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => cancelAppointment(appointment.id)}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-appointments">
                <p>You have no upcoming appointments</p>
                <button 
                  className="book-now-button"
                  onClick={() => {
                    setSelectedDoctor(null);
                    setBookingStep(1);
                    setActiveTab('bookAppointment');
                  }}
                >
                  Book an Appointment Now
                </button>
              </div>
            )}
          </div>
        </div>
      );
      
    case 'pastAppointments':
      return (
        <div className="past-appointments-tab">
          <div className="appointments-header">
            <h3>Past Appointments</h3>
          </div>
          
          <div className="appointments-tabs">
            <button 
              className={`appointment-tab ${activeTab === 'myAppointments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('myAppointments')}
            >
              Upcoming
            </button>
            <button 
              className={`appointment-tab ${activeTab === 'pastAppointments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('pastAppointments')}
            >
              Past
            </button>
          </div>
          
          <div className="appointments-list">
            {getPastAppointments().length > 0 ? (
              getPastAppointments().map(appointment => (
                <div key={appointment.id} className={`appointment-card past ${appointment.status}`}>
                  <div className="appointment-header">
                    <div className="appointment-doctor">
                      <span className="doctor-avatar">{appointment.doctor.avatar}</span>
                      <div>
                        <h4>{appointment.doctor.name}</h4>
                        <p>{appointment.doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${appointment.status}`}>
                        {appointment.status === 'confirmed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>Date: {formatDate(appointment.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <span>Time: {appointment.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">
                        {appointment.type === 'video' ? '📹' : 
                         appointment.type === 'audio' ? '📞' : '👨‍⚕️'}
                      </span>
                      <span>
                        Type: {
                          appointment.type === 'video' ? 'Video Call' : 
                          appointment.type === 'audio' ? 'Audio Call' : 'In-Person'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="appointment-actions">
                    <button className="book-again-button">
                      Book Again
                    </button>
                    <button className="view-prescription-button">
                      View Prescription
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-appointments">
                <p>You have no past appointments</p>
              </div>
            )}
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

return (
  <div className={`feature-container doctor-consultation ${darkMode ? 'dark-mode' : ''}`}>
    <h1 className="feature-title">Doctor Consultation</h1>
    
    <div className="consultation-tabs">
      <button 
        className={`tab-button ${activeTab === 'findDoctor' ? 'active' : ''}`}
        onClick={() => setActiveTab('findDoctor')}
      >
        Find Doctor
      </button>
      <button 
        className={`tab-button ${activeTab === 'bookAppointment' ? 'active' : ''}`}
        onClick={() => {
          if (selectedDoctor) {
            setActiveTab('bookAppointment');
          } else {
            alert('Please select a doctor first');
            setActiveTab('findDoctor');
          }
        }}
      >
        Book Appointment
      </button>
      <button 
        className={`tab-button ${activeTab === 'myAppointments' ? 'active' : ''}`}
        onClick={() => setActiveTab('myAppointments')}
      >
        My Appointments
      </button>
    </div>
    
    <div className="tab-content">
      {renderTabContent()}
    </div>
  </div>
);
}

export default DoctorConsultation;