/**
 * Seat Change Requests component
 * Shows pending seat change requests for the owner
 */

import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { SeatChangeRequestPayload } from '@vibe-chips/shared';

export function SeatChangeRequests() {
  const socket = useSocket();
  const [requests, setRequests] = useState<SeatChangeRequestPayload[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleSeatChangeRequest = (request: SeatChangeRequestPayload) => {
      setRequests((prev) => [...prev, request]);
    };

    socket.on('seat_change_request', handleSeatChangeRequest);

    return () => {
      socket.off('seat_change_request', handleSeatChangeRequest);
    };
  }, [socket]);

  const handleApprove = (playerId: string, newSeatNumber: number) => {
    if (!socket) return;
    socket.emit('owner_approve_seat_change', { playerId, newSeatNumber });
    setRequests((prev) => prev.filter((r) => r.playerId !== playerId));
  };

  const handleReject = (playerId: string) => {
    setRequests((prev) => prev.filter((r) => r.playerId !== playerId));
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Seat Change Requests
      </h3>
      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.playerId}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {request.username}
              </p>
              <p className="text-xs text-gray-600">
                Seat {request.currentSeatNumber} → Seat {request.newSeatNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(request.playerId, request.newSeatNumber)}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(request.playerId)}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

