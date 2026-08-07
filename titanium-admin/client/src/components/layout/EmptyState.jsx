import React from 'react';
import { MdFitnessCenter } from 'react-icons/md';

export default function EmptyState({ icon, title = 'No Data Available', message = 'There are no records to display at this moment.', action }) {
  return (
    <div className="empty-state-card glass">
      <div className="empty-icon">{icon || <MdFitnessCenter size={48} color="var(--accent)" />}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
