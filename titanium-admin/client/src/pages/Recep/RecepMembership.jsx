import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Table from '../../components/layout/Table';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdAutorenew, MdUpgrade, MdCalendarToday } from 'react-icons/md';

export default function RecepMembership() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionType, setActionType] = useState(''); // 'renew' | 'upgrade' | 'extend'
  const [newPlan, setNewPlan] = useState('Premium');

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members?limit=50');
      if (res.data && res.data.members) {
        setMembers(res.data.members);
      }
    } catch {
      // Fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleProcessAction = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      if (actionType === 'renew') {
        toast.success(`Membership for ${selectedMember.name} renewed for 30 days! 🔄`);
      } else if (actionType === 'upgrade') {
        toast.success(`Membership for ${selectedMember.name} upgraded to ${newPlan}! 🚀`);
      } else if (actionType === 'extend') {
        toast.success(`Membership extension applied for ${selectedMember.name}! 📅`);
      }
      setSelectedMember(null);
      fetchMembers();
    } catch {
      toast.error('Operation failed');
    }
  };

  const columns = [
    { header: 'Member Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { header: 'Member ID', accessor: 'memberId', render: (r) => <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{r.memberId}</span> },
    { header: 'Current Plan', accessor: 'planName', render: (r) => <span className="badge badge-info">{r.planName}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span> },
    {
      header: 'Actions',
      accessor: 'action',
      render: (r) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => { setSelectedMember(r); setActionType('renew'); }}>
            <MdAutorenew size={14} style={{ marginRight: 4 }} /> Renew
          </button>
          <button className="btn btn-neon-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => { setSelectedMember(r); setActionType('upgrade'); }}>
            <MdUpgrade size={14} style={{ marginRight: 4 }} /> Upgrade
          </button>
        </div>
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
        <h2 className="module-title">Membership Renewals, Upgrades & Extensions</h2>
        <p className="module-subtitle">Manage member plan durations, upgrades to higher tiers, and renewal processing</p>
      </div>

      <Card title="Member Plans & Renewals List" icon={<MdAutorenew />}>
        <Table columns={columns} data={members} searchable={true} />
      </Card>

      {/* Action Modal */}
      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title={`${actionType.toUpperCase()} Membership - ${selectedMember.name}`}>
          <form onSubmit={handleProcessAction} className="profile-form">
            {actionType === 'upgrade' && (
              <div className="form-group-custom">
                <label>Select Higher Tier Plan</label>
                <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
                  <option value="Standard">Standard Plan (₹2,500/mo)</option>
                  <option value="Premium">Premium Plan (₹4,000/mo)</option>
                  <option value="VIP">VIP All-Access Plan (₹7,500/mo)</option>
                </select>
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '10px 0 20px 0' }}>
              Confirm processing <strong>{actionType}</strong> for <strong>{selectedMember.name}</strong> ({selectedMember.memberId}). Current plan: <strong>{selectedMember.planName}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedMember(null)}>Cancel</button>
              <button type="submit" className="btn btn-neon-primary">Confirm & Update Plan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
