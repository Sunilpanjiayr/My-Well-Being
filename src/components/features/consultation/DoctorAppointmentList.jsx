import React, { useState, useEffect } from 'react';
import { db } from '../../Auth/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import RescheduleRequest from './RescheduleRequest';
import ConsultationManager from './ConsultationManager';
import './DoctorAppointmentList.css';

const DoctorAppointmentList = ({ userId }) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRescheduleRequest, setSelectedRescheduleRequest] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to doctor's consultations
    const consultationsQuery = query(
      collection(db, 'consultations'),
      where('doctorId', '==', userId)
    );

    const unsubscribeConsultations = onSnapshot(consultationsQuery, (snapshot) => {
      try {
        const consultationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConsultations(consultationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching consultations:', err);
        setError('Failed to load appointments');
        setLoading(false);
      }
    });

    // Subscribe to reschedule notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('type', '==', 'reschedule_request'),
      where('status', '==', 'unread')
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
    });

    return () => {
      if (unsubscribeConsultations) {
        unsubscribeConsultations();
      }
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, [userId]);

  const handleRescheduleAction = (action) => {
    setSelectedRescheduleRequest(null);
  };

  const handleManageConsultation = (consultation) => {
    setSelectedConsultation(consultation);
  };

  return (
    <div className="appointment-booking">
      <h2>My Appointments</h2>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading appointments...</div>
      ) : (
        <>
          {notifications.length > 0 && (
            <div className="notifications-section">
              <h3>Reschedule Requests</h3>
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-card">
                  <p>{notification.message}</p>
                  <button
                    onClick={() => setSelectedRescheduleRequest(notification)}
                    className="view-request-button"
                  >
                    View Request
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="appointments-list">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="appointment-card">
                <div className="appointment-header">
                  <h4>{consultation.patientName}</h4>
                  <span className={`status-badge ${consultation.status}`}>
                    {consultation.status}
                  </span>
                </div>
                
                <div className="appointment-details">
                  <div className="detail-row">
                    <span>Patient:</span>
                    <span>{consultation.patientName}</span>
                  </div>
                  <div className="detail-row">
                    <span>Date:</span>
                    <span>
                      {consultation.reschedulePending ? (
                        <>
                          <s>{consultation.date}</s>
                          <br />
                          <small>Proposed: {consultation.proposedDate}</small>
                        </>
                      ) : (
                        consultation.date
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Time:</span>
                    <span>
                      {consultation.reschedulePending ? (
                        <>
                          <s>{consultation.time}</s>
                          <br />
                          <small>Proposed: {consultation.proposedTime}</small>
                        </>
                      ) : (
                        consultation.time
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Type:</span>
                    <span>{consultation.type === 'video' ? 'Video Call' : 'Chat'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Reason:</span>
                    <span>{consultation.reason}</span>
                  </div>
                </div>

                {consultation.reschedulePending && (
                  <div className="reschedule-status">
                    <span className="pending-badge">Reschedule Pending</span>
                  </div>
                )}

                <div className="appointment-actions">
                  <button
                    className="manage-consultation-button"
                    onClick={() => handleManageConsultation(consultation)}
                  >
                    Manage Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedRescheduleRequest && (
        <div className="modal-overlay">
          <RescheduleRequest
            notification={selectedRescheduleRequest}
            onClose={() => setSelectedRescheduleRequest(null)}
            onAction={handleRescheduleAction}
          />
        </div>
      )}

      {selectedConsultation && (
        <div className="modal-overlay">
          <ConsultationManager
            consultation={selectedConsultation}
            onClose={() => setSelectedConsultation(null)}
          />
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentList; 