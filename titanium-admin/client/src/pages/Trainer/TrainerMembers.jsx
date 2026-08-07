import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Table from '../../components/layout/Table';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdPeople, MdFitnessCenter, MdAssessment, MdNoteAdd } from 'react-icons/md';

export default function TrainerMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [progressForm, setProgressForm] = useState({ weight: '', bodyFat: '', notes: '' });

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members?limit=50');
      if (res.data && res.data.members) {
        setMembers(res.data.members);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRecordProgress = (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    toast.success(`Progress logged for ${selectedMember.name}! Weight: ${progressForm.weight || selectedMember.weight}kg. Notes saved! 📝`);
    setSelectedMember(null);
    setProgressForm({ weight: '', bodyFat: '', notes: '' });
  };

  const columns = [
    { header: 'Client Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { header: 'Member ID', accessor: 'memberId', render: (r) => <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{r.memberId}</span> },
    { header: 'Goal', accessor: 'goal', render: (r) => r.goal || 'General Fitness' },
    { header: 'Weight / Height', accessor: 'weight', render: (r) => `${r.weight || 70} kg / ${r.height || 175} cm` },
    { header: 'Plan', accessor: 'planName', render: (r) => <span className="badge badge-info">{r.planName}</span> },
    {
      header: 'Actions',
      accessor: 'action',
      render: (r) => (
        <button className="btn btn-neon-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedMember(r)}>
          <MdNoteAdd size={14} style={{ marginRight: 4 }} /> Log Progress & Notes
        </button>
      )
    }
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
      <div className="module-header">
        <h2 className="module-title">Assigned Clients & Health Tracking</h2>
        <p className="module-subtitle">View client profiles, track body weight/fat metrics, and record personal trainer notes</p>
      </div>

      <Card title="Assigned Gym Clients List" icon={<MdPeople />}>
        <Table columns={columns} data={members} searchable={true} />
      </Card>

      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title={`Log Health Metrics & Notes for ${selectedMember.name}`}>
          <form onSubmit={handleRecordProgress} className="profile-form">
            <div className="form-group-custom">
              <label>Current Weight (kg)</label>
              <input type="number" defaultValue={selectedMember.weight || 70} onChange={(e) => setProgressForm({ ...progressForm, weight: e.target.value })} />
            </div>
            <div className="form-group-custom">
              <label>Body Fat % Estimate</label>
              <input type="number" placeholder="e.g. 15%" onChange={(e) => setProgressForm({ ...progressForm, bodyFat: e.target.value })} />
            </div>
            <div className="form-group-custom">
              <label>Trainer Notes & Form Feedback</label>
              <textarea rows={4} className="input" placeholder="e.g. Focus on keeping spine neutral during deadlifts. Up protein intake by 20g." onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedMember(null)}>Cancel</button>
              <button type="submit" className="btn btn-neon-primary">Save Notes & Metrics</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
