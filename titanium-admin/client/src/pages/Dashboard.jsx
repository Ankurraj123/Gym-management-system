import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  MdPeople,
  MdFitnessCenter,
  MdPayment,
  MdCalendarToday,
  MdTrendingUp,
  MdWarning,
  MdBuild,
  MdCardMembership,
  MdArrowForward,
  MdRestaurantMenu,
  MdDirectionsRun,
  MdAssessment
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CARD_THEME = [
  { color: '#14f195', bg: 'rgba(20,241,149,0.1)', icon: <MdPeople size={24} /> },
  { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <MdTrendingUp size={24} /> },
  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <MdCardMembership size={24} /> },
  { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: <MdFitnessCenter size={24} /> },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <MdCalendarToday size={24} /> },
  { color: '#14f195', bg: 'rgba(20,241,149,0.1)', icon: <MdPayment size={24} /> },
  { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: <MdWarning size={24} /> },
  { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: <MdBuild size={24} /> }
];

const PIE_COLORS = ['#3b82f6', '#14f195', '#a855f7', '#f59e0b'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass" style={{ height: '110px', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Members', value: data?.stats?.totalMembers ?? 0, link: '/admin/members' },
    { label: 'Active Members', value: data?.stats?.activeMembers ?? 0, link: '/admin/members?status=Active' },
    { label: 'Expired Memberships', value: data?.stats?.expiredMembers ?? 0, link: '/admin/members?status=Expired' },
    { label: 'Total Trainers', value: data?.stats?.totalTrainers ?? 0, link: '/admin/trainers' },
    { label: "Today's Attendance", value: data?.stats?.todayAttendance ?? 0, link: '/admin/attendance' },
    { label: 'Monthly Revenue', value: `₹${(data?.stats?.monthlyRevenue ?? 0).toLocaleString()}`, link: '/admin/payments' },
    { label: 'Pending Payments', value: data?.stats?.pendingPayments ?? 0, link: '/admin/payments' },
    { label: 'Equipment Status', value: data?.stats?.equipmentStatus || 'Operational', link: '/admin/equipment' }
  ];

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-sub">Titanium Fitness Management & Operations Control</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 8 Live Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {cards.map((c, i) => (
          <div
            key={i}
            className="glass glass-hover stat-card"
            onClick={() => navigate(c.link)}
            style={{ borderTop: `3px solid ${CARD_THEME[i].color}`, cursor: 'pointer', position: 'relative', padding: '18px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: CARD_THEME[i].color, background: CARD_THEME[i].bg, width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {CARD_THEME[i].icon}
              </div>
              <MdArrowForward size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </div>
            <div className="stat-card-val" style={{ color: CARD_THEME[i].color, marginTop: '12px', fontSize: '1.6rem', fontWeight: 800 }}>{c.value}</div>
            <div className="stat-card-label" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Operations Bar */}
      <div className="glass" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Administrative Actions</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/members')} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <MdPeople size={16} /> Manage Members
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/workouts')} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <MdDirectionsRun size={16} /> Create Workout
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/diet')} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <MdRestaurantMenu size={16} /> Diet Plans
          </button>
          <button className="btn btn-neon" onClick={() => navigate('/admin/reports')} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <MdAssessment size={16} /> Generate Reports
          </button>
        </div>
      </div>

      {/* 4 Interactive Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* 1. Monthly Revenue Area Chart */}
        <div className="glass chart-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div className="chart-title" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Monthly Revenue Trend (₹)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.revenueChart || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14f195" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14f195" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#12121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#14f195" fill="url(#rev)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Member Growth Line Chart */}
        <div className="glass chart-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div className="chart-title" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            New Member Registrations
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.memberGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#12121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="members" stroke="#a855f7" strokeWidth={3} dot={{ r: 5, fill: '#a855f7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Attendance Analytics Bar Chart */}
        <div className="glass chart-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div className="chart-title" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Weekly Attendance Analytics
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.attendanceAnalytics || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#12121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="present" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Membership Distribution Pie Chart */}
        <div className="glass chart-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div className="chart-title" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Membership Tier Distribution
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data?.membershipDistribution || []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {(data?.membershipDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#12121c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Legend formatter={(value) => <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
