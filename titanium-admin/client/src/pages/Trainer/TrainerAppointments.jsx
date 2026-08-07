import React, { useState } from 'react';
import Card from '../../components/layout/Card';
import toast from 'react-hot-toast';
import { MdEventAvailable, MdCheckCircle, MdCancel, MdSchedule } from 'react-icons/md';

export default function TrainerAppointments() {
  const [appointments, setAppointments] = useState([
    { id: 'APT-101', member: 'Jamie Nelson', date: '2026-08-08', time: '05:00 PM', source: 'Member Portal', status: 'Pending' },
    { id: 'APT-102', member: 'Ankur Kumar', date: '2026-08-09', time: '11:00 AM', source: 'Receptionist Desk', status: 'Confirmed' }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === id) {
          toast.success(`Appointment ${a.id} with ${a.member} marked as ${newStatus}!`);
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Personal Trainer Appointment Requests</h2>
        <p className="module-subtitle">Review PT session bookings requested by members and receptionists</p>
      </div>

      <Card title="Incoming PT Session Bookings" icon={<MdEventAvailable />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {appointments.map(a => (
            <div key={a.id} className="glass" style={{ padding: '18px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{a.member}</strong> <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({a.source})</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>
                  📅 Date: {a.date} • ⏰ Time: {a.time}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : a.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span>
                {a.status === 'Pending' && (
                  <>
                    <button className="btn btn-neon-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(a.id, 'Confirmed')}>
                      <MdCheckCircle size={14} style={{ marginRight: 4 }} /> Accept
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusChange(a.id, 'Rejected')}>
                      <MdCancel size={14} style={{ marginRight: 4 }} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
