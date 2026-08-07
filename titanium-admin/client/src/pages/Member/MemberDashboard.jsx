import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  MdFitnessCenter,
  MdDirectionsRun,
  MdCalendarToday,
  MdCardMembership,
  MdCheckCircle,
  MdLocalFireDepartment,
  MdWarning,
  MdEmojiEvents,
  MdLock
} from 'react-icons/md';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePlan: user?.planName || 'Basic',
    daysLeft: 30,
    expiryDate: 'N/A',
    attendanceStreak: 0,
    workoutsCompleted: 0,
    caloriesBurned: 0
  });
  const [assignedWorkout, setAssignedWorkout] = useState(null);
  const [weightChartData, setWeightChartData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [equipmentMaintenance, setEquipmentMaintenance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/member-portal/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setAssignedWorkout(res.data.assignedWorkout);
        setAchievements(res.data.achievements || []);
        setEquipmentMaintenance(res.data.equipmentMaintenance || []);

        if (res.data.weightHistory && res.data.weightHistory.length > 0) {
          setWeightChartData(
            res.data.weightHistory.map(w => ({
              date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight: w.weight
            }))
          );
        } else {
          setWeightChartData([
            { date: 'Start', weight: res.data.stats.weight || 70 }
          ]);
        }
      }
    } catch (err) {
      console.error('Error loading member dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // 10s polling for real-time updates
    return () => clearInterval(interval);
  }, []);

  const handleMarkAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const res = await api.post('/member-portal/attendance/mark');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Equipment Maintenance Notice Banner */}
      {equipmentMaintenance.length > 0 && (
        <div className="glass" style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <MdWarning size={28} color="#ef4444" />
          <div>
            <h4 style={{ color: '#ef4444', fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>
              Equipment Maintenance Alert 🛠️
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
              The following equipment is currently undergoing maintenance: {' '}
              <strong>{equipmentMaintenance.map(e => `${e.name} (Expected: ${e.nextMaintenance ? new Date(e.nextMaintenance).toLocaleDateString() : 'Soon'})`).join(', ')}</strong>. Please consult gym staff for alternative exercise options.
            </p>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="welcome-banner glass glass-hover">
        <div className="welcome-text-group">
          <span className="badge-neon">MEMBER PORTAL</span>
          <h2>Welcome back, {user?.name || 'Athlete'}! 💪</h2>
          <p>Ready to hit your daily fitness targets? You're on a <strong>{stats.attendanceStreak}-day attendance streak!</strong></p>
        </div>
        <div className="welcome-quick-actions">
          <button className="btn btn-neon-primary" onClick={handleMarkAttendance} disabled={attendanceLoading}>
            {attendanceLoading ? 'Logging...' : 'Log Attendance Today'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <Card title="Active Membership" badge={stats.activePlan} icon={<MdCardMembership />}>
          <div className="metric-large">{stats.daysLeft} <span className="unit">Days Left</span></div>
          <p className="metric-caption">Expires: {stats.expiryDate}</p>
        </Card>

        <Card title="Attendance Streak" badge="Active" icon={<MdCalendarToday />}>
          <div className="metric-large">{stats.attendanceStreak} <span className="unit">Days</span></div>
          <p className="metric-caption">Keep up your workout consistency!</p>
        </Card>

        <Card title="Workouts Completed" badge="Total" icon={<MdDirectionsRun />}>
          <div className="metric-large">{stats.workoutsCompleted} <span className="unit">Sessions</span></div>
          <p className="metric-caption">Tracked from gym check-ins</p>
        </Card>

        <Card title="Total Calories Burned" badge="Est." icon={<MdLocalFireDepartment color="#f59e0b" />}>
          <div className="metric-large">{(stats.caloriesBurned).toLocaleString()} <span className="unit">kcal</span></div>
          <p className="metric-caption">Based on completed sessions</p>
        </Card>
      </div>

      {/* Main Grid: Chart & Today's Workout */}
      <div className="dashboard-charts-grid">
        <Card title={`Weight Progression (${stats.weight || 70} kg)`} icon={<MdFitnessCenter />}>
          <div style={{ width: '100%', height: 280, marginTop: 15 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightChartData}>
                <defs>
                  <linearGradient id="neonWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#neonWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title={assignedWorkout ? `Assigned Routine: ${assignedWorkout.title}` : "Today's Assigned Workout"}
          badge={assignedWorkout ? assignedWorkout.difficulty || 'Custom' : 'Active'}
          icon={<MdDirectionsRun />}
        >
          <div className="workout-preview-list">
            {assignedWorkout && assignedWorkout.exercises && assignedWorkout.exercises.length > 0 ? (
              assignedWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="workout-item">
                  <span className="w-check"><MdCheckCircle color="var(--accent)" size={20} /></span>
                  <div className="w-info">
                    <strong>{ex.name}</strong>
                    <p>{ex.sets} sets × {ex.reps} reps ({ex.restTime || '60s rest'})</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                No active workout routine assigned yet. Contact your trainer or admin!
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Achievements & Milestones Row */}
      {achievements.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Card title="Milestones & Achievements 🏆" badge="Dynamic Engine" icon={<MdEmojiEvents color="#f59e0b" />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
              {achievements.map(a => (
                <div key={a.id} className="glass" style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: a.unlocked ? '1px solid rgba(20, 241, 149, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: a.unlocked ? 'rgba(20, 241, 149, 0.06)' : 'rgba(15, 23, 42, 0.4)',
                  opacity: a.unlocked ? 1 : 0.6
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: a.unlocked ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {a.title}
                    </span>
                    {a.unlocked ? <MdCheckCircle color="var(--accent)" size={18} /> : <MdLock color="var(--text-muted)" size={18} />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
