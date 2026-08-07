import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdFitnessCenter, MdCalendarToday, MdAdd } from 'react-icons/md';

export default function RecepAppointments() {
  const [appointments, setAppointments] = useState([
    { id: 'APT-101', member: 'Jamie Nelson', trainer: 'Rohit Sharma', date: '2026-08-08', time: '05:00 PM', status: 'Scheduled' },
    { id: 'APT-102', member: 'Ankur Kumar', trainer: 'Priya Singh', date: '2026-08-08', time: '06:30 PM', status: 'Confirmed' }
  ]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [form, setForm] = useState({ member: '', trainer: 'Rohit Sharma', date: '2026-08-09', time: '10:00 AM' });

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!form.member) {
      toast.error('Please enter member name');
      return;
    }
    const newApt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      member: form.member,
      trainer: form.trainer,
      date: form.date,
      time: form.time,
      status: 'Confirmed'
    };
    setAppointments([newApt, ...appointments]);
    toast.success(`PT session booked for ${form.member} with ${form.trainer}! 🏋️‍♂️`);
    setShowBookModal(false);
    setForm({ member: '', trainer: 'Rohit Sharma', date: '2026-08-09', time: '10:00 AM' });
  };

  return (
    <div className="module-container">
      <div className="module-header-flex">
        <div>
          <h2 className="module-title">Personal Trainer Appointments & Booking</h2>
          <p className="module-subtitle">Schedule 1-on-1 PT sessions between members and trainers</p>
        </div>
        <button className="btn btn-neon-primary" onClick={() => setShowBookModal(true)}>
          <MdAdd size={18} style={{ marginRight: 6 }} /> Schedule PT Session
        </button>
      </div>

      <Card title="Scheduled PT Sessions & Appointments" icon={<MdFitnessCenter />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {appointments.map(a => (
            <div key={a.id} className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{a.id}</span>
                <span className="badge badge-success">{a.status}</span>
              </div>
              <h4 style={{ margin: '4px 0', fontSize: '1.05rem', color: '#fff' }}>Member: {a.member}</h4>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Trainer: <strong>{a.trainer}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '8px', fontWeight: 600 }}>
                📅 {a.date} at ⏰ {a.time}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Schedule Personal Training Session">
        <form onSubmit={handleBookAppointment} className="profile-form">
          <div className="form-group-custom">
            <label>Member Name *</label>
            <input type="text" value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })} required placeholder="e.g. Rahul Verma" />
          </div>
          <div className="form-group-custom">
            <label>Select Personal Trainer *</label>
            <select value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })}>
              <option value="Rohit Sharma">Rohit Sharma (Strength)</option>
              <option value="Priya Singh">Priya Singh (Crossfit & Cardio)</option>
              <option value="David Miller">David Miller (Bodybuilding & Nutrition)</option>
            </select>
          </div>
          <div className="form-group-custom">
            <label>Session Date *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group-custom">
            <label>Session Time *</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-neon-primary">Confirm Booking</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
