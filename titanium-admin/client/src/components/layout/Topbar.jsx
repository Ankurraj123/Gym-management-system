import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  MdSearch,
  MdNotifications,
  MdLightMode,
  MdDarkMode,
  MdLogout,
  MdCheckCircle,
  MdWarning,
  MdInfo
} from 'react-icons/md';

export default function Topbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s for real-time notifications
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="search-bar">
        <MdSearch size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search modules, members, workouts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <button
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <div className="notification-wrapper">
          <button
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <MdNotifications size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown glass">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button className="clear-all" onClick={handleClearAll}>Mark All Read</button>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <div className="no-notifications">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`notification-item ${n.type || 'info'} ${n.isRead ? 'read' : ''}`}>
                      <div className="n-icon">
                        {n.type === 'success' && <MdCheckCircle color="#10b981" />}
                        {n.type === 'danger' && <MdWarning color="#ef4444" />}
                        {n.type === 'warning' && <MdWarning color="#f59e0b" />}
                        {(!n.type || n.type === 'info') && <MdInfo color="#3b82f6" />}
                      </div>
                      <div className="n-content">
                        <div className="n-title">{n.title}</div>
                        <div className="n-message">{n.message}</div>
                        <div className="n-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="avatar">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              <span>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role badge-role">{user?.role === 'admin' ? '🛡 Admin' : '👤 Member'}</div>
          </div>
          <button className="icon-btn logout-header" onClick={handleLogout} title="Logout">
            <MdLogout size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
