import { createFileRoute } from '@tanstack/react-router';
import { Avatar } from '../components/Avatar/Avatar';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  // TODO: Replace with actual user data from auth
  const mockUser = {
    name: 'Music Lover',
    school: 'University of Delaware',
    bio: 'Always looking for new music and concert buddies!',
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar size="large" name={mockUser.name} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {mockUser.name}
              </h1>
              <p className="text-gray-400 mb-2">{mockUser.school}</p>
              <p className="text-gray-300">{mockUser.bio}</p>
            </div>
            <button className="px-4 py-2 border-2 border-gray-600 text-gray-300 rounded hover:bg-gray-800 hover:text-white transition-colors font-medium">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Top Artists</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">
              Connect your Spotify account to see your top artists
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
