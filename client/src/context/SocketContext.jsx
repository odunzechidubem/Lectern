import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      // Corrected: Use environment variable for the backend URL.
      // Add VITE_SOCKET_URL to your .env file (e.g., VITE_SOCKET_URL=https://lectern-usqo.onrender.com)
      const socketUrl = import.meta.env.VITE_SOCKET_URL;
      
      const newSocket = io(socketUrl, {
        withCredentials: true,
        query: { userId: userInfo._id }, // send userId to server for authentication
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};