import { createFileRoute } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { FormInput } from '../components/FormInput/FormInput';
import { FormTextarea } from '../components/FormTextarea/FormTextarea';
import { useApiClient, useApiMutation } from '../integrations/api';
import { LAYOUT, SPACING } from '../constants/layout';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const { request } = useApiClient();

  useEffect(() => {
    const hasJustAuthenticated = window.location.search.includes('code=') || window.location.search.includes('state=');

    if (!authLoading && !isAuthenticated && !hasJustAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: '',
    displayName: user?.name || '',
    bio: '',
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const completeOnboarding = useApiMutation({
    path: '/auth/onboarding',
    method: 'POST',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (completeOnboarding.isPending || isRedirecting) {
      return;
    }

    try {
      setLoadingMessage('Saving your profile...');
      await completeOnboarding.mutateAsync(formData);

      setLoadingMessage('Connecting to Spotify...');
      setIsRedirecting(true);
      const { authUrl } = await request<{ authUrl: string }>('/auth/spotify/auth-url');

      setLoadingMessage('Creating profile...');
      window.location.href = authUrl;
    } catch (error) {
      console.error('Onboarding failed:', error);
      setIsRedirecting(false);
      setLoadingMessage('');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
            disabled={completeOnboarding.isPending || isRedirecting}
            className={`w-full py-2.5 px-6 bg-white text-black font-semibold rounded-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black transition-all shadow-lg ${SPACING.MARGIN_BOTTOM_MD} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
          >
            {(completeOnboarding.isPending || isRedirecting) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            )}
            {loadingMessage || 'Complete Setup'}
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
