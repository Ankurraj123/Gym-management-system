import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdDownload, MdSearch, MdClose, MdQrCodeScanner } from 'react-icons/md';

function ScanQRModal({ onClose, onSave }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!code) return toast.error('Please enter or scan a Member ID / QR Code');
    setLoading(true);
    try {
      const res = await api.post('/attendance/scan-qr', { code });
      if (res.data.success) {
        toast.success(res.data.message);
        onSave();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process QR check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '420px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdQrCodeScanner size={24} color="var(--accent)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Reception QR Check-In</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleScanSubmit}>
          <div className="form-group">
            <label>Scan QR Code or Type Member ID / Email *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. TF-1001 or member@gmail.com"
              value={code}
              onChange={e => setCode(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Mark Present'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MarkAttendanceModal({ onClose, onSave }) {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [checkInTime, setCheckInTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/members?limit=100').then(res => setMembers(res.data.members || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId) return toast.error('Please select a member');
    setLoading(true);
    try {
      const selectedMember = members.find(m => m._id === memberId);
      await api.post('/attendance', {
        member: memberId,
        memberName: selectedMember?.name || 'Member',
        date,
        status,
        checkInTime
      });
      toast.success('Attendance recorded successfully!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Mark Member Attendance</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Member *</label>
            <select className="input" value={memberId} onChange={e => setMemberId(e.target.value)} required>
              <option value="">-- Select Gym Member --</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.memberId})</option>
              ))}
            </select>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Check-In Time</label>
              <input className="input" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} placeholder="08:30 AM" />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Attendance Status</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Saving...' : 'Save Attendance'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ todayPresent: 0, todayAbsent: 0, todayLate: 0 });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/attendance', { params: { date } });
      setRecords(res.data.records || []);
      setStats({
        todayPresent: res.data.todayPresent || 0,
        todayAbsent: res.data.todayAbsent || 0,
        todayLate: (res.data.records || []).filter(r => r.status === 'Late').length
      });
    } catch {
      toast.error('Failed to load attendance records');
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  const filteredRecords = records.filter(r => {
    const name = r.member?.name || r.memberName || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const exportCSV = () => {
    if (records.length === 0) return toast.error('No attendance records to export');
    const headers = ['Member Name', 'Date', 'Status', 'Check-In Time'];
    const rows = records.map(r => [
      `"${r.member?.name || r.memberName || ''}"`,
      r.date,
      r.status,
      `"${r.checkInTime || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance CSV exported!');
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const attendanceRate = records.length ? Math.round((presentCount / records.length) * 100) : 100;

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Attendance Tracker & Analytics</h1>
          <p className="page-sub">Monitor member check-ins & scan QR passes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <MdDownload size={18} /> Export CSV
          </button>
          <button className="btn btn-dark" onClick={() => setShowScanModal(true)}>
            <MdQrCodeScanner size={18} style={{ marginRight: 6 }} /> Scan QR Pass
          </button>
          <button className="btn btn-neon" onClick={() => setShowMarkModal(true)}>
            <MdAdd size={18} /> Mark Attendance
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: "Today's Present", value: stats.todayPresent || presentCount, color: '#14f195' },
          { label: "Today's Absent", value: stats.todayAbsent, color: '#ef4444' },
          { label: "Today's Late Check-Ins", value: stats.todayLate, color: '#f59e0b' },
          { label: 'Monthly Attendance %', value: `${attendanceRate}%`, color: '#3b82f6' }
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: '20px', borderRadius: '16px', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="search-bar" style={{ minWidth: '260px' }}>
          <MdSearch size={18} color="var(--text-muted)" />
          <input placeholder="Search member by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Date:</label>
          <input type="date" className="input" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check-In Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No attendance records logged for this date.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.member?.name || r.memberName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.date}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-success' : r.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.checkInTime || '08:30 AM'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showScanModal && <ScanQRModal onClose={() => setShowScanModal(false)} onSave={() => { setShowScanModal(false); load(); }} />}
      {showMarkModal && <MarkAttendanceModal onClose={() => setShowMarkModal(false)} onSave={() => { setShowMarkModal(false); load(); }} />}
    </div>
  );
}
