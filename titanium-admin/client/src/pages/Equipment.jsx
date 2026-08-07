import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdWarning, MdClose, MdBuild } from 'react-icons/md';

function EquipModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      name: '',
      category: 'Cardio',
      condition: 'Good',
      status: 'Active',
      quantity: 1,
      notes: '',
      nextMaintenance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    }
  );
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (item?._id) {
        await api.put(`/equipment/${item._id}`, form);
      } else {
        await api.post('/equipment', form);
      }
      toast.success('Equipment record saved!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '550px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {item?._id ? 'Edit Equipment Details' : 'Add New Gym Equipment'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Equipment Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Treadmill Pro X" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option>Cardio</option>
                <option>Strength</option>
                <option>Flexibility</option>
                <option>Free Weights</option>
                <option>Machines</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input className="input" type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select className="input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option>
                <option>Under Maintenance</option>
                <option>Out of Service</option>
              </select>
            </div>
            <div className="form-group">
              <label>Next Maintenance Date</label>
              <input className="input" type="date" value={form.nextMaintenance?.split('T')[0] || ''} onChange={e => set('nextMaintenance', e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Notes / Service Remarks</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Regular belt lubricated..." />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Saving...' : 'Save Equipment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const COND_COLORS = { Excellent: '#14f195', Good: '#3b82f6', Fair: '#f59e0b', Poor: '#ef4444' };
const STATUS_BADGE = { Active: 'badge-success', 'Under Maintenance': 'badge-warning', 'Out of Service': 'badge-danger' };

export default function Equipment() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/equipment');
      setItems(res.data.equipment || []);
    } catch {
      toast.error('Failed to load equipment inventory');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/equipment/${deleteId}`);
      toast.success('Equipment removed from system');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete equipment');
    }
  };

  const needsMaintenance = items.filter(
    i => i.nextMaintenance && new Date(i.nextMaintenance) <= new Date(Date.now() + 7 * 86400000)
  );

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Equipment Inventory</h1>
          <p className="page-sub">{items.length} gym machines & free weights</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Add New Equipment
        </button>
      </div>

      {needsMaintenance.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MdWarning color="#f59e0b" size={22} />
          <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
            {needsMaintenance.length} equipment item(s) require maintenance inspection soon: {needsMaintenance.map(i => i.name).join(', ')}
          </span>
        </div>
      )}

      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Next Maintenance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No equipment recorded yet.
                  </td>
                </tr>
              ) : (
                items.map(i => (
                  <tr key={i._id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{i.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{i.category}</td>
                    <td style={{ fontWeight: 700 }}>{i.quantity || 1}</td>
                    <td>
                      <span style={{ color: COND_COLORS[i.condition] || '#14f195', fontWeight: 700, fontSize: '0.85rem' }}>
                        ● {i.condition}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[i.status] || 'badge-gray'}`}>{i.status}</span>
                    </td>
                    <td style={{ color: i.nextMaintenance && new Date(i.nextMaintenance) <= new Date() ? '#ef4444' : 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {i.nextMaintenance ? new Date(i.nextMaintenance).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(i)} title="Edit Equipment">
                          <MdEdit size={16} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(i._id)} title="Delete Equipment">
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <EquipModal item={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Delete Equipment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to remove this equipment from the inventory?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Remove Equipment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
