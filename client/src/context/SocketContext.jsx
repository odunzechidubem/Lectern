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
    // Only establish a connection if the user is logged in
    if (userInfo) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });
      setSocket(newSocket);

      // Disconnect when the user logs out or the component unmounts
      return () => {
        newSocket.disconnect();
      };
    } else {
      // If the user logs out, make sure any existing socket is disconnected and cleared
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