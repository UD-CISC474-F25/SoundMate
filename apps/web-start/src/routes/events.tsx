import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/events')({
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="min-h-screen bg-black pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Events</h1>
            <p className="text-gray-400">
              Find concerts and music events near you
            </p>
          </div>
          <button className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors">
            Create Event
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Events feature coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
