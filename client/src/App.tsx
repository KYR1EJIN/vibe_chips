import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './context/SocketContext';
import { RoomContext } from './context/RoomContext';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';
import { RoomState } from '@vibe-chips/shared';

/**
 * Root App component
 * Phase 1: Socket connection, routing, room state management
 */
function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'room'>('landing');
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    // In production (served from same server), use current origin
    // In development or if VITE_SERVER_URL is set, use that
    const serverUrl = import.meta.env.VITE_SERVER_URL || 
      (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);

      // Check for room ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const roomIdParam = urlParams.get('room');
      if (roomIdParam) {
        newSocket.emit('join_room', { roomId: roomIdParam });
        setRoomId(roomIdParam);
        setCurrentPage('room');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });

    // Handle room_created event
    newSocket.on('room_created', (data: { roomId: string }) => {
      console.log('Room created:', data.roomId);
      setRoomId(data.roomId);
      // Don't switch to room page yet - wait for room_state event
      // Update URL without reload
      window.history.pushState({}, '', `?room=${data.roomId}`);
    });

    // Handle room_state updates
    newSocket.on('room_state', (data: { room: RoomState }) => {
      console.log('Room state updated:', data.room);
      setRoomState(data.room);
      if (data.room.roomId) {
        setRoomId(data.room.roomId);
        // Switch to room page when we have the room state
        setCurrentPage('room');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle navigation
  const handleJoinRoom = (id: string) => {
    if (socket) {
      socket.emit('join_room', { roomId: id });
      setRoomId(id);
      setCurrentPage('room');
    }
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setRoomState(null);
    setRoomId(null);
  };

  return (
    <SocketContext.Provider value={socket}>
      <RoomContext.Provider value={roomState}>
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
          {currentPage === 'landing' ? (
            <LandingPage onJoinRoom={handleJoinRoom} />
          ) : (
            <RoomPage roomId={roomId} onBack={handleBackToLanding} />
          )}
        </div>
      </RoomContext.Provider>
    </SocketContext.Provider>
  );
}

export default App;

