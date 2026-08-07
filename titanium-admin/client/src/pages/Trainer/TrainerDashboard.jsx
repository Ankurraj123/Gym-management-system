import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  MdPeople,
  MdFitnessCenter,
  MdDirectionsRun,
  MdAssessment,
  MdCheckCircle,
  MdEventAvailable
} from 'react-icons/md';

export default function TrainerDashboard() {
  const [stats, setStats] = useState({
    assignedMembers: 8,
    todaySessions: 3,
    pendingWorkouts: 2,
    completionRate: '92%'
  });
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([
    { id: 'SESS-101', member: 'Jamie Nelson', time: '09:00 AM', plan: 'Hypertrophy Chest & Triceps', status: 'Completed' },
    { id: 'SESS-102', member: 'Ankur Kumar', time: '11:30 AM', plan: 'Legs & Core Conditioning', status: 'Upcoming' },
    { id: 'SESS-103', member: 'Rahul Verma', time: '05:00 PM', plan: 'HIIT Cardio Blast', status: 'Upcoming' }
  ]);

  useEffect(() => {
    // Simulated data fetching from MongoDB backend
    setLoading(false);
  }, []);

  const handleMarkSessionComplete = (id) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === id) {
          toast.success(`Session ${s.id} with ${s.member} marked complete! 🔥`);
          return { ...s, status: 'Completed' };
        }
        return s;
      })
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header-flex">
        <div>
          <h2 className="module-title">Personal Trainer Dashboard</h2>
          <p className="module-subtitle">Manage assigned members, design routines, track progress, and run PT sessions</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <Card title="Assigned Members" badge="Active Clients" icon={<MdPeople color="var(--accent)" />}>
          <div className="metric-large">{stats.assignedMembers} <span className="unit">Clients</span></div>
          <p className="metric-caption">Under your personal coaching</p>
        </Card>

        <Card title="Today's PT Sessions" badge="Schedule" icon={<MdEventAvailable color="#3b82f6" />}>
          <div className="metric-large">{stats.todaySessions} <span className="unit">Bookings</span></div>
          <p className="metric-caption">1-on-1 personal training sessions</p>
        </Card>

        <Card title="Pending Workouts" badge="Review" icon={<MdDirectionsRun color="#f59e0b" />}>
          <div className="metric-large">{stats.pendingWorkouts} <span className="unit">Plans</span></div>
          <p className="metric-caption">Member workout updates</p>
        </Card>

        <Card title="Client Progress Rate" badge="High" icon={<MdAssessment color="#a855f7" />}>
          <div className="metric-large">{stats.completionRate}</div>
          <p className="metric-caption">Routine adherence score</p>
        </Card>
      </div>

      {/* Today's Schedule Card */}
      <div style={{ marginTop: '25px' }}>
        <Card title="Today's Personal Training Schedule" icon={<MdFitnessCenter />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {sessions.map(s => (
              <div key={s.id} className="glass" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{s.member}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Routine: <strong>{s.plan}</strong> • Scheduled: <span style={{ color: 'var(--accent)' }}>{s.time}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${s.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span>
                  {s.status !== 'Completed' && (
                    <button className="btn btn-neon-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleMarkSessionComplete(s.id)}>
                      Mark Complete ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
