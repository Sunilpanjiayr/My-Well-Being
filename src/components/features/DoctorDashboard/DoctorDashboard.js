import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Auth/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc 
} from 'firebase/firestore';
import { useTheme } from '../../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import './DoctorDashboard.css';
import DoctorAppointmentList from '../consultation/DoctorAppointmentList';
import ConsultationManager from '../consultation/ConsultationManager';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingConsultations: 0,
    totalPatients: 0,
    unreadMessages: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const user = auth.currentUser;
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationManager, setShowConsultationManager] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get today's date at end of day
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Query for all active appointments (pending, confirmed, in-progress)
        const appointmentsRef = collection(db, 'consultations');
        const activeAppointmentsQuery = query(
          appointmentsRef,
          where('doctorId', '==', user.uid),
          where('status', 'in', ['pending', 'confirmed', 'in-progress'])
        );
        
        // Set up real-time listener for appointments
        const unsubscribe = onSnapshot(activeAppointmentsQuery, (snapshot) => {
          const appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            formattedStartedAt: doc.data().startedAt ? new Date(doc.data().startedAt.seconds * 1000).toLocaleString() : null
          }));

          // Sort appointments:
          // 1. In-progress first
          // 2. Today's appointments next
          // 3. Future appointments by date and time
          appointments.sort((a, b) => {
            // In-progress appointments come first
            if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
            if (a.status !== 'in-progress' && b.status === 'in-progress') return 1;

            // Then sort by date and time
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA - dateB;
          });

          setUpcomingAppointments(appointments);

          // Update stats
          const todayAppointments = appointments.filter(apt => 
            apt.date === today.toISOString().split('T')[0]
          ).length;

          const pendingCount = appointments.filter(apt => 
            apt.status === 'pending'
          ).length;

          const inProgressCount = appointments.filter(apt => 
            apt.status === 'in-progress'
          ).length;

          setStats(prev => ({
            ...prev,
            todayAppointments,
            pendingConsultations: pendingCount,
            inProgressConsultations: inProgressCount
          }));

          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleManageConsultation = (appointment) => {
    setSelectedConsultation(appointment);
    setShowConsultationManager(true);
  };

  if (loading) {
    return (
      <div className={`doctor-dashboard ${darkMode ? 'dark' : ''}`}>
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`doctor-dashboard ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <h1>Welcome back, Dr. {user?.displayName || 'Doctor'}</h1>
        <p>Manage your patients, appointments, and medical services</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon today">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-info">
            <h3>Today's Appointments</h3>
            <p className="stat-number">{stats.todayAppointments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-user-clock"></i>
          </div>
          <div className="stat-info">
            <h3>Pending Consultations</h3>
            <p className="stat-number">{stats.pendingConsultations}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon patients">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Total Patients</h3>
            <p className="stat-number">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon messages">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="stat-info">
            <h3>Unread Messages</h3>
            <p className="stat-number">{stats.unreadMessages}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="appointments-section">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/doctor/appointments" className="view-all">
              View All
            </Link>
          </div>

          <div className="appointments-list">
            {upcomingAppointments.length === 0 ? (
              <div className="no-appointments">
                <p>No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="appointment-card"
                  data-status={appointment.status}
                >
                  <div className="appointment-avatar">
                    {appointment.patientAvatar ? (
                      <img src={appointment.patientAvatar} alt={appointment.patientName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {appointment.patientName ? appointment.patientName.charAt(0).toUpperCase() : 'P'}
                      </div>
                    )}
                  </div>
                  <div className="appointment-info">
                    <h3>{appointment.patientName}</h3>
                    <p className="appointment-specialty">{appointment.reason}</p>
                    <div className="appointment-meta">
                      <span className="appointment-date">
                        {formatDate(appointment.date)}
                      </span>
                      <span className="appointment-time">{appointment.time}</span>
                      <span className={`appointment-type ${appointment.type}`}>
                        {appointment.type}
                      </span>
                      <span className={`appointment-status ${appointment.status}`}>
                        {appointment.status}
                      </span>
                      {appointment.startedAt && (
                        <span className="started-at">
                          Started: {appointment.formattedStartedAt}
                        </span>
                      )}
                    </div>
                    <button 
                      className="manage-consultation-btn"
                      onClick={() => handleManageConsultation(appointment)}
                    >
                      {appointment.status === 'in-progress' ? 'Continue Consultation' : 'Manage Consultation'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/doctor/consultations" className="action-card start-consultation">
              <div className="action-icon">
                <i className="fas fa-video"></i>
              </div>
              <span>Start Consultation</span>
            </Link>

            <Link to="/doctor/prescriptions" className="action-card write-prescription">
              <div className="action-icon">
                <i className="fas fa-prescription"></i>
              </div>
              <span>Write Prescription</span>
            </Link>

            <Link to="/doctor/schedule" className="action-card update-schedule">
              <div className="action-icon">
                <i className="fas fa-clock"></i>
              </div>
              <span>Update Schedule</span>
            </Link>

            <Link to="/doctor/forum" className="action-card view-forum">
              <div className="action-icon">
                <i className="fas fa-comments"></i>
              </div>
              <span>View Forum</span>
            </Link>
          </div>
        </div>
      </div>

      {showConsultationManager && selectedConsultation && (
        <div className="modal-overlay">
          <ConsultationManager
            consultation={selectedConsultation}
            onClose={() => {
              setShowConsultationManager(false);
              setSelectedConsultation(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard; 