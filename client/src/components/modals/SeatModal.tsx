/**
 * Seat Modal component
 * Phase 1: Form for taking a seat
 */

import { useState } from 'react';

interface SeatModalProps {
  seatNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, startingStack: number) => void;
}

export function SeatModal({
  seatNumber,
  isOpen,
  onClose,
  onSubmit,
}: SeatModalProps) {
  const [username, setUsername] = useState('');
  const [startingStack, setStartingStack] = useState('1000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stack = parseInt(startingStack, 10);
    if (username.trim() && stack > 0) {
      onSubmit(username.trim(), stack);
      setUsername('');
      setStartingStack('1000');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Take Seat {seatNumber}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label
              htmlFor="startingStack"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Starting Stack
            </label>
            <input
              id="startingStack"
              type="number"
              value={startingStack}
              onChange={(e) => setStartingStack(e.target.value)}
              placeholder="1000"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Take Seat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

