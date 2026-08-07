import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard,
  MdPeople,
  MdFitnessCenter,
  MdCardMembership,
  MdCalendarToday,
  MdPayment,
  MdBuild,
  MdCampaign,
  MdPerson,
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
  MdNotifications,
  MdLightMode,
  MdDarkMode,
  MdSettings,
  MdAssessment,
  MdRestaurantMenu,
  MdDirectionsRun,
  MdCheckCircle,
  MdWarning,
  MdInfo
} from 'react-icons/md';

const navItems = [
  { path: '/admin/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
  { path: '/admin/members', icon: <MdPeople size={20} />, label: 'Members' },
  { path: '/admin/trainers', icon: <MdFitnessCenter size={20} />, label: 'Trainers' },
  { path: '/admin/plans', icon: <MdCardMembership size={20} />, label: 'Membership Plans' },
  { path: '/admin/workouts', icon: <MdDirectionsRun size={20} />, label: 'Workout Programs' },
  { path: '/admin/diet', icon: <MdRestaurantMenu size={20} />, label: 'Diet Plans' },
  { path: '/admin/attendance', icon: <MdCalendarToday size={20} />, label: 'Attendance' },
  { path: '/admin/payments', icon: <MdPayment size={20} />, label: 'Payments' },
  { path: '/admin/equipment', icon: <MdBuild size={20} />, label: 'Equipment' },
  { path: '/admin/announcements', icon: <MdCampaign size={20} />, label: 'Announcements' },
  { path: '/admin/reports', icon: <MdAssessment size={20} />, label: 'Reports' },
  { path: '/admin/settings', icon: <MdSettings size={20} />, label: 'Settings' },
  { path: '/admin/profile', icon: <MdPerson size={20} />, label: 'Profile' }
];

const mockNotifications = [
  { id: 1, title: 'Membership Expired', message: 'Sneha Patel plan expired yesterday.', time: '10m ago', type: 'warning' },
  { id: 2, title: 'Payment Received', message: 'Ankur Kumar paid ₹4,999 for Premium plan.', time: '1h ago', type: 'success' },
  { id: 3, title: 'New Member Registered', message: 'Vikram Joshi joined VIP Membership.', time: '3h ago', type: 'info' },
  { id: 4, title: 'Equipment Maintenance Due', message: 'Elliptical Trainer #2 maintenance required.', time: '5h ago', type: 'warning' },
  { id: 5, title: 'Trainer Leave Request', message: 'Priya Singh requested leave for Friday.', time: '1d ago', type: 'info' }
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('tf_admin_theme') || 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tf_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">TF</div>
          {!collapsed && (
            <div>
              <div className="logo-text">Titanium Fitness</div>
              <div className="logo-sub">ADMIN PANEL</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="nav-item"
            onClick={logout}
            title={collapsed ? 'Logout' : ''}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          >
            <span className="nav-icon" style={{ color: '#ef4444' }}><MdLogout size={20} /></span>
            {!collapsed && <span style={{ color: '#ef4444', fontWeight: 600 }}>Logout</span>}
          </div>
        </div>

        <button className="sidebar-toggle" onClick={() => setCollapsed(p => !p)} title="Toggle sidebar">
          {collapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Container */}
      <div className={`main ${collapsed ? 'collapsed' : ''}`}>
        <header className="topbar">
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{admin?.name || 'Admin'}</span>
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <MdLightMode size={18} color="#f59e0b" /> : <MdDarkMode size={18} color="#8b5cf6" />}
            </button>

            {/* Notifications Icon & Drawer */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Notifications"
              >
                <MdNotifications size={20} />
                {notifications.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--neon)',
                      color: '#000',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div
                  className="glass"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '320px',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        style={{ background: 'none', border: 'none', color: 'var(--neon)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          style={{
                            display: 'flex',
                            gap: '10px',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ color: n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#14f195' : '#3b82f6', marginTop: '2px' }}>
                            {n.type === 'warning' ? <MdWarning size={16} /> : n.type === 'success' ? <MdCheckCircle size={16} /> : <MdInfo size={16} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.3' }}>{n.message}</div>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '4px' }}>{n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Info */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('/admin/profile')}
            >
              <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{admin?.name || 'Admin'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--neon)', fontWeight: 600 }}>{admin?.role || 'Super Admin'}</div>
              </div>
              <div className="admin-avatar" style={{ border: '2px solid var(--neon)' }}>
                {admin?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
