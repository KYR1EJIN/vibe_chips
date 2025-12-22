import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import LandingPage from './pages/LandingPage';

/**
 * Root App component
 * Phase 0: Basic connection status and landing page only
 */
function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`px-4 py-2 rounded-lg shadow-md ${
            isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-200' : 'bg-red-200'
              }`}
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <LandingPage />
    </div>
  );
}

export default App;

