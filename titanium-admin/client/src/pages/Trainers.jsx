import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdPeople, MdClose, MdAssignmentInd } from 'react-icons/md';

function TrainerModal({ trainer, onClose, onSave }) {
  const [form, setForm] = useState(
    trainer || {
      name: '',
      email: '',
      phone: '',
      specialization: 'Strength & Conditioning',
      experience: 3,
      salary: 30000,
      status: 'Active',
      bio: ''
    }
  );
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (trainer?._id) {
        await api.put(`/trainers/${trainer._id}`, form);
      } else {
        await api.post('/trainers', form);
      }
      toast.success(trainer?._id ? 'Trainer updated successfully!' : 'Trainer added successfully!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving trainer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '550px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {trainer?._id ? 'Edit Trainer Details' : 'Add New Trainer'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Trainer Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Rohit Sharma" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="rohit@tf.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876541111" />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input className="input" value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="Crossfit / Yoga / Strength" />
            </div>
            <div className="form-group">
              <label>Experience (Years)</label>
              <input className="input" type="number" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="5" />
            </div>
            <div className="form-group">
              <label>Monthly Salary (₹)</label>
              <input className="input" type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="35000" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>
              {loading ? 'Saving...' : 'Save Trainer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignMembersModal({ trainer, onClose, onSave }) {
  const [membersList, setMembersList] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/members?limit=100').then(res => setMembersList(res.data.members || [])).catch(() => {});
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error('Please select a member');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/trainers/${trainer._id}/assign`, { memberId: selectedMemberId });
      toast.success('Member assigned to trainer!');
      onSave();
    } catch {
      toast.error('Failed to assign member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '450px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Assign Member to {trainer.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleAssign}>
          <div className="form-group">
            <label>Select Member</label>
            <select className="input" value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} required>
              <option value="">-- Choose Member --</option>
              {membersList.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.memberId}) — {m.planName}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Currently assigned ({trainer.assignedMembers?.length || 0}):
            <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
              {trainer.assignedMembers?.map(m => (
                <li key={m._id || m}>{m.name || m}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [modal, setModal] = useState(null);
  const [assignTrainer, setAssignTrainer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/trainers');
      setTrainers(res.data.trainers);
    } catch {
      toast.error('Failed to load trainers');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/trainers/${deleteId}`);
      toast.success('Trainer removed');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete trainer');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Trainers Management</h1>
          <p className="page-sub">{trainers.length} certified fitness coaches</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Add New Trainer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {trainers.map(t => (
          <div key={t._id} className="glass glass-hover" style={{ padding: '24px', borderRadius: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(20,241,149,0.15)',
                  border: '2px solid var(--neon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--neon)',
                  fontWeight: 800,
                  fontSize: '1.4rem'
                }}
              >
                {t.name[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t.name}</h3>
                <div style={{ color: 'var(--neon)', fontSize: '0.85rem', fontWeight: 600 }}>{t.specialization}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <div>📧 {t.email}</div>
              <div>📞 {t.phone || 'N/A'}</div>
              <div>⏳ {t.experience} years experience</div>
              <div>💰 ₹{t.salary?.toLocaleString()}/month</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>
                <MdPeople color="var(--neon)" size={16} /> {t.assignedMembers?.length || 0} members assigned
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <span className={`badge ${t.status === 'Active' ? 'badge-success' : 'badge-gray'}`}>{t.status || 'Active'}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setAssignTrainer(t)} title="Assign Members">
                  <MdAssignmentInd size={16} color="var(--neon)" />
                </button>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(t)} title="Edit Trainer">
                  <MdEdit size={16} />
                </button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(t._id)} title="Delete Trainer">
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && <TrainerModal trainer={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {/* Assign Members Modal */}
      {assignTrainer && <AssignMembersModal trainer={assignTrainer} onClose={() => setAssignTrainer(null)} onSave={() => { setAssignTrainer(null); load(); }} />}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Confirm Trainer Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to remove this trainer from the system?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Remove Trainer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
