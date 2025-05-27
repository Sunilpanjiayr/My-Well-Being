import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './AppointmentBooking.css';

const storage = getStorage();

const AppointmentBooking = ({ doctor, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [reason, setReason] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [consultationStatus, setConsultationStatus] = useState(null);

  useEffect(() => {
    if (!doctor || !selectedDate) return;

    const fetchExistingAppointments = async () => {
      try {
        const appointmentsQuery = query(
          collection(db, 'consultations'),
          where('doctorId', '==', doctor.id),
          where('date', '==', selectedDate),
          where('status', 'in', ['pending', 'confirmed'])
        );

        const snapshot = await getDocs(appointmentsQuery);
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setExistingAppointments(appointments);
        generateAvailableTimeSlots(appointments);
      } catch (err) {
        console.error('Error fetching existing appointments:', err);
        setError('Failed to load available time slots');
      }
    };

    fetchExistingAppointments();
  }, [doctor, selectedDate]);

  useEffect(() => {
    if (!doctor) return;

    // Listen for consultation status changes
    const unsubscribeConsultation = onSnapshot(
      query(
        collection(db, 'consultations'),
        where('doctorId', '==', doctor.id),
        where('status', '==', 'in_progress')
      ),
      (snapshot) => {
        const activeConsultations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Find if there's an active consultation for the current user
        const userConsultation = activeConsultations.find(
          consultation => consultation.patientId === auth.currentUser?.uid
        );
        
        if (userConsultation) {
          setConsultationStatus(userConsultation);
        } else {
          setConsultationStatus(null);
        }
      }
    );

    return () => {
      unsubscribeConsultation();
    };
  }, [doctor]);

  const generateAvailableTimeSlots = (existingAppointments) => {
    // Define doctor's working hours (9 AM to 5 PM)
    const workingHours = [];
    for (let hour = 9; hour <= 17; hour++) {
      if (hour !== 13) { // Skip lunch hour (1 PM)
        workingHours.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }

    // Filter out booked slots
    const bookedTimes = new Set(existingAppointments.map(apt => apt.time));
    const availableSlots = workingHours.filter(time => !bookedTimes.has(time));

    setAvailableTimeSlots(availableSlots);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const uploadedDocs = [];
      for (const file of files) {
        // Create a reference to the file in Firebase Storage
        const storageRef = ref(storage, `consultations/documents/${Date.now()}_${file.name}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        uploadedDocs.push({
          name: file.name,
          url: downloadURL,
          type: file.type,
          uploadedAt: new Date().toISOString()
        });
      }

      setDocuments(prev => [...prev, ...uploadedDocs]);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('Please log in to book an appointment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get user details
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      if (!userData) {
        throw new Error('User data not found');
      }

      // Get doctor details
      const doctorRef = doc(db, 'doctors', doctor.id);
      const doctorSnap = await getDoc(doctorRef);
      const doctorData = doctorSnap.exists() ? doctorSnap.data() : null;

      if (!doctorData) {
        throw new Error('Doctor data not found');
      }

      // Create consultation in the consultations collection
      const consultationRef = await addDoc(collection(db, 'consultations'), {
        patientId: user.uid,
        patientName: userData.username || userData.displayName || user.displayName || user.email,
        patientEmail: userData.email || user.email,
        patientPhone: userData.phone || '',
        doctorId: doctor.id,
        doctorName: doctorData.username || doctor.username,
        doctorSpecialty: doctorData.specialty || doctor.specialty,
        date: selectedDate,
        time: selectedTime,
        type: consultationType,
        reason: reason,
        status: 'pending',
        documents: documents,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      // Create a notification for the doctor
      await addDoc(collection(db, 'notifications'), {
        userId: doctor.id,
        type: 'new_appointment',
        title: 'New Appointment Request',
        message: `New appointment request from ${userData.username || userData.displayName || user.displayName || user.email} for ${selectedDate} at ${selectedTime}`,
        consultationId: consultationRef.id,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      // Update user's consultations list
      const userConsultationsRef = doc(db, 'userConsultations', user.uid);
      const userConsultationsSnap = await getDoc(userConsultationsRef);
      
      if (userConsultationsSnap.exists()) {
        await updateDoc(userConsultationsRef, {
          consultations: [...userConsultationsSnap.data().consultations, consultationRef.id]
        });
      } else {
        await setDoc(userConsultationsRef, {
          userId: user.uid,
          consultations: [consultationRef.id]
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error booking consultation:', error);
      setError('Failed to book consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinConsultation = () => {
    if (consultationStatus) {
      window.location.href = `/consultation-room/${consultationStatus.id}`;
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="appointment-booking">
      <div className="booking-header">
        <h2>Book Appointment</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="doctor-summary">
        <div className="doctor-avatar">
          {doctor.avatarUrl ? (
            <img src={doctor.avatarUrl} alt={`Dr. ${doctor.username}`} />
          ) : (
            doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'
          )}
        </div>
        <div className="doctor-info">
          <h3>Dr. {doctor.username}</h3>
          <p>{doctor.specialty}</p>
          <p className="consultation-fee">Consultation fee: ${doctor.consultationFee}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="form-group">
        <label>Consultation Type</label>
        <div className="consultation-types">
          <button 
            className={`type-button ${consultationType === 'video' ? 'active' : ''}`}
            onClick={() => setConsultationType('video')}
          >
            Video Call
          </button>
          <button 
            className={`type-button ${consultationType === 'chat' ? 'active' : ''}`}
            onClick={() => setConsultationType('chat')}
          >
            Chat
          </button>
        </div>
      </div>

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
        <div className="form-group">
          <label>Available Time Slots</label>
          <div className="time-slots">
            {availableTimeSlots.map(time => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'active' : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Reason for Consultation</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe your symptoms or reason for consultation"
          required
        />
      </div>

      <div className="form-group">
        <label>Upload Medical Documents (Optional)</label>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          disabled={loading}
        />
        {uploadProgress > 0 && (
          <div className="upload-progress">
            <div 
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        {documents.length > 0 && (
          <div className="uploaded-files">
            {documents.map((doc, index) => (
              <div key={index} className="file-item">
                <span>{doc.name}</span>
                <button
                  onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                  className="remove-file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleBookAppointment}
        disabled={loading || !selectedDate || !selectedTime || !reason.trim()}
        className="book-button"
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>

      {consultationStatus && (
        <div className="active-consultation-alert">
          <h3>Active Consultation</h3>
          <p>Your doctor has started the consultation.</p>
          <button 
            className="join-consultation-btn"
            onClick={handleJoinConsultation}
          >
            Join Consultation
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking; 