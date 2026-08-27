import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar } from '../Avatar/Avatar';
import { AuroraRay } from '../Animations';
import { SpotifyGateModal } from '../SpotifyGateModal/SpotifyGateModal';
import { useApiQuery } from '../../integrations/api';

type UserProfile = {
  displayName?: string | null;
  username?: string | null;
  profilePhotoUrl?: string | null;
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpotifyGate, setShowSpotifyGate] = useState(false);
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0();

  const { data: userProfile } = useApiQuery<UserProfile>(
    ['users', 'me', 'profile-basic'],
    '/users/me/profile',
    { enabled: isAuthenticated }
  );

  // Hide navbar links on onboarding page
  const isOnboardingPage = typeof window !== 'undefined' && window.location.pathname === '/onboarding';
  const isLandingPage = typeof window !== 'undefined' && window.location.pathname === '/';

  const handleLogin = () => {
    // Spotify is still in developer mode (Spotify caps this at 25
    // manually-approved accounts), so route everyone through a quick
    // gate that explains the allowlist and offers a Spotify-free way in.
    setShowSpotifyGate(true);
  };

  const continueWithSpotify = () => {
    setShowSpotifyGate(false);
    loginWithRedirect({
      appState: { returnTo: '/profile' }
    });
  };

  const continueWithoutSpotify = () => {
    setShowSpotifyGate(false);
    loginWithRedirect({
      authorizationParams: {
        connection: 'Username-Password-Authentication',
        screen_hint: 'signup',
        // Force a fresh login screen instead of silently reusing an
        // existing Auth0 SSO session (e.g. from a prior Spotify login in
        // this browser) — without this, an active session skips straight
        // past the connection we asked for and back into the old account.
        prompt: 'login',
      },
      // NOT `returnTo: '/onboarding'` — this same "Continue without
      // Spotify" button is also how a returning user logs back in (via the
      // "Log in" link on Auth0's signup screen). Auth0's SDK honors
      // `appState.returnTo` unconditionally, so hardcoding /onboarding
      // here was sending already-onboarded users straight back to the
      // onboarding form on every login. Land on /profile like every other
      // login path instead; useOnboardingRedirect already sends genuinely
      // new users on to /onboarding from there.
      appState: { returnTo: '/profile' },
    });
  };

  const handleLogout = () => {
    // Otherwise the next person to log in on this browser (or the same
    // person logging back in) can briefly see the previous session's
    // cached /users/me, profile, and other query data.
    queryClient.clear();
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  // Don't render navbar on onboarding page
  if (isOnboardingPage) {
    return null;
  }

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none">
      <AuroraRay variant="warm" rounded="rounded-full">
        <nav className="flex items-center justify-between gap-4 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:bg-white/15 hover:shadow-xl">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <span className="text-xl font-bold text-white">SoundMate</span>
          </Link>

        {/* Show hamburger only if authenticated OR not on landing page, and not on onboarding page */}
        {(isAuthenticated || !isLandingPage) && !isOnboardingPage && (
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        )}

        {/* Show login button on mobile when on landing page and not authenticated */}
        {isLandingPage && !isAuthenticated && (
          <button
            onClick={handleLogin}
            className="md:hidden px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Log In'}
          </button>
        )}

        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && !isOnboardingPage ? (
            <>
              <Link
                to="/"
                className="relative text-gray-300 text-sm transition-all duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full cursor-pointer"
                activeProps={{
                  className: 'font-semibold text-white after:w-full',
                }}
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="relative text-gray-300 text-sm transition-all duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full cursor-pointer"
                activeProps={{
                  className: 'font-semibold text-white after:w-full',
                }}
              >
                Discover
              </Link>
              <Link
                to="/events"
                className="relative text-gray-300 text-sm transition-all duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full cursor-pointer"
                activeProps={{
                  className: 'font-semibold text-white after:w-full',
                }}
              >
                Events
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Avatar
                  size="small"
                  imageSrc={userProfile?.profilePhotoUrl || undefined}
                  name={userProfile?.displayName || userProfile?.username || user?.name}
                />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Log In'}
            </button>
          )}
        </div>
      </nav>
      </AuroraRay>

      {isOpen && (
        <div className="absolute top-16 left-6 right-6 md:hidden pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              {isAuthenticated && !isOnboardingPage ? (
                <>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/discover"
                    className="text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Discover
                  </Link>
                  <Link
                    to="/events"
                    className="text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                  >
                    Log Out
                  </button>
                </>
              ) : !isOnboardingPage ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogin();
                  }}
                  className="w-full px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Log In'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>

    <SpotifyGateModal
      isOpen={showSpotifyGate}
      onClose={() => setShowSpotifyGate(false)}
      onContinueWithSpotify={continueWithSpotify}
      onContinueWithoutSpotify={continueWithoutSpotify}
    />
    </>
  );
}
