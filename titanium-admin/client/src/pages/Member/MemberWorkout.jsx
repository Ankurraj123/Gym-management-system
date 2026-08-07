import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Table from '../../components/layout/Table';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdDirectionsRun, MdCheckCircle, MdOutlineCircle } from 'react-icons/md';

export default function MemberWorkout() {
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState(null);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const res = await api.get('/member-portal/workout');
        if (res.data.success && res.data.workout) {
          setWorkoutData(res.data.workout);
          if (res.data.workout.exercises) {
            setExercises(
              res.data.workout.exercises.map((ex, idx) => ({
                id: idx + 1,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                restTime: ex.restTime || '60s',
                completed: false
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error fetching workout:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, []);

  const toggleComplete = (id) => {
    setExercises(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = !item.completed;
          if (updated) toast.success(`Completed ${item.name}! 🔥`);
          return { ...item, completed: updated };
        }
        return item;
      })
    );
  };

  const columns = [
    {
      header: 'Status',
      accessor: 'completed',
      width: '80px',
      render: (row) => (
        <button className="btn-icon-check" onClick={() => toggleComplete(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {row.completed ? <MdCheckCircle color="var(--accent)" size={24} /> : <MdOutlineCircle color="#64748b" size={24} />}
        </button>
      )
    },
    {
      header: 'Exercise Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ color: row.completed ? '#94a3b8' : '#f8fafc', textDecoration: row.completed ? 'line-through' : 'none' }}>
            {row.name}
          </strong>
        </div>
      )
    },
    { header: 'Target Sets', accessor: 'sets' },
    { header: 'Target Reps', accessor: 'reps' },
    { header: 'Rest Period', accessor: 'restTime' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header-flex">
        <div>
          <h2 className="module-title">{workoutData?.title || 'Personalized Workout Routine'}</h2>
          <p className="module-subtitle">
            Category: <strong>{workoutData?.category || 'General Fitness'}</strong> • Difficulty: <strong>{workoutData?.difficulty || 'Intermediate'}</strong>
          </p>
        </div>
      </div>

      <Card title="Assigned Exercises & Targets" icon={<MdDirectionsRun />}>
        {exercises.length > 0 ? (
          <Table columns={columns} data={exercises} searchable={false} />
        ) : (
          <p style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No exercises assigned to this workout plan yet.
          </p>
        )}
      </Card>
    </div>
  );
}
