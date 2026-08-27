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
  // Require a confirmed successful fetch (`isSuccess`), not just "not
  // currently loading" — belt-and-suspenders so this only ever acts on a
  // real, completed read of the server's onboarding state.
  const { data: currentUser, showLoading: userLoading, isSuccess } = useCurrentUser();

  useEffect(() => {
    // Don't redirect if still loading, not authenticated, or we don't yet
    // have a confirmed successful read of the user's onboarding state.
    if (authLoading || userLoading || !isAuthenticated || !isSuccess) return;

    // Don't redirect if already on onboarding page
    if (location.pathname === '/onboarding') return;

    // Redirect to onboarding if user hasn't completed it
    if (currentUser && !(currentUser as any).isOnboarded) {
      navigate({ to: '/onboarding' });
    }
  }, [isAuthenticated, authLoading, userLoading, isSuccess, currentUser, location.pathname, navigate]);

  return {
    isCheckingOnboarding: authLoading || userLoading || !isSuccess,
    needsOnboarding: currentUser && !(currentUser as any).isOnboarded,
  };
}
