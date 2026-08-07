import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  MdAssessment,
  MdSettings,
  MdDirectionsRun,
  MdRestaurantMenu
} from 'react-icons/md';

const adminNavItems = [
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

const memberNavItems = [
  { path: '/member/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
  { path: '/member/workout', icon: <MdDirectionsRun size={20} />, label: 'Workout' },
  { path: '/member/diet', icon: <MdRestaurantMenu size={20} />, label: 'Diet' },
  { path: '/member/attendance', icon: <MdCalendarToday size={20} />, label: 'Attendance' },
  { path: '/member/trainer', icon: <MdFitnessCenter size={20} />, label: 'Trainer' },
  { path: '/member/membership', icon: <MdCardMembership size={20} />, label: 'Membership' },
  { path: '/member/payments', icon: <MdPayment size={20} />, label: 'Payments' },
  { path: '/member/profile', icon: <MdPerson size={20} />, label: 'Profile' }
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role === 'admin' ? 'admin' : 'member';
  const navItems = role === 'admin' ? adminNavItems : memberNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">TF</div>
        {!collapsed && (
          <div>
            <div className="logo-text">Titanium Fitness</div>
            <div className="logo-sub">{role === 'admin' ? 'ADMIN PANEL' : 'MEMBER PORTAL'}</div>
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
        <button className="nav-item logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
          <span className="nav-icon"><MdLogout size={20} /></span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
        <button
          className="collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
