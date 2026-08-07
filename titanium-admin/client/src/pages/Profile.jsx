import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdPerson, MdLock, MdPhone } from 'react-icons/md';

export default function Profile() {
  const { admin, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: admin?.name || '', phone: admin?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profile details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully! Logging out...');
      setTimeout(() => logout(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Profile</h1>
          <p className="page-sub">Manage your account settings and credentials</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Profile Card & Details Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Info Card */}
          <div className="glass" style={{ padding: 28, borderRadius: 20, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0a0a0a', fontSize: '2rem', fontWeight: 800 }}>
              {admin?.name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{admin?.name}</h2>
            <p style={{ color: 'var(--neon)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>{admin?.role}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: 18, borderRadius: 12, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Email:</span>
                <span>{admin?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Phone:</span>
                <span>{admin?.phone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Last Login:</span>
                <span>{admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Details form */}
          <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Update Personal Details</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <MdPerson style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" style={{ paddingLeft: '42px' }} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <MdPhone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" style={{ paddingLeft: '42px' }} value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-neon w-full" disabled={profileLoading} style={{ justifyContent: 'center' }}>
                {profileLoading ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Change Security Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: '42px' }} type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: '42px' }} type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: '42px' }} type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
            </div>
            <button type="submit" className="btn btn-danger w-full" disabled={passwordLoading} style={{ justifyContent: 'center' }}>
              {passwordLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
