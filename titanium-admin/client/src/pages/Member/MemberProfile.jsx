import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdPerson, MdLock, MdFitnessCenter } from 'react-icons/md';

export default function MemberProfile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [weight, setWeight] = useState(user?.weight || 70);
  const [height, setHeight] = useState(user?.height || 175);
  const [goal, setGoal] = useState(user?.goal || 'General Fitness');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setWeight(user.weight || 70);
      setHeight(user.height || 175);
      setGoal(user.goal || 'General Fitness');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/member-portal/profile', {
        name,
        phone,
        address,
        weight: Number(weight),
        height: Number(height),
        goal
      });
      if (res.data.success) {
        toast.success('Profile details updated successfully!');
        if (updateProfile) {
          await updateProfile({ name, phone, address, weight, height, goal });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Member Profile & Settings</h2>
        <p className="module-subtitle">Manage personal information, body metrics, and security</p>
      </div>

      <div className="dashboard-charts-grid">
        {/* Personal Details */}
        <Card title="Personal Information" icon={<MdPerson />}>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group-custom">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group-custom">
              <label>Email Address (Read-only)</label>
              <input type="email" value={user?.email || ''} disabled />
            </div>

            <div className="form-group-custom">
              <label>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group-custom">
              <label>Residential Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter home address" />
            </div>

            <button type="submit" className="btn btn-neon-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </Card>

        {/* Body Metrics & Goals */}
        <Card title="Body Metrics & Fitness Goal" icon={<MdFitnessCenter />}>
          <form onSubmit={handleUpdateProfile} className="metrics-editor-grid">
            <div className="form-group-custom">
              <label>Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>

            <div className="form-group-custom">
              <label>Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>

            <div className="bmi-display-box glass">
              <span>Calculated BMI:</span>
              <strong className="bmi-value">{bmi}</strong>
              <span className="bmi-category">
                {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese'}
              </span>
            </div>

            <div className="form-group-custom full-width">
              <label>Primary Fitness Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="Muscle Gain">Muscle Gain & Bodybuilding</option>
                <option value="Weight Loss">Fat Loss & Toning</option>
                <option value="General Fitness">General Fitness & Mobility</option>
                <option value="Endurance">Cardio Endurance & Performance</option>
              </select>
            </div>

            <button type="submit" className="btn btn-dark full-width" disabled={savingProfile}>
              Update Body Metrics & Goals
            </button>
          </form>
        </Card>
      </div>

      {/* Security Card */}
      <div style={{ marginTop: 25 }}>
        <Card title="Security & Change Password" icon={<MdLock />}>
          <form onSubmit={handleChangePassword} className="profile-form max-width-600">
            <div className="form-group-custom">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group-custom">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group-custom">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-neon-primary" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
