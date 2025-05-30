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
  const [debugInfo, setDebugInfo] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    console.log('🔍 ConsultationManager mounted with consultation:', consultation);
    
    if (!consultation) {
      console.log('❌ No consultation provided');
      return;
    }

    const fetchPatientDetailsAndDocuments = async () => {
      console.log('🚀 Starting fetchPatientDetailsAndDocuments...');
      console.log('📋 Consultation object:', JSON.stringify(consultation, null, 2));
      
      try {
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          consultationId: consultation.id,
          consultationDocuments: consultation.documents,
          consultationDocumentsLength: consultation.documents?.length || 0,
          consultationDocumentsType: typeof consultation.documents,
          consultationDocumentsIsArray: Array.isArray(consultation.documents)
        }));

        // Fetch patient details
        console.log('👤 Fetching patient details for:', consultation.patientId);
        const patientRef = doc(db, 'users', consultation.patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (patientSnap.exists()) {
          console.log('✅ Patient details found');
          setPatientDetails(patientSnap.data());
        } else {
          console.log('❌ Patient details not found');
        }

        // Initialize documents array
        const combinedDocs = [];
        console.log('📂 Starting document search...');

        // 1. CHECK FIRESTORE DOCUMENTS FIRST
        console.log('🔍 Checking Firestore documents...');
        console.log('consultation.documents:', consultation.documents);
        console.log('consultation.documents type:', typeof consultation.documents);
        console.log('consultation.documents is array:', Array.isArray(consultation.documents));
        
        if (consultation.documents) {
          if (Array.isArray(consultation.documents)) {
            console.log(`✅ Found ${consultation.documents.length} documents in Firestore array`);
            consultation.documents.forEach((doc, index) => {
              console.log(`📄 Document ${index}:`, doc);
              combinedDocs.push({
                ...doc,
                source: 'firestore',
                id: `firestore-${index}`,
                displayName: doc.name || `Document ${index + 1}`
              });
            });
          } else {
            console.log('⚠️ consultation.documents exists but is not an array:', consultation.documents);
          }
        } else {
          console.log('❌ No consultation.documents found');
        }

        // 2. CHECK FIREBASE STORAGE
        console.log('🗄️ Checking Firebase Storage...');
        const storagePaths = [
          `consultations/${consultation.id}/documents`,
          `consultations/documents`,
          `consultation-documents/${consultation.id}`,
          `appointments/${consultation.id}/documents`,
          `temp-${consultation.patientId}*`, // Check for temp files
        ];

        console.log('📁 Storage paths to check:', storagePaths);

        for (const path of storagePaths) {
          try {
            console.log(`🔍 Checking storage path: ${path}`);
            const storageRef = ref(storage, path);
            const files = await listAll(storageRef);
            
            console.log(`📁 Path ${path}: Found ${files.items.length} files`);
            
            if (files.items.length > 0) {
              console.log(`✅ Found ${files.items.length} files in ${path}`);
              const urls = await Promise.all(
                files.items.map(async (fileRef) => {
                  try {
                    const url = await getDownloadURL(fileRef);
                    console.log(`📄 File: ${fileRef.name} -> ${url}`);
                    return { 
                      name: fileRef.name, 
                      url,
                      source: 'storage',
                      path: path,
                      id: `storage-${fileRef.name}`,
                      displayName: fileRef.name
                    };
                  } catch (urlError) {
                    console.error(`❌ Error getting download URL for ${fileRef.name}:`, urlError);
                    return null;
                  }
                })
              );
              
              const validUrls = urls.filter(url => url !== null);
              console.log(`✅ Got ${validUrls.length} valid URLs from ${path}`);
              combinedDocs.push(...validUrls);
            } else {
              console.log(`❌ No files found in ${path}`);
            }
          } catch (storageError) {
            console.log(`❌ Error checking ${path}:`, storageError.message);
          }
        }

        // 3. PATTERN MATCHING SEARCH
        console.log('🔍 Starting pattern matching search...');
        try {
          const rootStorageRef = ref(storage, 'consultations/documents');
          const allFiles = await listAll(rootStorageRef);
          console.log(`📁 Root documents folder contains ${allFiles.items.length} files`);
          
          // Filter files that might belong to this consultation
          const consultationDate = consultation.date?.replace(/-/g, '');
          const patientName = consultation.patientName?.toLowerCase().replace(/\s+/g, '');
          
          console.log('🔍 Pattern matching criteria:');
          console.log('- Consultation date:', consultationDate);
          console.log('- Patient name:', patientName);
          
          const potentialFiles = allFiles.items.filter(item => {
            const fileName = item.name.toLowerCase();
            const matchesDate = consultationDate && fileName.includes(consultationDate);
            const matchesName = patientName && fileName.includes(patientName);
            
            console.log(`📄 File ${item.name}: matchesDate=${matchesDate}, matchesName=${matchesName}`);
            
            return matchesDate || matchesName;
          });

          console.log(`🔍 Found ${potentialFiles.length} potential files based on pattern matching`);
          
          if (potentialFiles.length > 0) {
            const urls = await Promise.all(
              potentialFiles.map(async (fileRef) => {
                try {
                  const url = await getDownloadURL(fileRef);
                  return { 
                    name: fileRef.name, 
                    url,
                    source: 'storage-pattern',
                    id: `pattern-${fileRef.name}`,
                    displayName: fileRef.name
                  };
                } catch (urlError) {
                  console.error(`❌ Error getting URL for pattern file ${fileRef.name}:`, urlError);
                  return null;
                }
              })
            );
            
            const validPatternUrls = urls.filter(url => url !== null);
            console.log(`✅ Got ${validPatternUrls.length} valid pattern URLs`);
            combinedDocs.push(...validPatternUrls);
          }
        } catch (patternError) {
          console.log('❌ Pattern matching search failed:', patternError.message);
        }

        // Remove duplicates
        console.log(`📊 Before deduplication: ${combinedDocs.length} documents`);
        const uniqueDocs = combinedDocs.filter((doc, index, self) => 
          index === self.findIndex(d => d.url === doc.url || d.name === doc.name)
        );
        console.log(`📊 After deduplication: ${uniqueDocs.length} documents`);

        console.log('📋 Final documents list:', uniqueDocs);
        setAllDocuments(uniqueDocs);

        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          totalDocumentsFound: uniqueDocs.length,
          firestoreDocsCount: combinedDocs.filter(d => d.source === 'firestore').length,
          storageDocsCount: combinedDocs.filter(d => d.source === 'storage').length,
          patternDocsCount: combinedDocs.filter(d => d.source === 'storage-pattern').length,
          finalDocuments: uniqueDocs
        }));

      } catch (err) {
        console.error('❌ Error in fetchPatientDetailsAndDocuments:', err);
        setError('Failed to load patient information');
        setDebugInfo(prev => ({
          ...prev,
          error: err.message,
          stack: err.stack
        }));
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
    console.log('📄 Opening document:', doc);
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      console.error('❌ No URL found for document:', doc);
    }
  };

  // Add logging for render
  console.log('🎨 Rendering ConsultationManager');
  console.log('📋 allDocuments state:', allDocuments);
  console.log('🐛 debugInfo state:', debugInfo);

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

      {/* ALWAYS SHOW DOCUMENTS SECTION - Even if empty for debugging */}
      <div className="documents-section">
        <h3>Patient Uploaded Documents ({allDocuments.length})</h3>
        
        {allDocuments.length > 0 ? (
          <div className="documents-list">
            {allDocuments.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="doc-info">
                  <span className="doc-name">📄 {doc.displayName || doc.name}</span>
                  <span className="doc-type">
                    Source: {doc.source === 'firestore' ? 'Firestore' : 
                            doc.source === 'storage' ? 'Storage' : 
                            doc.source === 'storage-pattern' ? 'Storage (Pattern)' : 'Unknown'}
                    {doc.path && ` | Path: ${doc.path}`}
                  </span>
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
            <p>No documents found.</p>
            <p>Check console for detailed debug information.</p>
          </div>
        )}
      </div>

      {/* ALWAYS SHOW DEBUG SECTION */}
      <div className="debug-section" style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '5px',
        fontSize: '12px',
        border: '1px solid #ccc'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🐛 Debug Information:</h4>
        <div style={{ fontFamily: 'monospace', lineHeight: '1.4' }}>
          <p><strong>Consultation ID:</strong> {consultation?.id || 'Not found'}</p>
          <p><strong>Patient ID:</strong> {consultation?.patientId || 'Not found'}</p>
          <p><strong>Patient Name:</strong> {consultation?.patientName || 'Not found'}</p>
          <p><strong>Date:</strong> {consultation?.date || 'Not found'}</p>
          <p><strong>Documents in consultation object:</strong> {consultation?.documents?.length || 0}</p>
          <p><strong>Documents type:</strong> {typeof consultation?.documents}</p>
          <p><strong>Documents is array:</strong> {Array.isArray(consultation?.documents) ? 'Yes' : 'No'}</p>
          <p><strong>Total Documents Found:</strong> {allDocuments.length}</p>
          <p><strong>Documents State:</strong> {JSON.stringify(allDocuments, null, 2)}</p>
          
          {consultation?.documents && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Raw Consultation.documents</summary>
              <pre style={{ 
                background: '#fff', 
                padding: '10px', 
                borderRadius: '3px', 
                marginTop: '5px',
                fontSize: '11px',
                overflow: 'auto'
              }}>
                {JSON.stringify(consultation.documents, null, 2)}
              </pre>
            </details>
          )}
          
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full Consultation Object</summary>
            <pre style={{ 
              background: '#fff', 
              padding: '10px', 
              borderRadius: '3px', 
              marginTop: '5px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(consultation, null, 2)}
            </pre>
          </details>
        </div>
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