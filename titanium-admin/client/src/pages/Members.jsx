import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdBlock,
  MdRefresh,
  MdVisibility,
  MdVpnKey,
  MdClose,
  MdPerson
} from 'react-icons/md';

const STATUS_BADGE = {
  Active: 'badge-success',
  Expired: 'badge-danger',
  Suspended: 'badge-warning'
};

function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(
    member || {
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      age: 25,
      planName: 'Basic',
      status: 'Active',
      weight: 70,
      height: 175,
      goal: 'General Fitness',
      address: '',
      emergencyContact: ''
    }
  );
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (member?._id) {
        await api.put(`/members/${member._id}`, form);
      } else {
        await api.post('/members', form);
      }
      toast.success(member?._id ? 'Member updated successfully!' : 'New member added successfully!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '650px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {member?._id ? 'Edit Member Details' : 'Register New Gym Member'}
          </h3>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <MdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input className="input" type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" />
            </div>
            <div className="form-group">
              <label>Membership Plan</label>
              <select className="input" value={form.planName} onChange={e => set('planName', e.target.value)}>
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
                <option>VIP</option>
              </select>
            </div>
            <div className="form-group">
              <label>Membership Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option>
                <option>Expired</option>
                <option>Suspended</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <input className="input" value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="Muscle Gain / Fat Loss" />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input className="input" type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="70" />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input className="input" type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="175" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>
              {loading ? 'Saving...' : member?._id ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewMemberModal({ member, onClose }) {
  if (!member) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Member Profile Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--neon)', color: '#000', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {member.name?.[0]?.toUpperCase() || 'M'}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{member.name}</h2>
          <span style={{ fontFamily: 'monospace', color: 'var(--neon)', fontWeight: 600 }}>{member.memberId}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <br /><strong>{member.email}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <br /><strong>{member.phone || 'N/A'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Plan:</span> <br /><span className="badge badge-info">{member.planName}</span></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> <br /><span className={`badge ${STATUS_BADGE[member.status]}`}>{member.status}</span></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Gender:</span> <br /><strong>{member.gender || 'Male'}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Age:</span> <br /><strong>{member.age || 25} yrs</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Weight / Height:</span> <br /><strong>{member.weight || 70} kg / {member.height || 175} cm</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Assigned Trainer:</span> <br /><strong>{member.trainer?.name || 'Unassigned'}</strong></div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals
  const [modal, setModal] = useState(null); // null | 'add' | member object for edit
  const [viewMember, setViewMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [resetMember, setResetMember] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', {
        params: { search, status, planName: planFilter, page, limit: 10 }
      });
      setMembers(res.data.members);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load member records');
    } finally {
      setLoading(false);
    }
  }, [search, status, planFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/members/${deleteId}`);
      toast.success('Member deleted successfully');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete member');
    }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await api.patch(`/members/${id}/suspend`);
      toast.success(res.data.message || 'Status updated');
      load();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput) {
      toast.error('Please enter a new password');
      return;
    }
    try {
      await api.post(`/members/${resetMember._id}/reset-password`, { newPassword: newPasswordInput });
      toast.success(`Password reset for ${resetMember.name}`);
      setResetMember(null);
      setNewPasswordInput('');
    } catch {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Members Management</h1>
          <p className="page-sub">{total} registered gym members</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Add New Member
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="glass" style={{ padding: '16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
            <MdSearch size={18} color="var(--text-muted)" />
            <input
              placeholder="Search member by Name, Email, Phone, or ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select className="input" style={{ width: 'auto' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Expired">Expired Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>

          <select className="input" style={{ width: 'auto' }} value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}>
            <option value="All">All Plans</option>
            <option value="Basic">Basic Plan</option>
            <option value="Standard">Standard Plan</option>
            <option value="Premium">Premium Plan</option>
            <option value="VIP">VIP Plan</option>
          </select>
        </div>

        <button className="btn btn-secondary btn-icon" onClick={load} title="Refresh Table">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* Data Table */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Member ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Expiry Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} style={{ padding: '16px' }}>
                      <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No members match your criteria.
                  </td>
                </tr>
              ) : (
                members.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(20,241,149,0.15)', color: 'var(--neon)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {m.name?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--neon)', fontWeight: 600, fontFamily: 'monospace' }}>{m.memberId}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{m.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{m.phone || '—'}</td>
                    <td>
                      <span className="badge badge-info">{m.planName}</span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[m.status] || 'badge-gray'}`}>{m.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {m.endDate ? new Date(m.endDate).toLocaleDateString('en-IN') : '2026-12-01'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setViewMember(m)} title="View Details">
                          <MdVisibility size={15} />
                        </button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(m)} title="Edit Member">
                          <MdEdit size={15} />
                        </button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setResetMember(m)} title="Reset Password">
                          <MdVpnKey size={15} color="#f59e0b" />
                        </button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => handleSuspend(m._id)} title={m.status === 'Suspended' ? 'Activate' : 'Suspend'}>
                          <MdBlock size={15} color="#ec4899" />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(m._id)} title="Delete Member">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination" style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-neon' : 'btn-secondary'}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && <MemberModal member={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {/* View Details Modal */}
      {viewMember && <ViewMemberModal member={viewMember} onClose={() => setViewMember(null)} />}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Confirm Member Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to permanently remove this member? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetMember && (
        <div className="modal-overlay" onClick={() => setResetMember(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Reset Password for {resetMember.name}</h3>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Member Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResetMember(null)}>Cancel</button>
                <button type="submit" className="btn btn-neon">Set New Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
