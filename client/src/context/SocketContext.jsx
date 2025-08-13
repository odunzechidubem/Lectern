import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

// --- THIS IS THE DEFINITIVE FIX ---
// In development, it will connect to http://localhost:5000.
// In production, it will connect to your live Render URL.
const SOCKET_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
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
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};