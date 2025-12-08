import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Trash2, Plus, Edit, Calendar } from 'lucide-react';
import { Avatar } from '../components/Avatar/Avatar';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';
import { FilterTabs } from '../components/FilterTabs/FilterTabs';
import { ProfileSuccessMessage } from '../components/ProfileSuccessMessage/ProfileSuccessMessage';
import { ProfileErrorState } from '../components/ProfileErrorState/ProfileErrorState';
import { ProfileCardSwitcher } from '../components/ProfileCardSwitcher/ProfileCardSwitcher';
import { Modal } from '../components/Modal/Modal';
import { FormInput } from '../components/FormInput/FormInput';
import { FormTextarea } from '../components/FormTextarea/FormTextarea';
import { EditEventForm } from '../components/EventForm/EditEventForm';
import { AuroraRay } from '../components/Animations';
import { useApiClient, useApiQuery } from '../integrations/api';
import { useProfileEdit } from '../hooks/useProfileEdit';
import { useAccountDelete } from '../hooks/useAccountDelete';
import { useProfileLinks } from '../hooks/useProfileLinks';
import { useSpotifySync } from '../hooks/useSpotifySync';
import { useEvents } from '../hooks/useEvents';
import { LinkForm } from '../components/LinkForm/LinkForm';
import { APP_CONFIG } from '../constants/app';
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

type UserProfile = {
  id: string;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  spotifyProfileUrl?: string | null;
  showSpotifyProfile?: boolean;
  isOnboarded?: boolean;
  createdAt?: string;
  topArtists: Array<{
    id: string;
    spotifyArtistId: string;
    name: string;
    genres: Array<string>;
    imageUrl?: string | null;
    spotifyUri?: string | null;
    rank: number;
    timeRange: string;
  }>;
  topSongs: Array<{
    id: string;
    name: string;
    albumImage: string;
    artists: string[];
    spotifyUri?: string;
  }>;
  topGenres: string[];

};

type TimeRange = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';



function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('created');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('SHORT_TERM');
  const { request } = useApiClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [authLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      setShowSuccessMessage(true);
      window.history.replaceState({}, '', '/profile');
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  const queryClient = useQueryClient();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Only prefetch once on mount
    if (hasPrefetched.current || !isAuthenticated) return;

    hasPrefetched.current = true;
    const ranges = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'];

    ranges.forEach((range) => {
      queryClient.prefetchQuery({
        queryKey: ['users', 'me', 'profile', range],
        queryFn: () => request(`/users/me/profile?timeRange=${range}`),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      });
    });
  }, [isAuthenticated]); // Only depend on authentication status


  const { data: user, isLoading, isError } = useApiQuery<UserProfile>(
    ['users', 'me', 'profile', selectedTimeRange],
    `/users/me/profile?timeRange=${selectedTimeRange}`
  );

  const profileEdit = useProfileEdit(user, selectedTimeRange);
  const accountDelete = useAccountDelete();
  const profileLinks = useProfileLinks();
  const spotifySync = useSpotifySync();
  const eventsHook = useEvents();

  const handleConnectSpotify = async () => {
    try {
      const data = await request<{ authUrl: string }>('/auth/spotify/auth-url');
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Failed to get Spotify auth URL:', error);
    }
  };

  const handleSyncSpotify = async (force = false) => {
    try {
      await spotifySync.syncSpotify(force);
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['users', 'me', 'profile'] });
    } catch (error) {
      console.error('Failed to sync Spotify:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await profileEdit.submitUpdate();
    if (!result.success) {
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const result = await accountDelete.confirmDelete();
    if (!result.success) {
      alert('Failed to delete account. Please try again.');
    }
  };
  // Delete Event Handler
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const result = await eventsHook.deleteEvent(eventId);
      if (!result.success) {
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  // Filter Events for Current User
  const createdEvents = eventsHook.events.filter(
    (event) => event.creator.id === user?.id
  );

  // Filter Events for User Attending
  const attendingEvents = eventsHook.events.filter(
    (event) =>
      event.creator.id !== user?.id &&
      event.attendees?.some(
        (a) => a.userId === user?.id && a.status === 'GOING'
      )
  );

  if ((authLoading || !isAuthenticated) || (!user && isLoading)) {
    return (
      <div className="min-h-screen bg-black pt-28 px-6">
        <LoadingSpinner fullScreen message="Loading profile..." />
      </div>
    );
  }

  if (isError || !user) return <ProfileErrorState />;

  return (
    <div className="min-h-screen bg-black pt-28 px-6 text-gray-100">
      <div className="w-full md:w-[80%] mx-auto">
        {showSuccessMessage && <ProfileSuccessMessage />}

        <AuroraRay className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
            <div className="flex items-start gap-6">
              <Avatar
                size="large"
                name={user.displayName || user.username || 'User'}
                imageSrc={user.profilePhotoUrl || undefined}
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-1 text-white">
                  {user.displayName || user.username || 'Anonymous User'}
                </h1>
                <p className="text-gray-400 mb-1">@{user.username || 'username'}</p>
                {user.email && (
                  <p className="text-gray-400 mb-2">{user.email}</p>
                )}
                <p className="text-gray-300 mb-2">{user.bio || 'No bio yet'}</p>

                {profileLinks.links.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {profileLinks.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 cursor-pointer mr-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}

                {user.spotifyProfileUrl && user.showSpotifyProfile && (
                  <a
                    href={user.spotifyProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-green-400 hover:text-green-300 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="hidden md:inline">View Spotify Profile</span>
                    <span className="md:hidden">Spotify Profile</span>
                  </a>
                )}
              </div>
              <button
                onClick={profileEdit.openEditModal}
                className="px-4 py-2 border-2 border-white/40 text-white rounded-full hover:bg-white/10 hover:border-white/60 transition-all font-medium cursor-pointer"
              >
                <span className="hidden md:inline">Edit Profile</span>
                <svg className="md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>
        </AuroraRay>

        <AuroraRay className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between flex-wrap gap-3">
                <FilterTabs
                  tabs={[
                    { value: 'SHORT_TERM', label: APP_CONFIG.TIME_RANGES.SHORT_TERM.label },
                    { value: 'MEDIUM_TERM', label: APP_CONFIG.TIME_RANGES.MEDIUM_TERM.label },
                    { value: 'LONG_TERM', label: APP_CONFIG.TIME_RANGES.LONG_TERM.label },
                  ]}
                  activeTab={selectedTimeRange}
                  onChange={(value) => setSelectedTimeRange(value as TimeRange)}
                />
                {spotifySync.hasSpotifyConnected && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSyncSpotify(false)}
                      disabled={spotifySync.isSyncing || !spotifySync.shouldSync}
                      className="px-3 py-1.5 text-sm border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      title={spotifySync.shouldSync ? 'Sync Spotify data' : 'Sync available in ' + (spotifySync.timeUntilNextSync?.hours || 0) + 'h ' + (spotifySync.timeUntilNextSync?.minutes || 0) + 'm'}
                    >
                      <svg className={`w-4 h-4 ${spotifySync.isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {spotifySync.isSyncing ? 'Syncing...' : 'Sync Spotify'}
                    </button>
                    {spotifySync.syncMessage && (
                      <p className="text-xs text-gray-400">{spotifySync.syncMessage}</p>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-400 ">
                {APP_CONFIG.TIME_RANGES[selectedTimeRange].description}
              </p>
            </div>

            {user.topArtists && user.topSongs && user.topGenres && (
              <ProfileCardSwitcher
                topArtists={user.topArtists}
                topSongs={user.topSongs}
                topGenres={user.topGenres}
              />
            )}

          </div>
        </AuroraRay>

        <AuroraRay className="mb-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Events</h2>
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'created'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('created')}
            >
              Created ({createdEvents.length})
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'attending'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('attending')}
            >
              Attending ({attendingEvents.length})
            </button>
          </div>

            {eventsHook.eventsLoading ? (
              <LoadingSpinner message="Loading events..." />
            ) : (
              <>
                {activeTab === 'created' && (
                  <div className="space-y-4">
                    {createdEvents.length > 0 ? (
                      createdEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {event.title}
                              </h3>
                              {event.dateTime && (
                                <p className="text-sm text-gray-400 flex items-center gap-1 mb-1">
                                  <Calendar size={14} />
                                  {new Date(event.dateTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                              {event.location && (
                                <p className="text-sm text-gray-400">{event.location}</p>
                              )}
                              {event.description && (
                                <p className="text-sm text-gray-300 mt-2">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span>{event._count.attendees} attending</span>
                                <span className={`px-2 py-0.5 rounded ${
                                  event.visibility === 'PUBLIC'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {event.visibility}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => eventsHook.openEditModal(event)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Edit event"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete event"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 py-8">
                        You haven't created any events yet.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'attending' && (
                  <div className="space-y-4">
                    {attendingEvents.length > 0 ? (
                      attendingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {event.title}
                            </h3>
                            {event.dateTime && (
                              <p className="text-sm text-gray-400 flex items-center gap-1 mb-1">
                                <Calendar size={14} />
                                {new Date(event.dateTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-sm text-gray-400">{event.location}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              Created by @{event.creator.username}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 py-8">
                        You're not attending any events yet.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </AuroraRay>
      </div>

      {/* Edit Profile Modal */}
      {profileEdit.showEditModal && (
        <Modal
          isOpen={profileEdit.showEditModal}
          onClose={profileEdit.closeEditModal}
          title="Edit Profile"
        >
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <FormInput
              id="displayName"
              label="Display Name"
              type="text"
              value={profileEdit.editForm.displayName}
              onChange={(value) => profileEdit.updateField('displayName', value)}
              placeholder="Your display name"
              required
            />

            <FormTextarea
              id="bio"
              label="Bio"
              value={profileEdit.editForm.bio}
              onChange={(value) => profileEdit.updateField('bio', value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={500}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showSpotifyProfile"
                checked={profileEdit.editForm.showSpotifyProfile}
                onChange={(e) => profileEdit.updateField('showSpotifyProfile', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="showSpotifyProfile" className="text-gray-300 text-sm cursor-pointer">
                Show Spotify profile link on my public profile
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={profileEdit.closeEditModal}
                className="flex-1 px-4 py-2 border-2 border-white/40 hover:border-white/60 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileEdit.isUpdating}
                className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {profileEdit.isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-700 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Your Links</h3>
                <button
                  type="button"
                  onClick={() => {
                    profileEdit.closeEditModal();
                    profileLinks.openCreateModal();
                  }}
                  className="text-sm px-3 py-1.5 border border-white/40 text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Link
                </button>
              </div>
              {profileLinks.links.length > 0 ? (
                <div className="space-y-2">
                  {profileLinks.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{link.title}</p>
                        <p className="text-xs text-gray-400 truncate">{link.url}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            profileEdit.closeEditModal();
                            profileLinks.openEditModal(link);
                          }}
                          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${link.title}"?`)) {
                              profileLinks.deleteLink(link.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No links added yet</p>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  profileEdit.closeEditModal();
                  accountDelete.openDeleteModal();
                }}
                className="w-full text-white hover:text-red-500 hover:underline transition-all text-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Event Modal */}
      {eventsHook.showEditModal && eventsHook.editingEvent && (
        <EditEventForm
          form={eventsHook.createForm}
          updateField={eventsHook.updateFormField}
          onSubmit={eventsHook.submitUpdateEvent}
          onCancel={eventsHook.closeEditModal}
          isSaving={eventsHook.isUpdating}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {accountDelete.showDeleteModal && (
        <Modal
          isOpen={accountDelete.showDeleteModal}
          onClose={accountDelete.closeDeleteModal}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 font-semibold mb-2">⚠️ Warning</p>
              <p className="text-gray-300 text-sm">
                This action cannot be undone. This will permanently delete your account,
                all your data, events, and connections.
              </p>
            </div>

            <p className="text-gray-400 text-sm">
              Are you absolutely sure you want to delete your account?
            </p>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={accountDelete.closeDeleteModal}
                className="flex-1 px-4 py-2 border-2 border-white/40 hover:border-white/60 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={accountDelete.isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {accountDelete.isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {profileLinks.showLinksModal && (
        <Modal
          isOpen={profileLinks.showLinksModal}
          onClose={profileLinks.closeModal}
          title={profileLinks.editingLink ? 'Edit Link' : 'Add Link'}
        >
          <LinkForm
            initialData={profileLinks.editingLink ? {
              title: profileLinks.editingLink.title,
              url: profileLinks.editingLink.url,
            } : undefined}
            onSubmit={profileLinks.submitLink}
            onCancel={profileLinks.closeModal}
            isSubmitting={profileLinks.isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
}
