import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdFitnessCenter, MdEmail, MdPhone, MdCalendarToday, MdStar } from 'react-icons/md';

export default function MemberTrainer() {
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const res = await api.get('/member-portal/trainer');
        if (res.data.success && res.data.trainer) {
          setTrainer(res.data.trainer);
        }
      } catch (err) {
        console.error('Error fetching trainer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainer();
  }, []);

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!sessionDate) {
      toast.error('Please select a session date');
      return;
    }
    setBookingLoading(true);
    try {
      const res = await api.post('/member-portal/book-session', { date: sessionDate, time: sessionTime, notes });
      if (res.data.success) {
        toast.success(res.data.message);
        setModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const initials = trainer?.name
    ? trainer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'TR';

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Assigned Personal Trainer</h2>
        <p className="module-subtitle">Direct connection to your assigned gym coach</p>
      </div>

      <div className="dashboard-charts-grid">
        <Card title="Trainer Profile" badge="Assigned Coach" icon={<MdFitnessCenter />}>
          <div className="trainer-profile-card">
            <div className="trainer-avatar-large">{initials}</div>
            <div className="trainer-details">
              <h3>{trainer?.name || 'Assigned Coach'}</h3>
              <p className="trainer-spec">{trainer?.specialization || 'Strength & Conditioning'}</p>
              <div className="rating-row">
                <MdStar color="#f59e0b" size={18} />
                <span><strong>4.9</strong> (Certified Professional)</span>
              </div>
              <p className="trainer-bio">
                {trainer?.bio || 'Certified fitness trainer dedicated to guiding your workouts, form checks, and nutritional goals.'}
              </p>

              <div className="trainer-contact-list">
                <div><MdEmail className="icon" /> {trainer?.email || 'trainer@titaniumfitness.com'}</div>
                <div><MdPhone className="icon" /> {trainer?.phone || '+91 9876543210'}</div>
                <div><MdCalendarToday className="icon" /> Experience: {trainer?.experience || 5} Years</div>
              </div>

              <div className="action-buttons-row" style={{ marginTop: 20 }}>
                <button className="btn btn-neon-primary" onClick={() => setModalOpen(true)}>
                  Book 1-on-1 PT Session
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Book PT Session with ${trainer?.name || 'Coach'}`}
      >
        <form onSubmit={handleBookSession} className="modal-form">
          <div className="form-group-custom">
            <label>Preferred Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group-custom">
            <label>Preferred Time Slot</label>
            <select value={sessionTime} onChange={(e) => setSessionTime(e.target.value)}>
              <option value="07:00 AM">07:00 AM - 08:00 AM</option>
              <option value="10:00 AM">10:00 AM - 11:00 AM</option>
              <option value="05:00 PM">05:00 PM - 06:00 PM</option>
              <option value="07:00 PM">07:00 PM - 08:00 PM</option>
            </select>
          </div>

          <div className="form-group-custom">
            <label>Notes / Goal for Session</label>
            <textarea
              rows={3}
              placeholder="Form check on squats, diet review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-neon-primary full-width" disabled={bookingLoading}>
            {bookingLoading ? 'Submitting...' : 'Confirm Booking'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
