import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdVolumeUp, MdClose } from 'react-icons/md';

function AnnouncementModal({ announcement, onClose, onSave }) {
  const [form, setForm] = useState(announcement || { title: '', content: '', type: 'Info', active: true });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (announcement?._id) {
        await api.put(`/announcements/${announcement._id}`, form);
      } else {
        await api.post('/announcements', form);
      }
      toast.success('Announcement broadcast published!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {announcement?._id ? 'Edit Announcement' : 'Create Broadcast Notice'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Gym Holiday Notice" />
          </div>

          <div className="form-group">
            <label>Notice Type</label>
            <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="Info">Info (Blue)</option>
              <option value="Warning">Warning (Yellow)</option>
              <option value="Success">Success (Green)</option>
              <option value="Urgent">Urgent (Red)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Announcement Message *</label>
            <textarea className="input" rows={4} value={form.content} onChange={e => set('content', e.target.value)} required placeholder="Detailed message for members..." />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} style={{ accentColor: 'var(--neon)' }} />
              Active (Visible on Member Panel)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Publishing...' : 'Publish Notice'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TYPE_CLASSES = {
  Info: 'badge-info',
  Warning: 'badge-warning',
  Success: 'badge-success',
  Urgent: 'badge-danger'
};

const BORDER_COLORS = {
  Info: '#3b82f6',
  Warning: '#f59e0b',
  Success: '#14f195',
  Urgent: '#ef4444'
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch {
      toast.error('Failed to load announcements');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/announcements/${deleteId}`);
      toast.success('Announcement removed');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Announcements & Broadcasts</h1>
          <p className="page-sub">Public gym notices & member updates</p>
        </div>
        <button className="btn btn-neon" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Create Notice
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map(a => (
          <div key={a._id} className="glass glass-hover" style={{ padding: '24px', borderRadius: '16px', borderLeft: `4px solid ${BORDER_COLORS[a.type] || '#3b82f6'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${TYPE_CLASSES[a.type]}`}>{a.type}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{a.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(a)} title="Edit Notice">
                  <MdEdit size={16} />
                </button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(a._id)} title="Delete Notice">
                  <MdDelete size={16} />
                </button>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '16px' }}>{a.content}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.785rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <span>Published by <strong>{a.authorName || 'Admin'}</strong> on {new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
              <span>Status: <strong style={{ color: a.active ? 'var(--neon)' : '#ef4444' }}>{a.active ? 'Active' : 'Inactive'}</strong></span>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
            <MdVolumeUp size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No active announcements broadcasted yet.</p>
          </div>
        )}
      </div>

      {modal && <AnnouncementModal announcement={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#ef4444' }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to delete this broadcast notice?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
