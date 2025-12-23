/**
 * Landing Page component
 * Phase 1: Room creation and joining
 */

import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

interface LandingPageProps {
  onJoinRoom: (roomId: string) => void;
}

function LandingPage({ onJoinRoom }: LandingPageProps) {
  const socket = useSocket();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = () => {
    if (!socket || isCreating) return;
    setIsCreating(true);
    socket.emit('create_room', {});
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !joinRoomId.trim()) return;
    onJoinRoom(joinRoomId.trim());
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ChipTable</h1>
        <p className="text-lg text-gray-600 mb-8">
          Real-time poker chip manager for Texas Hold'em
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Start New Game */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Start New Game
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating || !socket}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Start New Game'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Join Game */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Join Game
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={!joinRoomId.trim() || !socket}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Join Game
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

