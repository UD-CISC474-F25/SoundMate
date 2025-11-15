import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar } from '../Avatar/Avatar';
import { AuroraRay } from '../Animations';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/home' }
    });
  };

  const handleLogout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none">
      <AuroraRay rounded="rounded-full">
        <nav className="flex items-center justify-between gap-4 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-lg pointer-events-auto transition-all duration-300 hover:bg-white/15 hover:shadow-xl">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <span className="text-xl font-bold text-white">SoundMate</span>
          </Link>

        <button
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
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

        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className="relative text-gray-300 text-sm transition-all duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full"
                activeProps={{
                  className: 'font-semibold text-white after:w-full',
                }}
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="relative text-gray-300 text-sm transition-all duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full"
                activeProps={{
                  className: 'font-semibold text-white after:w-full',
                }}
              >
                Discover
              </Link>
              <Link
                to="/events"
                className="relative text-gray-300 text-sm transition-all duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full"
                activeProps={{
                  className: 'font-semibold text-white after:w-full',
                }}
              >
                Events
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar size="small" imageSrc={user?.picture} name={user?.name} />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Login with Auth0'}
            </button>
          )}
        </div>
      </nav>
      </AuroraRay>

      {isAuthenticated && isOpen && (
        <div className="absolute top-16 left-6 right-6 md:hidden pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/discover"
                className="text-gray-300 hover:text-white transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Discover
              </Link>
              <Link
                to="/events"
                className="text-gray-300 hover:text-white transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="text-left text-gray-300 hover:text-white transition-all duration-200"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
