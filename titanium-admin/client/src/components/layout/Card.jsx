import React from 'react';

export default function Card({ title, subtitle, icon, badge, action, className = '', children, hover = true }) {
  return (
    <div className={`glass ${hover ? 'glass-hover' : ''} ${className}`}>
      {(title || icon || action) && (
        <div className="card-header-flex">
          <div className="card-title-group">
            {icon && <span className="card-icon-accent">{icon}</span>}
            <div>
              {title && <h3 className="card-title-text">{title}</h3>}
              {subtitle && <p className="card-subtitle-text">{subtitle}</p>}
            </div>
          </div>
          {badge && <span className="card-badge">{badge}</span>}
          {action && <div className="card-action-slot">{action}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
}
