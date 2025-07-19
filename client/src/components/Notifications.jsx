import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useGetMyNotificationsQuery, useMarkOneAsReadMutation } from '../slices/notificationsApiSlice';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: notifications, isLoading } = useGetMyNotificationsQuery();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  const unreadCount = notifications?.length || 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // --- NEW HANDLER for individual clicks ---
  const handleNotificationClick = async (notificationId) => {
    try {
      // Mark this specific notification as read on the backend
      await markOneAsRead(notificationId).unwrap();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
    // Close the dropdown after clicking
    setIsOpen(false);
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
          <div className="p-2 font-bold text-gray-800 border-b">Notifications</div>
          {isLoading ? (
            <div className="p-2 text-sm text-gray-500">Loading...</div>
          ) : unreadCount > 0 ? (
            <ul className="divide-y max-h-96 overflow-y-auto">
              {notifications.map(notif => (
                <li key={notif._id}>
                  {/* The onClick now calls our new handler */}
                  <Link
                    to={notif.link}
                    onClick={() => handleNotificationClick(notif._id)}
                    className="block p-3 hover:bg-gray-100"
                  >
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-gray-500">You have no new notifications.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;