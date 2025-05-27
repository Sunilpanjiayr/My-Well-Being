import React, { useState } from 'react';
import { db } from '../../Auth/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import './RescheduleRequest.css';

const RescheduleRequest = ({ notification, onClose, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    setLoading(true);
    setError('');

    try {
      // Update the consultation with the reschedule status
      const consultationRef = doc(db, 'consultations', notification.consultationId);
      const consultationUpdate = {
        reschedulePending: action === 'rejected',
        rescheduleStatus: action,
        lastUpdated: serverTimestamp()
      };

      if (action === 'accepted') {
        consultationUpdate.date = notification.proposedDate;
        consultationUpdate.time = notification.proposedTime;
        consultationUpdate.reschedulePending = false;
      }

      await updateDoc(consultationRef, consultationUpdate);

      // Create a notification for the doctor
      await addDoc(collection(db, 'notifications'), {
        userId: notification.doctorId,
        type: 'reschedule_response',
        title: `Reschedule Request ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: `Patient has ${action} the reschedule request for consultation on ${notification.proposedDate} at ${notification.proposedTime}.`,
        consultationId: notification.consultationId,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      // Update the original notification
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, {
        status: 'read',
        actionTaken: action,
        actionDate: serverTimestamp()
      });

      onAction && onAction(action);
      onClose && onClose();

    } catch (err) {
      console.error('Error handling reschedule action:', err);
      setError(`Failed to ${action} reschedule request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reschedule-request">
      <div className="reschedule-request-header">
        <h3>Reschedule Request</h3>
        <button onClick={onClose} className="close-button" aria-label="Close">×</button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="reschedule-request-content">
        <div className="request-details">
          <p className="request-message">{notification.message}</p>
          
          <div className="time-details">
            <div className="detail-row">
              <span>Current Date:</span>
              <span className="current-time">{notification.currentDate}</span>
            </div>
            <div className="detail-row">
              <span>Current Time:</span>
              <span className="current-time">{notification.currentTime}</span>
            </div>
            <div className="arrow">↓</div>
            <div className="detail-row">
              <span>Proposed Date:</span>
              <span className="proposed-time">{notification.proposedDate}</span>
            </div>
            <div className="detail-row">
              <span>Proposed Time:</span>
              <span className="proposed-time">{notification.proposedTime}</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="accept-button"
            onClick={() => handleAction('accepted')}
            disabled={loading}
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          <button
            className="reject-button"
            onClick={() => handleAction('rejected')}
            disabled={loading}
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleRequest; 