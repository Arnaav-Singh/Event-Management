import React, { useEffect, useState, useContext } from 'react';
import { getNotifications, markAsRead } from '../api/notificationApi';
import { AuthContext } from '../context/AuthContext';

const NotificationBell = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (token) {
      getNotifications(token).then(setNotifications);
    }
  }, [token]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id, token);
    setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <span role="img" aria-label="bell" className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-10">
          <div className="p-4 font-bold border-b">Notifications</div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-500">No notifications</li>
            ) : notifications.map(n => (
              <li key={n._id} className={`p-4 border-b ${n.read ? 'bg-gray-100' : ''}`}>
                <div className="flex justify-between items-center">
                  <span>{n.message}</span>
                  {!n.read && <button className="text-blue-600 text-xs" onClick={() => handleMarkAsRead(n._id)}>Mark as read</button>}
                </div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
