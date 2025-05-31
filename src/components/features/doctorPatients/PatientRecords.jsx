import React, { useEffect, useState } from 'react';
import { db, auth } from '../../Auth/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './PatientRecords.css';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const doctorId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get all consultations for this doctor
        const consultationsQuery = query(
          collection(db, 'consultations'),
          where('doctorId', '==', doctorId)
        );
        const consultationsSnap = await getDocs(consultationsQuery);
        const consultations = consultationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Group by patient
        const patientsMap = {};
        for (const consult of consultations) {
          if (!patientsMap[consult.patientId]) {
            patientsMap[consult.patientId] = {
              patientName: consult.patientName,
              consultations: []
            };
          }
          patientsMap[consult.patientId].consultations.push(consult);
        }
        const patientsArr = Object.entries(patientsMap).map(([id, data]) => ({ id, ...data }));

        // 3. For each consultation, fetch after-consultation files
        for (const patient of patientsArr) {
          for (const consult of patient.consultations) {
            const messagesQuery = query(
              collection(db, 'consultationMessages'),
              where('consultationId', '==', consult.id),
              where('type', '==', 'file')
            );
            const messagesSnap = await getDocs(messagesQuery);
            consult.afterConsultationFiles = messagesSnap.docs.map(doc => doc.data());
          }
        }

        setPatients(patientsArr);
      } catch (err) {
        setError('Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchRecords();
  }, [doctorId]);

  return (
    <div className="patient-records-page">
      <h2 className="section-title">Patient Records</h2>
      {loading && <div className="loading-indicator">Loading records...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && patients.length === 0 && (
        <div className="no-records">No patient records found.</div>
      )}
      <div className="patients-list">
        {patients.map(patient => (
          <div key={patient.id} className="patient-card">
            <h3 className="patient-name">{patient.patientName}</h3>
            {patient.consultations.map(consult => (
              <div key={consult.id} className="consultation-section">
                <div className="consultation-header">
                  <span className="consultation-date">{consult.date} {consult.time && `at ${consult.time}`}</span>
                  <span className="consultation-type">{consult.type ? consult.type.charAt(0).toUpperCase() + consult.type.slice(1) : ''}</span>
                </div>
                <div className="consultation-files">
                  <div className="files-block">
                    <strong>Before Consultation:</strong>
                    {(consult.documents && consult.documents.length > 0) ? (
                      <ul className="files-list">
                        {consult.documents.map((doc, idx) => (
                          <li key={idx}>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-files">No files uploaded during booking.</span>
                    )}
                  </div>
                  <div className="files-block">
                    <strong>After Consultation:</strong>
                    {(consult.afterConsultationFiles && consult.afterConsultationFiles.length > 0) ? (
                      <ul className="files-list">
                        {consult.afterConsultationFiles.map((file, idx) => (
                          <li key={idx}>
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">{file.fileName}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-files">No files exchanged during consultation.</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientRecords; 