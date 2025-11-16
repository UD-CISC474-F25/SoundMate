export function ProfileSuccessMessage() {
  return (
    <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mb-6 flex items-center gap-3">
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <div>
        <p className="text-green-100 font-semibold">Spotify Connected Successfully!</p>
        <p className="text-green-200 text-sm">Your top artists have been synced.</p>
      </div>
    </div>
  );
}
