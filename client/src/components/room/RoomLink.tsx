/**
 * Room Link component
 * Phase 1: Display and copy room link
 */

import { useState } from 'react';

interface RoomLinkProps {
  roomId: string;
}

export function RoomLink({ roomId }: RoomLinkProps) {
  const [copied, setCopied] = useState(false);
  const roomUrl = `${window.location.origin}?room=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Room Link</h3>
      <div className="mb-2">
        <p className="text-xs text-gray-600 mb-1">Room ID:</p>
        <p className="text-2xl font-mono font-bold tracking-widest text-gray-800">{roomId}</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={roomUrl}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Share this link to invite players</p>
    </div>
  );
}

