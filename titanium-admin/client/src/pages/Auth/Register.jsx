import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdFitnessCenter, MdPerson, MdEmail, MdLock, MdPhone } from 'react-icons/md';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password, phone);
      toast.success('Registration successful! Welcome to Titanium Fitness.');
      navigate('/member/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-background-glow" />
      <div className="auth-card glass animate-pop">
        <div className="auth-header">
          <div className="brand-badge">
            <MdFitnessCenter size={28} className="neon-icon" />
          </div>
          <h1 className="auth-brand-title">JOIN TITANIUM FITNESS</h1>
          <p className="auth-brand-subtitle">Create your Member Account & Start Training</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-custom">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <MdPerson className="input-icon" size={18} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-custom">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <MdEmail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-custom">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-icon">
              <MdPhone className="input-icon" size={18} />
              <input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-custom">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <MdLock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-custom">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <MdLock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-neon-primary full-width" disabled={submitting}>
            {submitting ? <span className="spinner-inline" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-accent-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
