import React, { useState } from 'react';
import Card from '../../components/layout/Card';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdPersonAdd, MdFileUpload, MdCheckCircle } from 'react-icons/md';

export default function RecepMembers() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    age: 24,
    planName: 'Basic',
    weight: 70,
    height: 175,
    goal: 'General Fitness',
    idProof: 'Aadhaar Card / Govt ID Collected'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/members', form);
      if (res.data.success) {
        toast.success(`Walk-in member registered successfully! Member ID: ${res.data.member.memberId} 🎉`);
        setForm({
          name: '',
          email: '',
          phone: '',
          gender: 'Male',
          age: 24,
          planName: 'Basic',
          weight: 70,
          height: 175,
          goal: 'General Fitness',
          idProof: 'Aadhaar Card / Govt ID Collected'
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register walk-in member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Walk-In Member Onboarding & Registration</h2>
        <p className="module-subtitle">Register new gym walk-in members, collect ID proof documents, and initialize membership accounts</p>
      </div>

      <div className="dashboard-charts-grid">
        <Card title="Register Walk-In Member" icon={<MdPersonAdd />}>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group-custom">
              <label>Member Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Vikram Joshi"
              />
            </div>

            <div className="form-group-custom">
              <label>Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="e.g. vikram@gmail.com"
              />
            </div>

            <div className="form-group-custom">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="+91 9876543210"
              />
            </div>

            <div className="form-group-custom">
              <label>Membership Tier *</label>
              <select value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })}>
                <option value="Basic">Basic Plan (₹1,500/mo)</option>
                <option value="Standard">Standard Plan (₹2,500/mo)</option>
                <option value="Premium">Premium Plan (₹4,000/mo)</option>
                <option value="VIP">VIP All-Access (₹7,500/mo)</option>
              </select>
            </div>

            <div className="form-group-custom">
              <label>ID Proof Document Verification *</label>
              <select value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })}>
                <option value="Aadhaar Card Verified">Aadhaar Card Verified</option>
                <option value="Driving License Verified">Driving License Verified</option>
                <option value="Passport Verified">Passport Verified</option>
              </select>
            </div>

            <button type="submit" className="btn btn-neon-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Walk-In Onboarding'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
