import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdRestaurantMenu, MdClose, MdAssignmentInd } from 'react-icons/md';

function DietModal({ diet, onClose, onSave }) {
  const [form, setForm] = useState(
    diet || {
      name: '',
      goal: 'Muscle Gain',
      breakfast: '',
      lunch: '',
      dinner: '',
      snacks: '',
      calories: 2500,
      protein: 160,
      carbs: 250,
      fat: 65
    }
  );
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (diet?._id) {
        await api.put(`/diet/${diet._id}`, form);
      } else {
        await api.post('/diet', form);
      }
      toast.success(diet?._id ? 'Diet plan updated!' : 'Diet plan created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving diet plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '650px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {diet?._id ? 'Edit Nutrition & Diet Plan' : 'Create Nutrition & Diet Plan'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Plan Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="High Protein Lean Bulk" />
            </div>
            <div className="form-group">
              <label>Goal</label>
              <select className="input" value={form.goal} onChange={e => set('goal', e.target.value)}>
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
                <option>Keto</option>
                <option>Vegan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target Calories (kcal)</label>
              <input className="input" type="number" value={form.calories} onChange={e => set('calories', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input className="input" type="number" value={form.protein} onChange={e => set('protein', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input className="input" type="number" value={form.carbs} onChange={e => set('carbs', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fat (g)</label>
              <input className="input" type="number" value={form.fat} onChange={e => set('fat', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group">
              <label>Breakfast Menu</label>
              <input className="input" value={form.breakfast} onChange={e => set('breakfast', e.target.value)} placeholder="Oats, 4 Egg Whites, Banana Shake" />
            </div>
            <div className="form-group">
              <label>Lunch Menu</label>
              <input className="input" value={form.lunch} onChange={e => set('lunch', e.target.value)} placeholder="Grilled Chicken Breast / Paneer, Brown Rice, Salad" />
            </div>
            <div className="form-group">
              <label>Dinner Menu</label>
              <input className="input" value={form.dinner} onChange={e => set('dinner', e.target.value)} placeholder="Fish / Tofu, Sweet Potato, Veggie Soup" />
            </div>
            <div className="form-group">
              <label>Snacks & Drinks</label>
              <input className="input" value={form.snacks} onChange={e => set('snacks', e.target.value)} placeholder="Whey Protein, Almonds, Greek Yogurt" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Saving...' : 'Save Diet Plan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignDietModal({ diet, onClose, onSave }) {
  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(diet.assignedMembers?.map(m => m._id || m) || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/members?limit=100').then(res => setMembers(res.data.members || [])).catch(() => {});
  }, []);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/diet/${diet._id}/assign`, { memberIds: selectedIds });
      toast.success('Diet plan assigned to members!');
      onSave();
    } catch {
      toast.error('Failed to assign diet plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Assign Diet Plan: {diet.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleAssign}>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {members.map(m => (
              <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(m._id)}
                  onChange={() => toggleSelect(m._id)}
                  style={{ accentColor: 'var(--neon)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.memberId} — Goal: {m.goal || 'Fitness'}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Saving...' : 'Confirm Assignment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Diet() {
  const [plans, setPlans] = useState([]);
  const [modal, setModal] = useState(null);
  const [assignDiet, setAssignDiet] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/diet');
      setPlans(res.data.plans);
    } catch {
      toast.error('Failed to load diet plans');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/diet/${deleteId}`);
      toast.success('Diet plan deleted');
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
          <h1 className="page-title">Diet & Meal Plans</h1>
          <p className="page-sub">Customized nutrition guidelines & macro tracking</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Create Diet Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {plans.map(d => (
          <div key={d._id} className="glass glass-hover" style={{ padding: '24px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '6px', display: 'inline-block' }}>{d.goal}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{d.name}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon)' }}>{d.calories}</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal/day</div>
              </div>
            </div>

            {/* Macros Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center', fontSize: '0.8rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Protein:</span> <br /><strong style={{ color: '#3b82f6' }}>{d.protein}g</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Carbs:</span> <br /><strong style={{ color: '#a855f7' }}>{d.carbs}g</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Fat:</span> <br /><strong style={{ color: '#f59e0b' }}>{d.fat}g</strong></div>
            </div>

            {/* Meals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <div>🥣 <strong>Breakfast:</strong> {d.breakfast || 'Oats & Protein'}</div>
              <div>🥗 <strong>Lunch:</strong> {d.lunch || 'Chicken/Tofu & Rice'}</div>
              <div>🍲 <strong>Dinner:</strong> {d.dinner || 'Fish/Salad'}</div>
              <div>🍎 <strong>Snacks:</strong> {d.snacks || 'Nuts & Fruits'}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setAssignDiet(d)}>
                <MdAssignmentInd size={16} /> Assign Members
              </button>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(d)} title="Edit">
                <MdEdit size={16} />
              </button>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(d._id)} title="Delete">
                <MdDelete size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modal && <DietModal diet={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {/* Assign Modal */}
      {assignDiet && <AssignDietModal diet={assignDiet} onClose={() => setAssignDiet(null)} onSave={() => { setAssignDiet(null); load(); }} />}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Delete Diet Plan</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete this diet plan?
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
