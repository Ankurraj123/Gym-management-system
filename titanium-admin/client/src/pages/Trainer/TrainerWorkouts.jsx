import React, { useState } from 'react';
import Card from '../../components/layout/Card';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdDirectionsRun, MdAdd, MdEdit } from 'react-icons/md';

export default function TrainerWorkouts() {
  const [workouts, setWorkouts] = useState([
    { id: 'W-1', title: 'Hypertrophy Upper Body', category: 'Bodybuilding', difficulty: 'Advanced', assignedTo: 'Jamie Nelson' },
    { id: 'W-2', title: 'Fat Burn HIIT Circuit', category: 'Cardio & Fat Loss', difficulty: 'Intermediate', assignedTo: 'Ankur Kumar' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Strength', difficulty: 'Intermediate', assignedTo: 'All Assigned Clients' });

  const handleCreateWorkout = (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Please enter workout title');
      return;
    }
    const newW = {
      id: `W-${Date.now()}`,
      title: form.title,
      category: form.category,
      difficulty: form.difficulty,
      assignedTo: form.assignedTo
    };
    setWorkouts([newW, ...workouts]);
    toast.success(`Workout Routine "${newW.title}" created and assigned to ${form.assignedTo}! 🏋️‍♂️`);
    setShowModal(false);
    setForm({ title: '', category: 'Strength', difficulty: 'Intermediate', assignedTo: 'All Assigned Clients' });
  };

  return (
    <div className="module-container">
      <div className="module-header-flex">
        <div>
          <h2 className="module-title">Custom Workout Routine Builder</h2>
          <p className="module-subtitle">Design workouts, specify sets/reps/rest periods, and assign routines to your clients</p>
        </div>
        <button className="btn btn-neon-primary" onClick={() => setShowModal(true)}>
          <MdAdd size={18} style={{ marginRight: 6 }} /> Create Custom Routine
        </button>
      </div>

      <Card title="Active Member Workout Plans" icon={<MdDirectionsRun />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {workouts.map(w => (
            <div key={w.id} className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-info">{w.category}</span>
                <span className="badge badge-success">{w.difficulty}</span>
              </div>
              <h4 style={{ margin: '6px 0', fontSize: '1.1rem', color: '#fff' }}>{w.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned Client: <strong style={{ color: 'var(--accent)' }}>{w.assignedTo}</strong></p>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Build Custom Workout Plan">
        <form onSubmit={handleCreateWorkout} className="profile-form">
          <div className="form-group-custom">
            <label>Routine Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Chest & Triceps Hypertrophy" />
          </div>
          <div className="form-group-custom">
            <label>Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="Strength">Strength & Powerlifting</option>
              <option value="Bodybuilding">Hypertrophy & Bodybuilding</option>
              <option value="Cardio & Fat Loss">Cardio & Fat Loss</option>
              <option value="Mobility">Flexibility & Mobility</option>
            </select>
          </div>
          <div className="form-group-custom">
            <label>Difficulty Level</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group-custom">
            <label>Assign to Member</label>
            <input type="text" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="e.g. Jamie Nelson" />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-neon-primary">Publish Workout Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
