import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { useApiMutation } from '../integrations/api';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: '',
    displayName: user?.name || '',
    bio: '',
  });

  const completeOnboarding = useApiMutation({
    path: '/auth/onboarding',
    method: 'POST',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await completeOnboarding.mutateAsync(formData);
      // Redirect to discover after successful onboarding
      navigate({ to: '/discover' });
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to SoundMate!</h1>
        <p className="text-gray-300 mb-6">Let's set up your profile</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
              Username *
            </label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Choose a unique username"
            />
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-200 mb-2">
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="How should we call you?"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-2">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself and your music taste..."
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500 characters</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={completeOnboarding.isPending}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeOnboarding.isPending ? 'Saving...' : 'Complete Setup'}
          </button>

          {completeOnboarding.isError && (
            <p className="text-red-400 text-sm text-center">
              Failed to complete onboarding. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
