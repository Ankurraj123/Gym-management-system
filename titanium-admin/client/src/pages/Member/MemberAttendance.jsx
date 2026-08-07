import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Table from '../../components/layout/Table';
import Modal from '../../components/layout/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdCalendarToday, MdCheckCircle, MdQrCodeScanner, MdCropFree } from 'react-icons/md';

export default function MemberAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [todayMarked, setTodayMarked] = useState(false);
  const [totalPresent, setTotalPresent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/member-portal/attendance');
      if (res.data.success) {
        setLogs(res.data.history || []);
        setTodayMarked(res.data.todayMarked);
        setTotalPresent(res.data.totalPresent);
        setStreak(res.data.streak);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    if (todayMarked) {
      toast.error('You have already logged your attendance for today!');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/member-portal/attendance/mark');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAttendance();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const memberCode = user?.memberId || user?.email || user?.id || 'TF-1001';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(memberCode)}&color=14f195&bgcolor=080b12`;

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    { header: 'Check In Time', accessor: 'checkInTime', render: (row) => row.checkInTime || '07:30 AM' },
    { header: 'Status', accessor: 'status', render: () => <span className="badge badge-success">Present</span> }
  ];

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
          <h2 className="module-title">Attendance & Check-in History</h2>
          <p className="module-subtitle">Keep your streak high by checking in every session or showing your QR Pass</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-dark" onClick={() => setShowQrModal(true)}>
            <MdCropFree size={20} style={{ marginRight: 6 }} /> My QR Pass
          </button>
          <button
            className={`btn ${todayMarked ? 'btn-dark' : 'btn-neon-primary'}`}
            onClick={handleCheckIn}
            disabled={actionLoading}
          >
            <MdQrCodeScanner size={20} style={{ marginRight: 8 }} />
            {actionLoading ? 'Logging...' : (todayMarked ? 'Checked In Today ✓' : 'Instant Check-In')}
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <Card title="Current Streak" badge="Active" icon={<MdCheckCircle color="var(--accent)" />}>
          <div className="metric-large">{streak} <span className="unit">Days</span></div>
        </Card>

        <Card title="Total Check-Ins" badge="History" icon={<MdCalendarToday />}>
          <div className="metric-large">{totalPresent} <span className="unit">Visits</span></div>
        </Card>
      </div>

      <Card title="Recent Check-in Logs" icon={<MdCalendarToday />}>
        {logs.length > 0 ? (
          <Table columns={columns} data={logs} searchable={false} />
        ) : (
          <p style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No attendance records logged yet. Click "Instant Check-In" to mark your attendance!
          </p>
        )}
      </Card>

      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="Digital Gym Entry QR Pass">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{
            background: '#080b12',
            padding: '20px',
            borderRadius: '16px',
            display: 'inline-block',
            border: '1.5px solid var(--accent)',
            boxShadow: '0 0 25px rgba(20, 241, 149, 0.2)'
          }}>
            <img src={qrUrl} alt="Member QR Code Pass" style={{ borderRadius: '8px', width: '200px', height: '200px' }} />
          </div>
          <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
            {user?.name || 'Titanium Member'}
          </div>
          <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}>
            ID: {memberCode}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
            Show this QR Code at reception for scanner verification.
          </p>
        </div>
      </Modal>
    </div>
  );
}
