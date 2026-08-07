import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdFitnessCenter, MdEmail, MdArrowBack } from 'react-icons/md';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error('Failed to send reset link.');
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
          <h1 className="auth-brand-title">RESET PASSWORD</h1>
          <p className="auth-brand-subtitle">Enter your email to receive recovery instructions</p>
        </div>

        {submitted ? (
          <div className="auth-success-message">
            <p>If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.</p>
            <Link to="/login" className="btn btn-neon-primary full-width margin-top">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-custom">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <MdEmail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-neon-primary full-width" disabled={submitting}>
              {submitting ? <span className="spinner-inline" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-back-link">
            <MdArrowBack size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
