import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useCurrentUser } from '../integrations/api';

/**
 * Hook to redirect users to onboarding if they haven't completed it
 * Call this in protected routes to ensure users complete onboarding first
 */
export function useOnboardingRedirect() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    // Don't redirect if still loading or not authenticated
    if (authLoading || userLoading || !isAuthenticated) return;

    // Don't redirect if already on onboarding page
    if (location.pathname === '/onboarding') return;

    // Redirect to onboarding if user hasn't completed it
    if (currentUser && !(currentUser as any).isOnboarded) {
      navigate({ to: '/onboarding' });
    }
  }, [isAuthenticated, authLoading, userLoading, currentUser, location.pathname, navigate]);

  return {
    isCheckingOnboarding: authLoading || userLoading,
    needsOnboarding: currentUser && !(currentUser as any).isOnboarded,
  };
}
