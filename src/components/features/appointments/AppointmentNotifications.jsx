import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import './AppointmentNotifications.css';

const AppointmentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Subscribe to notifications (both reschedule and consultation start)
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('status', '==', 'unread'),
      where('type', 'in', ['reschedule_request', 'consultation_started'])
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      try {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(notificationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRescheduleAction = async (notification, action) => {
    try {
      // Update the consultation with the reschedule status
      const consultationRef = doc(db, 'consultations', notification.consultationId);
      const consultationUpdate = {
        reschedulePending: false,
        rescheduleStatus: action,
        lastUpdated: serverTimestamp()
      };

      if (action === 'accepted') {
        // If accepted, update to new date and time
        consultationUpdate.date = notification.proposedDate;
        consultationUpdate.time = notification.proposedTime;
      }

      await updateDoc(consultationRef, consultationUpdate);

      // Create a notification for the doctor
      await addDoc(collection(db, 'notifications'), {
        userId: notification.doctorId,
        type: 'reschedule_response',
        title: `Reschedule Request ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: action === 'accepted' 
          ? `Patient has accepted the reschedule request. Consultation rescheduled to ${notification.proposedDate} at ${notification.proposedTime}.`
          : `Patient has rejected the reschedule request. Consultation remains scheduled for ${notification.currentDate} at ${notification.currentTime}.`,
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

    } catch (err) {
      console.error('Error handling reschedule action:', err);
      setError(`Failed to ${action} reschedule request. Please try again.`);
    }
  };

  const handleJoinConsultation = async (notification) => {
    try {
      // Mark notification as read
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, {
        status: 'read',
        actionTaken: 'joined',
        actionDate: serverTimestamp()
      });

      // Redirect to consultation room
      window.location.href = `/consultation-room/${notification.roomId}`;
    } catch (err) {
      console.error('Error joining consultation:', err);
      setError('Failed to join consultation. Please try again.');
    }
  };

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-error">{error}</div>;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="appointment-notifications">
      <h3>Notifications</h3>
      <div className="notifications-list">
        {notifications.map(notification => (
          <div key={notification.id} className="notification-card">
            <div className="notification-content">
              <div className="notification-header">
                <h4>{notification.title || 'Reschedule Request'}</h4>
                <span className="notification-time">
                  {new Date(notification.createdAt?.toDate()).toLocaleString()}
                </span>
              </div>
              <p>{notification.message}</p>
              
              {notification.type === 'reschedule_request' && (
                <>
                  <div className="time-details">
                    <div className="time-row">
                      <span>Current:</span>
                      <span>{notification.currentDate} at {notification.currentTime}</span>
                    </div>
                    <div className="time-row">
                      <span>Proposed:</span>
                      <span>{notification.proposedDate} at {notification.proposedTime}</span>
                    </div>
                    {notification.rescheduleMessage && (
                      <div className="reschedule-message">
                        <p>Reason: {notification.rescheduleMessage}</p>
                      </div>
                    )}
                  </div>
                  <div className="notification-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleRescheduleAction(notification, 'accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleRescheduleAction(notification, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {notification.type === 'consultation_started' && (
                <div className="notification-actions">
                  <button
                    className="join-button"
                    onClick={() => handleJoinConsultation(notification)}
                  >
                    Join Now
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentNotifications; 