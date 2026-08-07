import React from 'react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="neon-spinner-large" />
      <p className="loader-text">{text}</p>
    </div>
  );
}
