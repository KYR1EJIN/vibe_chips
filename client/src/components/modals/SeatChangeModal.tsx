/**
 * Seat Change Confirmation Modal
 * Shows when a seated player clicks an empty seat
 */

interface SeatChangeModalProps {
  currentSeat: number;
  newSeat: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SeatChangeModal({
  currentSeat,
  newSeat,
  isOpen,
  onClose,
  onConfirm,
}: SeatChangeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Change Seat?
        </h2>
        <p className="text-gray-600 mb-6">
          You are currently in seat <span className="font-semibold">{currentSeat}</span>.
          Do you want to move to seat <span className="font-semibold">{newSeat}</span>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This request will be sent to the room owner for approval.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Seat Change
          </button>
        </div>
      </div>
    </div>
  );
}

