import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdDirectionsRun, MdClose, MdAssignmentInd, MdFitnessCenter } from 'react-icons/md';

function WorkoutModal({ workout, onClose, onSave }) {
  const [title, setTitle] = useState(workout?.title || '');
  const [category, setCategory] = useState(workout?.category || 'Strength');
  const [difficulty, setDifficulty] = useState(workout?.difficulty || 'Intermediate');
  const [exercises, setExercises] = useState(
    workout?.exercises || [
      { name: 'Bench Press', sets: 4, reps: '8-10', restTime: '90s' },
      { name: 'Incline Dumbbell Flyes', sets: 3, reps: '12', restTime: '60s' }
    ]
  );
  const [loading, setLoading] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '10-12', restTime: '60s' }]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error('Workout title required');
    setLoading(true);
    try {
      const payload = { title, category, difficulty, exercises };
      if (workout?._id) {
        await api.put(`/workouts/${workout._id}`, payload);
      } else {
        await api.post('/workouts', payload);
      }
      toast.success(workout?._id ? 'Workout updated!' : 'Workout created!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '650px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {workout?._id ? 'Edit Workout Routine' : 'Create Workout Routine'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Workout Routine Title *</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Upper Body Hypertrophy Blast" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Strength</option>
                <option>Cardio</option>
                <option>HIIT</option>
                <option>Hypertrophy</option>
                <option>Flexibility</option>
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Exercise List ({exercises.length})</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addExercise}>+ Add Exercise</button>
            </div>

            {exercises.map((ex, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center', marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
                <input className="input" placeholder="Exercise Name" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} required />
                <input className="input" type="number" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(i, 'sets', e.target.value)} />
                <input className="input" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(i, 'reps', e.target.value)} />
                <input className="input" placeholder="Rest" value={ex.restTime} onChange={e => updateExercise(i, 'restTime', e.target.value)} />
                <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeExercise(i)} title="Remove">
                  <MdClose size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Saving...' : 'Save Workout'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignWorkoutModal({ workout, onClose, onSave }) {
  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(workout.assignedMembers?.map(m => m._id || m) || []);
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
      await api.post(`/workouts/${workout._id}/assign`, { memberIds: selectedIds });
      toast.success('Workout program assigned to members!');
      onSave();
    } catch {
      toast.error('Failed to assign workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Assign Workout: {workout.title}</h3>
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.memberId} — {m.planName}</div>
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

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [modal, setModal] = useState(null);
  const [assignWorkout, setAssignWorkout] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/workouts');
      setWorkouts(res.data.workouts);
    } catch {
      toast.error('Failed to load workouts');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/workouts/${deleteId}`);
      toast.success('Workout routine deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete workout');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Workout Programs</h1>
          <p className="page-sub">Custom exercise routines & member assignment</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Create Workout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {workouts.map(w => (
          <div key={w._id} className="glass glass-hover" style={{ padding: '24px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '6px', display: 'inline-block' }}>{w.category}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{w.title}</h3>
              </div>
              <span className={`badge ${w.difficulty === 'Beginner' ? 'badge-success' : w.difficulty === 'Intermediate' ? 'badge-warning' : 'badge-danger'}`}>
                {w.difficulty}
              </span>
            </div>

            <div style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>EXERCISES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {w.exercises?.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>• {ex.name}</span>
                    <span style={{ color: 'var(--neon)', fontFamily: 'monospace' }}>{ex.sets} × {ex.reps} ({ex.restTime})</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Assigned Members: <strong>{w.assignedMembers?.length || 0}</strong>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setAssignWorkout(w)}>
                <MdAssignmentInd size={16} /> Assign Members
              </button>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(w)} title="Edit">
                <MdEdit size={16} />
              </button>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(w._id)} title="Delete">
                <MdDelete size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modal && <WorkoutModal workout={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {/* Assign Modal */}
      {assignWorkout && <AssignWorkoutModal workout={assignWorkout} onClose={() => setAssignWorkout(null)} onSave={() => { setAssignWorkout(null); load(); }} />}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Delete Workout Routine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete this workout program?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Routine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
