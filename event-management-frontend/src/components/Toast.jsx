import React from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-gray-800';
  return (
    <div className={`fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow ${bg}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
      </div>
    </div>
  );
};

export default Toast;



