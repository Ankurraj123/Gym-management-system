import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdFitnessCenter, MdShield, MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function Login() {
  const [role, setRole] = useState('member'); // 'member' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('tf_remember_email');
    const savedRole = localStorage.getItem('tf_remember_role');
    if (savedEmail) setEmail(savedEmail);
    if (savedRole) setRole(savedRole);

    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/member/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password, role, remember);
      toast.success(`Welcome back, ${loggedUser.name || 'User'}!`);
      if (role === 'admin' || loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Panel - Image 1 Style split screen banner */}
      <div className="auth-left-panel">
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <h1 className="auth-hero-title">WELCOME BACK!</h1>
          <p className="auth-hero-subtitle">
            Enter your credentials to return to your personalized training dashboard and track your fitness progress.
          </p>
        </div>
      </div>

      {/* Right Panel - Image 2 Login options form replacing Image 1 Authorization place */}
      <div className="auth-right-panel">
        <div className="auth-card animate-pop">
          {/* Brand Header */}
          <div className="auth-header">
            <div className="brand-badge">
              <MdFitnessCenter size={30} className="neon-icon" />
            </div>
            <h1 className="auth-brand-title">TITANIUM FITNESS</h1>
            <p className="auth-brand-subtitle">
              {role === 'member' ? 'Member Fitness Dashboard' : 'Admin Management System'}
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="auth-role-tabs-wrapper">
            <div className="auth-role-tabs">
              <button
                type="button"
                className={`role-tab ${role === 'member' ? 'active' : ''}`}
                onClick={() => setRole('member')}
              >
                <MdPerson size={18} />
                <span>Member</span>
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                <MdShield size={18} />
                <span>Admin</span>
              </button>
              <div
                className="role-tab-indicator"
                style={{ transform: role === 'admin' ? 'translateX(100%)' : 'translateX(0%)' }}
              />
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-custom">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <div className="input-with-icon">
                <MdEmail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder={role === 'member' ? 'member@gmail.com' : 'admin@titaniumfitness.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label htmlFor="password">PASSWORD</label>
              <div className="input-with-icon">
                <MdLock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="checkbox-label">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-neon-primary full-width" disabled={submitting}>
              {submitting ? (
                <span className="spinner-inline" />
              ) : (
                `Sign In as ${role === 'admin' ? 'Admin' : 'Member'}`
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="auth-footer">
            {role === 'member' ? (
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-accent-link">
                  Sign Up
                </Link>
              </p>
            ) : (
              <p className="security-notice">Protected by 256-bit JWT & bcrypt encryption</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
