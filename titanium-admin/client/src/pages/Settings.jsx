import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdSettings, MdSave, MdStore, MdAttachMoney, MdShare } from 'react-icons/md';

export default function Settings() {
  const [form, setForm] = useState({
    gymName: 'Titanium Fitness Club',
    tagline: 'Premium Fitness & Strength Portal',
    email: 'admin@titaniumfitness.com',
    phone: '+91 98765 43210',
    address: 'Plot 42, Cyber City Sector 18, Gurgaon',
    currency: '₹',
    taxRate: 18,
    businessHours: '06:00 AM - 10:00 PM',
    instagram: '@titaniumfitness',
    facebook: 'titaniumfitnessofficial',
    twitter: '@titaniumfit'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.settings) setForm(res.data.settings);
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings', form);
      toast.success('System settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Gym & System Settings</h1>
          <p className="page-sub">Branding, contact details, tax rate & operation hours</p>
        </div>
        <button className="btn btn-neon" onClick={handleSubmit} disabled={loading}>
          <MdSave size={18} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Gym Information */}
          <div className="glass" style={{ padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: 'var(--neon)' }}>
              <MdStore size={22} /> Gym Identity & Contact
            </div>

            <div className="form-group">
              <label>Gym Name</label>
              <input className="input" value={form.gymName} onChange={e => set('gymName', e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Tagline / Motto</label>
              <input className="input" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Official Email</label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Official Phone</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Gym Facility Address</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Business Operating Hours</label>
              <input className="input" value={form.businessHours} onChange={e => set('businessHours', e.target.value)} placeholder="06:00 AM - 10:00 PM" />
            </div>
          </div>

          {/* Billing & Tax */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass" style={{ padding: '28px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: '#3b82f6' }}>
                <MdAttachMoney size={22} /> Financial & Currency Configuration
              </div>

              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Currency Symbol</label>
                  <input className="input" value={form.currency} onChange={e => set('currency', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>GST / Tax Rate (%)</label>
                  <input className="input" type="number" value={form.taxRate} onChange={e => set('taxRate', e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="glass" style={{ padding: '28px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: '#a855f7' }}>
                <MdShare size={22} /> Social Media Handles
              </div>

              <div className="form-group">
                <label>Instagram Handle</label>
                <input className="input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@titaniumfitness" />
              </div>
              <div className="form-group">
                <label>Facebook Page</label>
                <input className="input" value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="titaniumfitnessofficial" />
              </div>
              <div className="form-group">
                <label>Twitter Handle</label>
                <input className="input" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="@titaniumfit" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
