import React, { useState } from 'react';
import Card from '../../components/layout/Card';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdRestaurantMenu, MdAdd } from 'react-icons/md';

export default function TrainerDiet() {
  const [diets, setDiets] = useState([
    { id: 'D-1', name: 'High Protein Cutting Plan', calories: 2200, protein: 180, goal: 'Fat Loss', assignedTo: 'Jamie Nelson' },
    { id: 'D-2', name: 'Clean Bulking Nutrition', calories: 3000, protein: 160, goal: 'Muscle Gain', assignedTo: 'Ankur Kumar' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', calories: 2400, protein: 150, goal: 'General Fitness', assignedTo: 'All Assigned Clients' });

  const handleCreateDiet = (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Please enter diet plan name');
      return;
    }
    const newD = {
      id: `D-${Date.now()}`,
      name: form.name,
      calories: Number(form.calories),
      protein: Number(form.protein),
      goal: form.goal,
      assignedTo: form.assignedTo
    };
    setDiets([newD, ...diets]);
    toast.success(`Diet Plan "${newD.name}" created and assigned to ${form.assignedTo}! 🍽️`);
    setShowModal(false);
    setForm({ name: '', calories: 2400, protein: 150, goal: 'General Fitness', assignedTo: 'All Assigned Clients' });
  };

  return (
    <div className="module-container">
      <div className="module-header-flex">
        <div>
          <h2 className="module-title">Nutrition & Diet Plan Builder</h2>
          <p className="module-subtitle">Design daily macro targets, meal breakdowns, and assign diet plans to clients</p>
        </div>
        <button className="btn btn-neon-primary" onClick={() => setShowModal(true)}>
          <MdAdd size={18} style={{ marginRight: 6 }} /> Create Diet Plan
        </button>
      </div>

      <Card title="Active Member Diet Plans" icon={<MdRestaurantMenu />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {diets.map(d => (
            <div key={d.id} className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-info">{d.goal}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>{d.calories} kcal</span>
              </div>
              <h4 style={{ margin: '6px 0', fontSize: '1.1rem', color: '#fff' }}>{d.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Protein: <strong>{d.protein}g</strong> • Assigned Client: <strong style={{ color: 'var(--accent)' }}>{d.assignedTo}</strong>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Build Nutrition & Macro Diet Plan">
        <form onSubmit={handleCreateDiet} className="profile-form">
          <div className="form-group-custom">
            <label>Diet Plan Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. High Protein Recomp" />
          </div>
          <div className="form-group-custom">
            <label>Daily Calorie Target (kcal) *</label>
            <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} required />
          </div>
          <div className="form-group-custom">
            <label>Daily Protein Goal (grams) *</label>
            <input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} required />
          </div>
          <div className="form-group-custom">
            <label>Primary Fitness Goal</label>
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              <option value="Fat Loss">Fat Loss & Toning</option>
              <option value="Muscle Gain">Muscle Gain & Bulking</option>
              <option value="General Fitness">General Fitness & Maintenance</option>
            </select>
          </div>
          <div className="form-group-custom">
            <label>Assign to Member</label>
            <input type="text" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="e.g. Jamie Nelson" />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-neon-primary">Publish Diet Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
