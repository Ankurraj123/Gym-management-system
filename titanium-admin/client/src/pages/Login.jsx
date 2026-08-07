import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdFitnessCenter,
  MdClose,
  MdPerson,
  MdShield,
  MdPhone
} from 'react-icons/md';

export default function Login() {
  const [role, setRole] = useState('member');
  const [form, setForm] = useState({ email: 'member@gmail.com', password: 'member@123', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Sign up modal for members
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [signUpLoading, setSignUpLoading] = useState(false);

  const { login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('tf_remember_email');
    const savedRole = localStorage.getItem('tf_remember_role');
    if (savedEmail) {
      setForm(p => ({ ...p, email: savedEmail, remember: true }));
      setForgotEmail(savedEmail);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setForm(p => ({ ...p, email: 'admin@titaniumfitness.com', password: 'Admin@123' }));
    } else if (newRole === 'receptionist') {
      setForm(p => ({ ...p, email: 'receptionist@titaniumfitness.com', password: 'Recep@123' }));
    } else if (newRole === 'trainer') {
      setForm(p => ({ ...p, email: 'trainer@titaniumfitness.com', password: 'Trainer@123' }));
    } else {
      setForm(p => ({ ...p, email: 'member@gmail.com', password: 'member@123' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(form.email, form.password, role, form.remember);
      toast.success(`Welcome back, ${loggedUser.name || 'User'}! 💪`);
      const userRole = loggedUser.role || role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'receptionist' || userRole === 'recep') {
        navigate('/recep/dashboard');
      } else if (userRole === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      toast.success(res.message || 'Password reset instructions sent!');
      setShowForgotModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpLoading(true);
    try {
      const newUser = await register(signUpForm.name, signUpForm.email, signUpForm.password, signUpForm.phone);
      toast.success(`Account created! Welcome, ${newUser.name}! 🎉`);
      setShowSignUpModal(false);
      navigate('/member/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Left Panel - Image 1 split layout hero */}
      <div className="auth-left-panel">
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <h1 className="auth-hero-title">WELCOME BACK!</h1>
          <p className="auth-hero-subtitle">
            Enter your credentials to return to your personalized training dashboard and track your fitness progress.
          </p>
        </div>
      </div>

      {/* Right Panel - Role Aware Form */}
      <div className="auth-right-panel">
        <div className="auth-card animate-pop">
          {/* Brand Header */}
          <div className="auth-header">
            <div className="brand-badge">
              <MdFitnessCenter size={30} className="neon-icon" />
            </div>
            <h1 className="auth-brand-title">TITANIUM FITNESS</h1>
            <p className="auth-brand-subtitle">
              {role === 'admin' ? 'Admin Management System' : 'Member Fitness Dashboard'}
            </p>
          </div>

          {/* Role Switcher Tabs (4 Roles: Member, Admin, Trainer, Receptionist) */}
          <div className="auth-role-tabs-wrapper" style={{ marginBottom: '20px' }}>
            <div className="auth-role-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                className={`role-tab ${role === 'member' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('member')}
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <MdPerson size={14} /> Member
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('admin')}
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <MdShield size={14} /> Admin
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'trainer' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('trainer')}
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <MdFitnessCenter size={14} /> Trainer
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'receptionist' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('receptionist')}
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <MdPerson size={14} /> Recep
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-custom">
              <label htmlFor="user-email">EMAIL ADDRESS</label>
              <div className="input-with-icon">
                <MdEmail className="input-icon" size={18} />
                <input
                  id="user-email"
                  type="email"
                  placeholder={role === 'admin' ? 'admin@titaniumfitness.com' : 'member@gmail.com'}
                  value={form.email}
                  onChange={e => {
                    setForm(p => ({ ...p, email: e.target.value }));
                    setForgotEmail(e.target.value);
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label htmlFor="user-password">PASSWORD</label>
              <div className="input-with-icon">
                <MdLock className="input-icon" size={18} />
                <input
                  id="user-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                />
                <span className="checkbox-label">Remember Me</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-neon-primary full-width"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : `Sign In as ${role === 'receptionist' ? 'Receptionist' : role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          {role === 'member' && (
            <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowSignUpModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </p>
          )}

          <div className="auth-footer" style={{ marginTop: 24 }}>
            <p className="security-notice">Protected by 256-bit JWT & bcrypt encryption</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content glass" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <MdClose size={22} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Enter your registered email address below. We will send password reset instructions to your email.
            </p>
            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-neon-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Sign Up Modal */}
      {showSignUpModal && (
        <div className="modal-overlay" onClick={() => setShowSignUpModal(false)}>
          <div className="modal-content glass" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Join Titanium Fitness 💪</h3>
              <button onClick={() => setShowSignUpModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <MdClose size={22} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Create your member account to access workout programs, diet plans, and progress tracking.
            </p>
            <form onSubmit={handleSignUpSubmit} className="modal-form">
              <div className="form-group-custom">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <MdPerson className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Ankur Kumar"
                    value={signUpForm.name}
                    onChange={e => setSignUpForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <MdEmail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="member@example.com"
                    value={signUpForm.email}
                    onChange={e => setSignUpForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <MdPhone className="input-icon" size={18} />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={signUpForm.phone}
                    onChange={e => setSignUpForm(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Password</label>
                <div className="input-with-icon">
                  <MdLock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={signUpForm.password}
                    onChange={e => setSignUpForm(p => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSignUpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-neon-primary" disabled={signUpLoading}>
                  {signUpLoading ? 'Creating Account...' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
