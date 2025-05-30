import React, { useState, useEffect } from 'react';
import { db, storage } from '../../Auth/firebase';
import { 
  collection, 
  query, 
  where, 
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import './ConsultationManager.css';

const ConsultationManager = ({ consultation, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [message, setMessage] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointmentDocs, setAppointmentDocs] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!consultation) return;

    const fetchPatientDetails = async () => {
      try {
        const patientRef = doc(db, 'users', consultation.patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (patientSnap.exists()) {
          setPatientDetails(patientSnap.data());
        }

        const storageRef = ref(storage, `consultations/${consultation.id}/documents`);
        const files = await listAll(storageRef);
        const urls = await Promise.all(
          files.items.map(async (fileRef) => {
            const url = await getDownloadURL(fileRef);
            return { name: fileRef.name, url };
          })
        );
        setAppointmentDocs(urls);
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Failed to load patient information');
      }
    };

    fetchPatientDetails();
  }, [consultation]);

  const handleReschedule = async (newDate, newTime, message) => {
    try {
      setLoading(true);
      setError('');

      const consultationRef = doc(db, 'consultations', consultation.id);
      await updateDoc(consultationRef, {
        reschedulePending: true,
        proposedDate: newDate,
        proposedTime: newTime,
        lastUpdated: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: consultation.patientId,
        type: 'reschedule_request',
        title: 'Consultation Reschedule Request',
        message: `Your doctor has requested to reschedule your consultation.`,
        consultationId: consultation.id,
        doctorId: consultation.doctorId,
        currentDate: consultation.date,
        currentTime: consultation.time,
        proposedDate: newDate,
        proposedTime: newTime,
        rescheduleMessage: message,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      setNotificationSent(true);
      setSubmitStatus('success');
      setToastMessage('Reschedule request sent successfully');
      setTimeout(onClose, 2000);

    } catch (err) {
      console.error('Error sending reschedule request:', err);
      setError('Failed to send reschedule request');
      setSubmitStatus('error');
      setToastMessage('Failed to send reschedule request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }
    await handleReschedule(newDate, newTime, message);
  };

  const handleStartConsultation = async () => {
    try {
      setLoading(true);
      setError('');

      const consultationRef = doc(db, 'consultations', consultation.id);
      await updateDoc(consultationRef, {
        status: consultation.status === 'in-progress' ? 'in-progress' : 'started',
        lastUpdated: serverTimestamp(),
        ...(consultation.status !== 'in-progress' && {
          startedAt: serverTimestamp()
        })
      });

      if (consultation.status !== 'in-progress') {
        await addDoc(collection(db, 'notifications'), {
          userId: consultation.patientId,
          type: 'consultation_started',
          title: 'Consultation Started',
          message: `Your ${consultation.type} consultation has started. Please join now.`,
          consultationId: consultation.id,
          roomId: consultation.id,
          status: 'unread',
          createdAt: serverTimestamp(),
          doctorName: consultation.doctorName,
          consultationType: consultation.type
        });
      }

      window.location.href = `/consultation-room/${consultation.id}?type=${consultation.type}`;

    } catch (err) {
      console.error('Error with consultation:', err);
      setError('Failed to manage consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultation-manager">
      <div className="manager-header">
        <h2>Manage Consultation</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="consultation-details">
        <h3>Consultation Details</h3>
        <div className="detail-row">
          <span>Patient:</span>
          <span>{consultation.patientName}</span>
        </div>
        <div className="detail-row">
          <span>Date:</span>
          <span>{consultation.date}</span>
        </div>
        <div className="detail-row">
          <span>Time:</span>
          <span>{consultation.time}</span>
        </div>
        <div className="detail-row">
          <span>Type:</span>
          <span>{consultation.type === 'video' ? 'Video Call' : 'Chat'}</span>
        </div>
        <div className="detail-row">
          <span>Status:</span>
          <span className={`status-badge ${consultation.status}`}>
            {consultation.status}
          </span>
        </div>
      </div>

      {/* Show attached files from consultation.documents (Firestore) */}
      {consultation.documents && consultation.documents.length > 0 && (
        <div className="documents-section">
          <h3>Patient Uploaded Documents</h3>
          <div className="documents-list">
            {consultation.documents.map((doc, index) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="document-link"
              >
                {doc.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Existing fallback: files from Firebase Storage */}
      {appointmentDocs.length > 0 && (
        <div className="documents-section">
          <h3>Uploaded Documents (Storage)</h3>
          <div className="documents-list">
            {appointmentDocs.map((doc, index) => (
              <a 
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="document-link"
              >
                {doc.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {!consultation.reschedulePending && (
        <div className="reschedule-section">
          <h3>Reschedule Consultation</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newDate">New Date:</label>
              <input
                type="date"
                id="newDate"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newTime">New Time:</label>
              <input
                type="time"
                id="newTime"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message to Patient:</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you need to reschedule..."
                rows={3}
              />
            </div>

            <button 
              type="submit" 
              className="reschedule-button"
              disabled={loading || notificationSent}
            >
              {loading ? 'Sending...' : notificationSent ? 'Request Sent' : 'Send Reschedule Request'}
            </button>
          </form>
        </div>
      )}

      {consultation.status !== 'completed' && (
        <div className="start-consultation-section">
          <button
            className={`start-consultation-button ${consultation.type}`}
            onClick={handleStartConsultation}
            disabled={loading}
          >
            {loading ? 'Starting...' : 
              consultation.status === 'in-progress' 
                ? `Join ${consultation.type === 'video' ? 'Video Call' : 'Chat'}`
                : `Start ${consultation.type === 'video' ? 'Video Call' : 'Chat'}`
            }
          </button>
        </div>
      )}

      {toastMessage && (
        <div className={`toast-message ${submitStatus}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ConsultationManager;