/**
 * Root app loading state
 * Provides loading UI for the entire application
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-800 rounded-full mx-auto" />
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto absolute inset-0" />
        </div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
}