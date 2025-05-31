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
  getDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import DoctorAppointmentList from '../consultation/DoctorAppointmentList';
import ConsultationManager from '../consultation/ConsultationManager';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingConsultations: 0,
    totalPatients: 0,
    activeConsultations: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const user = auth.currentUser;
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationManager, setShowConsultationManager] = useState(false);
  const navigate = useNavigate();
  const [doctorAvatarUrl, setDoctorAvatarUrl] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear any local storage if needed
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

          // Get unique patient count
          const uniquePatients = new Set(appointments.map(apt => apt.patientId));
          const totalPatients = uniquePatients.size;

          setStats(prev => ({
            ...prev,
            todayAppointments,
            pendingConsultations: pendingCount,
            activeConsultations: inProgressCount,
            totalPatients
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

  useEffect(() => {
    if (!user) return;
    const fetchDoctorAvatar = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'doctors', user.uid));
        if (docSnap.exists() && docSnap.data().avatarUrl) {
          setDoctorAvatarUrl(docSnap.data().avatarUrl);
        } else {
          setDoctorAvatarUrl(null);
        }
      } catch (error) {
        setDoctorAvatarUrl(null);
      }
    };
    fetchDoctorAvatar();
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
      {/* Header with user info and controls */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="user-info">
            <div className="user-avatar">
              {doctorAvatarUrl ? (
                <img src={doctorAvatarUrl} alt={user?.displayName || 'Doctor'} style={{ width: 48, height: 48, borderRadius: '50%' }} />
              ) : (
                user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'D'
              )}
            </div>
            <div className="user-details">
              <h1>Hello, Dr. {user?.displayName || 'Doctor'}!</h1>
              <p>Track your patients, appointments, and medical services.</p>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon today">
            📅
          </div>
          <div className="stat-info">
            <h3>TODAY'S APPOINTMENTS</h3>
            <p className="stat-number">{stats.todayAppointments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            ⏳
          </div>
          <div className="stat-info">
            <h3>PENDING CONSULTATIONS</h3>
            <p className="stat-number">{stats.pendingConsultations}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon patients">
            👥
          </div>
          <div className="stat-info">
            <h3>TOTAL PATIENTS</h3>
            <p className="stat-number">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            💚
          </div>
          <div className="stat-info">
            <h3>ACTIVE CONSULTATIONS</h3>
            <p className="stat-number">{stats.activeConsultations}</p>
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

        {/* Health Features Section */}
        <div className="health-features">
          <h2>Medical Tools</h2>
          <div className="features-grid">
            <Link to="/doctor/patients" className="feature-card">
            
              <div className="feature-icon">
                📋
              </div>
              <h3>Patient Records</h3>
              <p>Manage and view patient medical records</p>
            </Link>

            <Link to="/doctor/schedule" className="feature-card">
              <div className="feature-icon">
                🕒
              </div>
              <h3>Update Schedule</h3>
              <p>Manage your availability and time slots</p>
            </Link>

            <Link to="/doctor/forum" className="feature-card">
              <div className="feature-icon">
                💬
              </div>
              <h3>View Forum</h3>
              <p>Participate in medical discussions</p>
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