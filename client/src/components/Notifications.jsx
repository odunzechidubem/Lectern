import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import {
  useGetMyNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useMarkOneAsReadMutation,
} from '../slices/notificationsApiSlice';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useGetMyNotificationsQuery();
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  const unreadCount = notifications?.length || 0;

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClearAll = () => { if (unreadCount > 0) markNotificationsAsRead(); };
  const handleNotificationClick = (notification) => {
    markOneAsRead(notification._id);
    setIsOpen(false);
    navigate(notification.link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-xl text-white hover:text-gray-300">
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
          <div className="p-2 flex justify-between items-center font-bold text-gray-800 border-b">
            <span>Notifications</span>
            {unreadCount > 0 && (<button onClick={handleClearAll} className="text-xs text-blue-500 hover:underline">Mark all as read</button>)}
          </div>
          {isLoading ? (<div className="p-2 text-sm text-gray-500">Loading...</div>) : unreadCount > 0 ? (
            <ul className="divide-y max-h-96 overflow-y-auto">
              {notifications.map(notif => (
                <li key={notif._id}>
                  <button onClick={() => handleNotificationClick(notif)} className="w-full text-left block p-3 hover:bg-gray-100">
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (<div className="p-4 text-sm text-gray-500">You have no new notifications.</div>)}
        </div>
      )}
    </div>
  );
};
export default Notifications;