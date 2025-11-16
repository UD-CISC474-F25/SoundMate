export function ProfileErrorState() {
  return (
    <div className="min-h-screen bg-black pt-28 px-6 text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">Failed to load profile</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-black rounded-full hover:scale-105 transition-all shadow-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
