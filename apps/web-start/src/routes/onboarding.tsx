import { createFileRoute } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { FormInput } from '../components/FormInput/FormInput';
import { FormTextarea } from '../components/FormTextarea/FormTextarea';
import { useApiClient, useApiMutation } from '../integrations/api';
import { LAYOUT, SPACING } from '../constants/layout';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user } = useAuth0();
  const { request } = useApiClient();
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

      const { authUrl } = await request<{ authUrl: string }>('/auth/spotify/auth-url');
      window.location.href = authUrl;
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-black ${SPACING.PAGE_TOP_PADDING_XLARGE} ${SPACING.PAGE_BOTTOM_PADDING} ${SPACING.PAGE_HORIZONTAL_PADDING}`}>
      <div className={`${SPACING.CONTAINER_MAX_WIDTH_SM} mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl`}>
        <h1 className={`text-2xl font-bold text-white ${SPACING.MARGIN_BOTTOM_SM}`}>Welcome to SoundMate!</h1>
        <p className={`text-gray-300 text-sm ${SPACING.MARGIN_BOTTOM_MD}`}>Let's set up your profile</p>

        <form onSubmit={handleSubmit} className={SPACING.SPACE_SM}>
          <FormInput
            id="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            placeholder="your.email@example.com"
          />

          <FormInput
            id="username"
            label="Username"
            type="text"
            required
            value={formData.username}
            onChange={(value) => setFormData({ ...formData, username: value })}
            placeholder="Choose a unique username"
          />

          <FormInput
            id="displayName"
            label="Display Name"
            type="text"
            required
            value={formData.displayName}
            onChange={(value) => setFormData({ ...formData, displayName: value })}
            placeholder="How should we call you?"
          />

          <FormTextarea
            id="bio"
            label="Bio (Optional)"
            value={formData.bio}
            onChange={(value) => setFormData({ ...formData, bio: value })}
            placeholder="Tell us about yourself and your music taste..."
            maxLength={500}
            rows={1}
          />

          <button
            type="submit"
            disabled={completeOnboarding.isPending}
            className={`w-full py-2.5 px-6 bg-white text-black font-semibold rounded-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black transition-all shadow-lg ${SPACING.MARGIN_BOTTOM_MD} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
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
