import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';

function PlanModal({ plan, onClose, onSave }) {
  const [form, setForm] = useState(
    plan || {
      name: '',
      duration: 30,
      price: 1999,
      benefits: 'Gym Access\nLocker Room\nGroup Cardio Classes',
      active: true,
      color: '#14f195'
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        benefits: typeof form.benefits === 'string' ? form.benefits.split('\n').filter(Boolean) : form.benefits
      };
      if (plan?._id) {
        await api.put(`/plans/${plan._id}`, data);
      } else {
        await api.post('/plans', data);
      }
      toast.success(plan?._id ? 'Plan updated successfully!' : 'New plan created successfully!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving plan');
    } finally {
      setLoading(false);
    }
  };

  const benefitsStr = Array.isArray(form.benefits) ? form.benefits.join('\n') : form.benefits;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {plan?._id ? 'Edit Membership Plan' : 'Create New Membership Plan'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Plan Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Basic / VIP" />
            </div>
            <div className="form-group">
              <label>Duration (days) *</label>
              <input className="input" type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} required placeholder="30" />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input className="input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="1999" />
            </div>
            <div className="form-group">
              <label>Badge Color Accent</label>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: '42px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Benefits & Features (One per line)</label>
            <textarea
              className="input"
              rows={4}
              value={benefitsStr}
              onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))}
              placeholder="Gym Access&#10;Locker Room&#10;Personal Trainer"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data.plans);
    } catch {
      toast.error('Failed to load membership plans');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/plans/${deleteId}`);
      toast.success('Plan deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-sub">Configure tiers: Basic, Standard, Premium, VIP</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Create New Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {plans.map(p => (
          <div key={p._id} className="glass glass-hover" style={{ padding: '28px', borderRadius: '20px', borderTop: `4px solid ${p.color || '#14f195'}`, position: 'relative' }}>
            <div style={{ color: p.color || '#14f195', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              {p.duration} Days Plan
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>{p.name}</h2>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: p.color || '#14f195', marginBottom: '20px' }}>
              ₹{p.price?.toLocaleString()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {(p.benefits || []).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <MdCheck color={p.color || '#14f195'} size={18} /> {b}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(p)}>
                <MdEdit size={16} /> Edit
              </button>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(p._id)} title="Delete Plan">
                <MdDelete size={16} />
              </button>
            </div>

            <span className={`badge ${p.active !== false ? 'badge-success' : 'badge-gray'}`} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              {p.active !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modal && <PlanModal plan={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Confirm Plan Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete this membership plan?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
