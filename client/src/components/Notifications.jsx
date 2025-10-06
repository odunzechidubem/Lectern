import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { io } from 'socket.io-client';
import {
  useGetMyNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useMarkOneAsReadMutation,
} from '../slices/notificationsApiSlice';
import Loader from './Loader';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'],
});

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNotifs, setNewNotifs] = useState([]);
  const dropdownRef = useRef(null);

  const { data: notifications, isLoading, error: notificationsError, refetch } =
    useGetMyNotificationsQuery();
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();
  const [markOneAsRead] = useMarkOneAsReadMutation();

  const unreadCount = (notifications?.length || 0) + newNotifs.length;

  useEffect(() => {
    socket.on('new_notification_data', (notif) => {
      setNewNotifs((prev) => [notif, ...prev]);
    });
    return () => {
      socket.off('new_notification_data');
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClearAll = () => {
    if (unreadCount > 0) {
      markNotificationsAsRead();
      setNewNotifs([]);
    }
  };

  const handleNotificationClick = (notification) => {
    markOneAsRead(notification._id);
    setIsOpen(false);
  };

  const allNotifications = [...newNotifs, ...(notifications || [])];

  const renderDropdownContent = () => {
    if (isLoading) return <div className="p-2 text-sm text-center text-gray-500">Loading...</div>;
    if (notificationsError) return <div className="p-4 text-sm text-red-500">Error loading notifications.</div>;
    if (allNotifications.length === 0)
      return <div className="p-4 text-sm text-center text-gray-500">You have no new notifications.</div>;

    return (
      <ul className="divide-y max-h-96 overflow-y-auto">
        {allNotifications.map((notif) => (
          <li key={notif._id}>
            <Link
              to={notif.link}
              onClick={() => handleNotificationClick(notif)}
              className="block w-full p-3 text-left hover:bg-gray-100"
            >
              <p className="text-sm text-gray-700">{notif.message}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-xl text-white hover:text-gray-300"
        aria-label={`View notifications. ${unreadCount} unread.`}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-16 left-0 w-full p-4 sm:absolute sm:right-0 sm:mt-2 sm:w-80 sm:p-0 z-20">
          <div className="bg-white rounded-md shadow-lg">
            <div className="flex items-center justify-between p-2 font-bold text-gray-800 border-b">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleClearAll} className="text-xs text-blue-500 hover:underline">
                  Mark all as read
                </button>
              )}
            </div>
            {renderDropdownContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
