// Socket Hook
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      auth: {
        token: token || ''
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;