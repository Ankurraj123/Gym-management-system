import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('tf_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tf_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="layout-container">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-wrapper ${collapsed ? 'expanded' : ''}`}>
        <Topbar theme={theme} toggleTheme={toggleTheme} />
        <main className="page-content animate-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
