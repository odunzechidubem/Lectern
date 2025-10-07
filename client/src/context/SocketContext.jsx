// /src/context/SocketContext.jsx

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
      const socketUrl = import.meta.env.VITE_SOCKET_URL;
      if (!socketUrl) {
        console.error('[Socket] VITE_SOCKET_URL is not defined. Real-time features will not work in production.');
        return;
      }
      
      const newSocket = io(socketUrl, {
        withCredentials: true,
        // --- THIS IS THE CRITICAL FIX ---
        // Force WebSocket transport for all real-time communication
        transports: ['websocket'],
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