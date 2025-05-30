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

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!consultation) return;

    const fetchPatientDetailsAndDocuments = async () => {
      try {
        // Fetch patient details
        const patientRef = doc(db, 'users', consultation.patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (patientSnap.exists()) {
          setPatientDetails(patientSnap.data());
        }

        // Combine documents from multiple sources
        const combinedDocs = [];

        // 1. Documents from Firestore (stored in consultation.documents array)
        if (consultation.documents && Array.isArray(consultation.documents)) {
          console.log('Found Firestore documents:', consultation.documents);
          consultation.documents.forEach((doc, index) => {
            combinedDocs.push({
              ...doc,
              source: 'firestore',
              id: `firestore-${index}`
            });
          });
        }

        // 2. Try to find documents in Firebase Storage with multiple possible paths
        const storagePaths = [
          `consultations/${consultation.id}/documents`, // Current path in your code
          `consultations/documents`, // Root documents folder
          `consultation-documents/${consultation.id}`, // Alternative naming
          `appointments/${consultation.id}/documents`, // If using appointments
        ];

        for (const path of storagePaths) {
          try {
            console.log(`Checking storage path: ${path}`);
            const storageRef = ref(storage, path);
            const files = await listAll(storageRef);
            
            if (files.items.length > 0) {
              console.log(`Found ${files.items.length} files in ${path}`);
              const urls = await Promise.all(
                files.items.map(async (fileRef) => {
                  const url = await getDownloadURL(fileRef);
                  return { 
                    name: fileRef.name, 
                    url,
                    source: 'storage',
                    path: path,
                    id: `storage-${fileRef.name}`
                  };
                })
              );
              combinedDocs.push(...urls);
            }
          } catch (storageError) {
            console.log(`No documents found in ${path}:`, storageError.message);
          }
        }

        // 3. Also try searching for files that might match the consultation date/time pattern
        try {
          const rootStorageRef = ref(storage, 'consultations/documents');
          const allFiles = await listAll(rootStorageRef);
          
          // Filter files that might belong to this consultation
          const potentialFiles = allFiles.items.filter(item => {
            const fileName = item.name.toLowerCase();
            const consultationDate = consultation.date?.replace(/-/g, '');
            const patientName = consultation.patientName?.toLowerCase().replace(/\s+/g, '');
            
            // Check if filename contains consultation date or patient info
            return fileName.includes(consultationDate) || 
                   (patientName && fileName.includes(patientName));
          });

          if (potentialFiles.length > 0) {
            console.log(`Found ${potentialFiles.length} potential files based on pattern matching`);
            const urls = await Promise.all(
              potentialFiles.map(async (fileRef) => {
                const url = await getDownloadURL(fileRef);
                return { 
                  name: fileRef.name, 
                  url,
                  source: 'storage-pattern',
                  id: `pattern-${fileRef.name}`
                };
              })
            );
            combinedDocs.push(...urls);
          }
        } catch (patternError) {
          console.log('Pattern matching search failed:', patternError.message);
        }

        // Remove duplicates based on URL or name
        const uniqueDocs = combinedDocs.filter((doc, index, self) => 
          index === self.findIndex(d => d.url === doc.url || d.name === doc.name)
        );

        console.log('All found documents:', uniqueDocs);
        setAllDocuments(uniqueDocs);

      } catch (err) {
        console.error('Error fetching patient details and documents:', err);
        setError('Failed to load patient information');
      }
    };

    fetchPatientDetailsAndDocuments();
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
    if (doc.url) {
      window.open(doc.url, '_blank');
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

      {/* Display all found documents */}
      {allDocuments.length > 0 && (
        <div className="documents-section">
          <h3>Patient Uploaded Documents ({allDocuments.length})</h3>
          <div className="documents-list">
            {allDocuments.map((doc) => (
              <div key={doc.id} className="document-item">
                <button
                  className="document-link"
                  onClick={() => openDocument(doc)}
                  title={`Open ${doc.name}`}
                >
                  📄 {doc.name}
                </button>
                <span className="document-source">
                  ({doc.source === 'firestore' ? 'Firestore' : 
                    doc.source === 'storage' ? 'Storage' : 
                    doc.source === 'storage-pattern' ? 'Storage (Pattern)' : 'Unknown'})
                </span>
                {doc.path && (
                  <span className="document-path" title={`Storage path: ${doc.path}`}>
                    📁 {doc.path}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-section" style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          fontSize: '12px' 
        }}>
          <h4>Debug Information:</h4>
          <p><strong>Consultation ID:</strong> {consultation.id}</p>
          <p><strong>Documents in Firestore:</strong> {consultation.documents?.length || 0}</p>
          <p><strong>Total Documents Found:</strong> {allDocuments.length}</p>
          {consultation.documents && (
            <details>
              <summary>Firestore Documents Raw Data</summary>
              <pre>{JSON.stringify(consultation.documents, null, 2)}</pre>
            </details>
          )}
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