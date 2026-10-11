import React from 'react';

export default function Toast({ message, isVisible }) {
  return (
    <div 
      className={`toast-notice ${isVisible ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
