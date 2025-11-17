import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useOnboardingRedirect } from '../hooks/useOnboardingRedirect';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const { isCheckingOnboarding } = useOnboardingRedirect();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  if (authLoading || !isAuthenticated || isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <div className="text-white p-8">Hello "/dashboard"!</div>;
}
