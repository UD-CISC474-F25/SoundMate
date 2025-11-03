import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/discover')({
  component: DiscoverPage,
});

function DiscoverPage() {
  return (
    <div className="min-h-screen bg-black pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Discover</h1>
        <p className="text-gray-400 mb-8">
          Find friends who share your music taste
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Friend discovery feature coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
