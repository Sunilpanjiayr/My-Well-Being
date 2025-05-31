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
  const [allDocuments, setAllDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    console.log('🔍 ConsultationManager mounted');
    console.log('📋 Consultation prop:', consultation);
    
    if (!consultation) {
      console.log('❌ No consultation provided');
      setAllDocuments([]);
      setDocumentsLoading(false);
      return;
    }

    const fetchPatientConsultationDocuments = async (patientId, consultationId) => {
      // 1. Get the user's consultations
      const userConsultationsRef = doc(db, 'userConsultations', patientId);
      const userConsultationsSnap = await getDoc(userConsultationsRef);

      if (!userConsultationsSnap.exists()) return [];

      const consultationIds = userConsultationsSnap.data().consultations || [];
      const allConsultationDocs = [];

      for (const cId of consultationIds) {
        if (consultationId && cId !== consultationId) continue; // Only fetch the specific consultation if provided

        const consultationRef = doc(db, 'consultations', cId);
        const consultationSnap = await getDoc(consultationRef);

        if (
          consultationSnap.exists() &&
          consultationSnap.data().patientId === patientId &&
          Array.isArray(consultationSnap.data().documents) &&
          consultationSnap.data().documents.length > 0
        ) {
          allConsultationDocs.push({
            consultationId: cId,
            date: consultationSnap.data().date,
            time: consultationSnap.data().time,
            documents: consultationSnap.data().documents, // Array of { name, url, ... }
          });
        }
      }

      return allConsultationDocs;
    };

    setDocumentsLoading(true);
    setError('');
    fetchPatientConsultationDocuments(consultation.patientId, consultation.id)
      .then((docsArr) => {
        if (docsArr.length > 0) {
          setAllDocuments(docsArr[0].documents.map((doc, index) => ({
            id: `firestore-${index}`,
            name: doc.name || `Document ${index + 1}`,
            url: doc.url || doc.downloadURL,
            source: 'firestore',
            type: doc.type || 'unknown',
            size: doc.size || 0,
            uploadedAt: doc.uploadedAt || doc.createdAt
          })));
        } else {
          setAllDocuments([]);
        }
      })
      .catch(() => {
        setAllDocuments([]);
        setError('Failed to load documents');
      })
      .finally(() => setDocumentsLoading(false));
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

  const openDocument = (doc) => {
    console.log('📄 Opening document:', doc);
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      console.error('❌ No URL found for document:', doc);
      alert('Unable to open document - no URL found');
    }
  };

  console.log('🎨 Rendering ConsultationManager');
  console.log('📋 Current allDocuments state:', allDocuments);

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

      {/* DOCUMENTS SECTION - ALWAYS VISIBLE */}
      <div className="documents-section">
        <h3>Patient Documents</h3>
        
        {documentsLoading ? (
          <div className="loading-documents">
            <p>🔄 Loading documents...</p>
          </div>
        ) : allDocuments.length > 0 ? (
          <div className="documents-list">
            {allDocuments.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="doc-info">
                  <div className="doc-name">📄 {doc.name}</div>
                  <div className="doc-type">
                    Source: {doc.source} 
                    {doc.path && ` | Path: ${doc.path}`}
                    {doc.size && ` | Size: ${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                  </div>
                </div>
                <div className="doc-actions">
                  <button
                    className="view-doc-btn"
                    onClick={() => openDocument(doc)}
                    title={`Open ${doc.name}`}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-documents">
            <p>❌ No documents found for this consultation.</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Check browser console for detailed search logs.
            </p>
          </div>
        )}
      </div>

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