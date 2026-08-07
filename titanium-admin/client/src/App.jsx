import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Shared Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Member Pages
import MemberDashboard from './pages/Member/MemberDashboard';
import MemberWorkout from './pages/Member/MemberWorkout';
import MemberDiet from './pages/Member/MemberDiet';
import MemberAttendance from './pages/Member/MemberAttendance';
import MemberTrainer from './pages/Member/MemberTrainer';
import MemberMembership from './pages/Member/MemberMembership';
import MemberPayments from './pages/Member/MemberPayments';
import MemberProfile from './pages/Member/MemberProfile';

// Admin Pages
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Trainers from './pages/Trainers';
import Plans from './pages/Plans';
import Workouts from './pages/Workouts';
import Diet from './pages/Diet';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Equipment from './pages/Equipment';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import './index.css';

// Receptionist Pages
import RecepDashboard from './pages/Recep/RecepDashboard';
import RecepMembers from './pages/Recep/RecepMembers';
import RecepMembership from './pages/Recep/RecepMembership';
import RecepPayments from './pages/Recep/RecepPayments';
import RecepAttendance from './pages/Recep/RecepAttendance';
import RecepAppointments from './pages/Recep/RecepAppointments';

// Trainer Pages
import TrainerDashboard from './pages/Trainer/TrainerDashboard';
import TrainerMembers from './pages/Trainer/TrainerMembers';
import TrainerWorkouts from './pages/Trainer/TrainerWorkouts';
import TrainerDiet from './pages/Trainer/TrainerDiet';
import TrainerAppointments from './pages/Trainer/TrainerAppointments';
import TrainerMessages from './pages/Trainer/TrainerMessages';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="init-screen">
        <div className="neon-spinner-large" />
        <p>Initializing Titanium Fitness System...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  const isAllowed =
    user.role === allowedRole ||
    (allowedRole === 'receptionist' && (role === 'recep' || role === 'receptionist')) ||
    (allowedRole === 'trainer' && role === 'trainer');

  if (allowedRole && !isAllowed) {
    let redirectPath = '/member/dashboard';
    if (role === 'admin') redirectPath = '/admin/dashboard';
    if (role === 'receptionist' || role === 'recep') redirectPath = '/recep/dashboard';
    if (role === 'trainer') redirectPath = '/trainer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d111a',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.9rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }
          }}
        />

        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Trainer Protected Routes */}
          <Route path="/trainer" element={<ProtectedRoute allowedRole="trainer"><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="members" element={<TrainerMembers />} />
            <Route path="workouts" element={<TrainerWorkouts />} />
            <Route path="diet" element={<TrainerDiet />} />
            <Route path="appointments" element={<TrainerAppointments />} />
            <Route path="messages" element={<TrainerMessages />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>

          {/* Receptionist Protected Routes */}
          <Route path="/recep" element={<ProtectedRoute allowedRole="receptionist"><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecepDashboard />} />
            <Route path="members" element={<RecepMembers />} />
            <Route path="membership" element={<RecepMembership />} />
            <Route path="payments" element={<RecepPayments />} />
            <Route path="attendance" element={<RecepAttendance />} />
            <Route path="appointments" element={<RecepAppointments />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>

          {/* Member Protected Routes */}
          <Route path="/member" element={<ProtectedRoute allowedRole="member"><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="workout" element={<MemberWorkout />} />
            <Route path="diet" element={<MemberDiet />} />
            <Route path="attendance" element={<MemberAttendance />} />
            <Route path="trainer" element={<MemberTrainer />} />
            <Route path="membership" element={<MemberMembership />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="plans" element={<Plans />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="diet" element={<Diet />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="payments" element={<Payments />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
