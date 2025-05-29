// src/components/features/doctorConsultation/DoctorConsultation.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './DoctorConsultation.css';
import AppointmentBooking from './AppointmentBooking';
import AppointmentNotifications from '../appointments/AppointmentNotifications';

// Initialize Firebase Storage
const storage = getStorage();

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeConsultations, setActiveConsultations] = useState({});
  // New state for consultation type selection in doctor cards
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState({});

  // Define consultation fees based on type
  const consultationFees = {
    video: 500,
    chat: 300
  };

  // Get consultation fee for a specific doctor and type
  const getConsultationFee = (doctorId, type = 'video') => {
    return consultationFees[type];
  };

  // Handle consultation type change for a specific doctor
  const handleConsultationTypeChange = (doctorId, type) => {
    setSelectedConsultationTypes(prev => ({
      ...prev,
      [doctorId]: type
    }));
  };

  // Get selected consultation type for a doctor (default to video)
  const getSelectedConsultationType = (doctorId) => {
    return selectedConsultationTypes[doctorId] || 'video';
  };

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

  // Fetch doctors from Firebase
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching doctors with specialty:', selectedSpecialty);
        const doctorsRef = collection(db, 'doctors');
        let q;
        
        // Only fetch verified doctors
        if (selectedSpecialty !== 'all' && selectedSpecialty !== 'All Specialties') {
          console.log('Filtering by specialty:', selectedSpecialty);
          q = query(
            doctorsRef,
            where('isVerified', '==', true),
            where('specialty', '==', selectedSpecialty)
          );
        } else {
          console.log('Fetching all verified doctors');
          q = query(
            doctorsRef,
            where('isVerified', '==', true)
          );
        }
        
        const querySnapshot = await getDocs(q);
        console.log('Found doctors:', querySnapshot.size);
        
        const doctorsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Doctor data:', data);
          doctorsList.push({
            id: doc.id,
            ...data,
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            consultationFee: data.consultationFee || 50
          });
        });
        
        console.log('Processed doctors list:', doctorsList);
        setDoctors(doctorsList);
        
        if (doctorsList.length === 0) {
          if (selectedSpecialty !== 'all' && selectedSpecialty !== 'All Specialties') {
            setError(`No verified doctors found for ${selectedSpecialty}. Try a different specialty or check back later.`);
          } else {
            setError('No verified doctors available at the moment. Please check back later.');
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty]);

  // Load user's appointments
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const appointmentsRef = collection(db, 'consultations');
      const q = query(appointmentsRef, where('patientId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        try {
          const appointmentsList = [];
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            // Get doctor details
            const doctorRef = doc(db, 'doctors', data.doctorId);
            const doctorDoc = await getDoc(doctorRef);
            const doctorData = doctorDoc.exists() ? doctorDoc.data() : null;
            
            appointmentsList.push({
              id: docSnapshot.id,
              ...data,
              doctor: doctorData
            });
          }
          setAppointments(appointmentsList);
          setLoading(false);
        } catch (error) {
          console.error('Error in real-time appointments update:', error);
          setError('Failed to update appointments in real-time.');
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up appointments listener:', error);
      setError('Failed to load appointments. Please try again.');
      setLoading(false);
    }
  }, []);

  // Add this useEffect to listen for active consultations
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen for active consultation rooms
    const consultationRoomsQuery = query(
      collection(db, 'consultationRooms'),
      where('patientId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(consultationRoomsQuery, (snapshot) => {
      const activeRooms = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        activeRooms[data.consultationId] = {
          roomId: doc.id,
          ...data
        };
      });
      setActiveConsultations(activeRooms);
    });

    return () => unsubscribe();
  }, []);

  // Filter doctors based on search query
  const filteredDoctors = React.useMemo(() => {
    console.log('Filtering doctors with search query:', searchQuery);
    console.log('Current doctors list:', doctors);
    
    if (!searchQuery.trim()) {
      return doctors;
    }
    
    const searchLower = searchQuery.toLowerCase().trim();
    return doctors.filter(doctor => {
      const fieldsToSearch = [
        doctor.username,
        doctor.specialty,
        doctor.hospital,
        doctor.experience,
        doctor.about
      ];
      
      return fieldsToSearch.some(field => 
        field && field.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [doctors, searchQuery]);

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

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const user = auth.currentUser;
    
    if (!user) {
      setError('Please log in to upload documents');
      return;
    }

    try {
      const uploadedDocs = [];
      
      for (const file of files) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
        }

        // Create a reference to the file location
        const fileRef = ref(storage, `medical_documents/${user.uid}/${file.name}`);
        
        // Upload the file
        await uploadBytes(fileRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(fileRef);
        
        uploadedDocs.push({
          name: file.name,
          url: downloadURL,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      setMedicalDocuments(prev => [...prev, ...uploadedDocs]);
      setUploadProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error.message);
      setUploadProgress(0);
    }
  };

  // Book consultation
  const handleBookConsultation = async () => {
    const user = auth.currentUser;
    
    if (!user) {
      setError('Please log in to book a consultation');
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime || !consultationReason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Create consultation document
      const consultationRef = await addDoc(collection(db, 'consultations'), {
        patientId: user.uid,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        type: consultationType,
        reason: consultationReason,
        status: 'pending',
        documents: medicalDocuments,
        createdAt: serverTimestamp()
      });

      // Update appointments list
      setAppointments(prev => [...prev, {
        id: consultationRef.id,
        patientId: user.uid,
        doctorId: selectedDoctor.id,
        doctor: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        type: consultationType,
        reason: consultationReason,
        status: 'pending',
        documents: medicalDocuments,
        createdAt: new Date().toISOString()
      }]);

      setShowBookingSuccess(true);
      
      // Reset form
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setConsultationReason('');
      setMedicalDocuments([]);
      setBookingStep(1);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowBookingSuccess(false);
        setActiveTab('appointments');
      }, 3000);

    } catch (error) {
      console.error('Error booking consultation:', error);
      setError('Failed to book consultation. Please try again.');
    }
  };

  // Get upcoming appointments
  const getUpcomingAppointments = () => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
      return appointmentDate > new Date() && appointment.status !== 'completed';
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
      return appointmentDate <= new Date() || appointment.status === 'completed';
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB - dateA; // Sort in descending order
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle successful booking
  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setBookingSuccess(true);
    setActiveTab('appointments');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setBookingSuccess(false);
    }, 3000);
  };

  // Update the doctor card click handler
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleJoinConsultation = async (appointment) => {
    try {
      const activeRoom = activeConsultations[appointment.id];
      if (!activeRoom) {
        setError('Consultation room not found');
        return;
      }

      // Update consultation status
      await updateDoc(doc(db, 'consultations', appointment.id), {
        status: 'in-progress',
        joinedAt: serverTimestamp()
      });

      // Redirect to consultation room
      window.location.href = `/consultation-room/${activeRoom.roomId}`;
    } catch (err) {
      console.error('Error joining consultation:', err);
      setError('Failed to join consultation. Please try again.');
    }
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
                  placeholder="Search by doctor name, specialty, hospital, or experience" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="specialty-filter">
                <select 
                  value={selectedSpecialty} 
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  {specialties.map((specialty, index) => (
                    <option key={index} value={specialty === 'All Specialties' ? 'all' : specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading doctors...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
            <div className="doctors-list">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => {
                  const selectedType = getSelectedConsultationType(doctor.id);
                  const currentFee = getConsultationFee(doctor.id, selectedType);
                  
                  return (
                    <div key={doctor.id} className="doctor-card">
                      <div className="doctor-avatar">
                        {doctor.avatarUrl ? (
                          <img src={doctor.avatarUrl} alt={`Dr. ${doctor.username}`} />
                        ) : (
                          doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'
                        )}
                      </div>
                    <div className="doctor-info">
                        <h3>Dr. {doctor.username}</h3>
                      <p className="doctor-specialty">{doctor.specialty}</p>
                        {doctor.experience && (
                          <p className="doctor-experience">{doctor.experience}</p>
                        )}
                        {doctor.hospital && (
                          <p className="doctor-hospital">{doctor.hospital}</p>
                        )}
                      <div className="doctor-rating">
                        <span className="rating-stars">{'★'.repeat(Math.floor(doctor.rating))}{'☆'.repeat(5 - Math.floor(doctor.rating))}</span>
                          <span className="rating-number">
                            {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'} 
                            ({doctor.reviews} reviews)
                          </span>
                      </div>
                      
                      {/* Consultation Type Selector */}
                      <div className="consultation-type-selector">
                        <div className="type-buttons">
                          <button 
                            className={`type-btn ${selectedType === 'video' ? 'active' : ''}`}
                            onClick={() => handleConsultationTypeChange(doctor.id, 'video')}
                          >
                            📹 Video
                          </button>
                          <button 
                            className={`type-btn ${selectedType === 'chat' ? 'active' : ''}`}
                            onClick={() => handleConsultationTypeChange(doctor.id, 'chat')}
                          >
                            💬 Chat
                          </button>
                        </div>
                      </div>
                      
                      <p className="doctor-fee">
                        Consultation fee: Rs.{currentFee}
                        <span className="fee-type">({selectedType === 'video' ? 'Video Call' : 'Chat'})</span>
                      </p>
                      
                        {doctor.about && (
                          <p className="doctor-about">{doctor.about}</p>
                        )}
                        
                        <button 
                          className="book-button"
                          onClick={() => handleDoctorSelect(doctor)}
                        >
                          Book Appointment - Rs.{currentFee}
                        </button>
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="no-results">
                  <p>No doctors found matching your search criteria</p>
                    <p className="help-text">Try adjusting your search terms or specialty filter</p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedDoctor && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <AppointmentBooking
                    doctor={selectedDoctor}
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={handleBookingSuccess}
                  />
                </div>
                </div>
              )}

            {/* Success Message */}
            {bookingSuccess && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <p>Appointment booked successfully!</p>
            </div>
            )}
          </div>
        );

      case 'appointments':
        const upcomingAppointments = getUpcomingAppointments();
        const pastAppointments = getPastAppointments();
        
        return (
          <div className="appointments-tab">
            <h3>Your Appointments</h3>
            
            <div className="appointments-section">
              <h4>Upcoming Appointments</h4>
              {upcomingAppointments.length > 0 ? (
                <div className="appointments-list">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-header">
                        <div className="doctor-info">
                          <div className="doctor-avatar">
                            {appointment.doctor?.avatarUrl ? (
                              <img src={appointment.doctor.avatarUrl} alt={appointment.doctor.username} />
                            ) : (
                              '👨‍⚕️'
                            )}
                </div>
                          <div>
                            <h4>Dr. {appointment.doctor?.username}</h4>
                            <p>{appointment.doctor?.specialty}</p>
                          </div>
                        </div>
                        <div className="appointment-status">
                          <span className={`status-badge ${appointment.status}`}>
                            {appointment.status}
                          </span>
                          </div>
                        </div>
                        
                      <div className="appointment-details">
                        <div className="detail-row">
                          <span>Date:</span>
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="detail-row">
                          <span>Time:</span>
                          <span>{appointment.time}</span>
                        </div>
                        <div className="detail-row">
                          <span>Type:</span>
                          <span>{appointment.type === 'video' ? 'Video Call' : 'Chat'}</span>
                        </div>
                        <div className="detail-row">
                          <span>Fee:</span>
                          <span>Rs.{appointment.consultationFee || (appointment.type === 'video' ? 500 : 300)}</span>
                        </div>
                      </div>
                      
                      {appointment.status !== 'completed' && activeConsultations[appointment.id] && (
                        <div className="appointment-actions">
                          {appointment.type === 'video' ? (
                            <button
                              className="join-call-button"
                              onClick={() => handleJoinConsultation(appointment)}
                            >
                              Join Video Call
                            </button>
                        ) : (
                        <button
                              className="start-chat-button"
                              onClick={() => handleJoinConsultation(appointment)}
                      >
                              Start Chat
                      </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                        </div>
              ) : (
                <div className="no-appointments">
                  <p>No upcoming appointments</p>
                      <button 
                    className="book-appointment-button"
                    onClick={() => setActiveTab('findDoctor')}
                      >
                    Book an Appointment
                      </button>
                </div>
              )}
          </div>
          
            <div className="appointments-section">
              <h4>Past Appointments</h4>
              {pastAppointments.length > 0 ? (
          <div className="appointments-list">
                  {pastAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-card past">
                  <div className="appointment-header">
                        <div className="doctor-info">
                          <div className="doctor-avatar">
                            {appointment.doctor?.avatarUrl ? (
                              <img src={appointment.doctor.avatarUrl} alt={appointment.doctor.username} />
                            ) : (
                              '👨‍⚕️'
                            )}
                          </div>
                      <div>
                            <h4>Dr. {appointment.doctor?.username}</h4>
                            <p>{appointment.doctor?.specialty}</p>
                      </div>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${appointment.status}`}>
                            {appointment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="appointment-details">
                        <div className="detail-row">
                          <span>Date:</span>
                          <span>{formatDate(appointment.date)}</span>
                    </div>
                        <div className="detail-row">
                          <span>Time:</span>
                          <span>{appointment.time}</span>
                    </div>
                        <div className="detail-row">
                          <span>Type:</span>
                          <span>{appointment.type === 'video' ? 'Video Call' : 'Chat'}</span>
                    </div>
                        <div className="detail-row">
                          <span>Fee:</span>
                          <span>Rs.{appointment.consultationFee || (appointment.type === 'video' ? 500 : 300)}</span>
                        </div>
                  </div>
                  
                    <div className="appointment-actions">
                        <button className="view-summary-button">
                          View Summary
                      </button>
                        <button className="book-followup-button">
                          Book Follow-up
            </button>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
              <div className="no-appointments">
                  <p>No past appointments</p>
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
    <div className={`doctor-consultation ${darkMode ? 'dark' : ''}`}>
    <div className="consultation-tabs">
      <button 
        className={`tab-button ${activeTab === 'findDoctor' ? 'active' : ''}`}
        onClick={() => setActiveTab('findDoctor')}
      >
        Find Doctor
      </button>
      <button 
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
      >
        My Appointments
      </button>
    </div>
    
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {bookingSuccess && (
        <div className="success-message">
          Appointment booked successfully! You can view it in My Appointments.
        </div>
      )}

      {activeTab === 'appointments' && <AppointmentNotifications />}

      {renderTabContent()}

      {showBookingModal && selectedDoctor && (
        <AppointmentBooking
          doctor={selectedDoctor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
  </div>
);
}

export default DoctorConsultation;