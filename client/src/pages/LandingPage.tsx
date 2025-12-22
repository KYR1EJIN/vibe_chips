/**
 * Landing Page component
 * Phase 0: Placeholder only - no room creation, no game features
 */

function LandingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ChipTable</h1>
        <p className="text-lg text-gray-600 mb-8">
          Real-time poker chip manager for Texas Hold'em
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Phase 0: Infrastructure Setup
          </h2>
          <p className="text-gray-600 mb-4">
            This is a placeholder landing page. Room creation and game features
            will be implemented in Phase 1+.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              ✅ Client connects to server via Socket.io
              <br />
              ✅ Connection status indicator visible
              <br />
              ✅ Infrastructure ready for Phase 1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

