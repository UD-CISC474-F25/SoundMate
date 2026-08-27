export const APP_CONFIG = {
  PAGINATION: {
    EVENTS_PER_PAGE: 10,
    USERS_PER_PAGE: 20,
  },
  TIME_RANGES: {
    SHORT_TERM: {
      value: 'SHORT_TERM' as const,
      label: 'Last 4 Weeks',
      description: 'Your most recent listening habits'
    },
    MEDIUM_TERM: {
      value: 'MEDIUM_TERM' as const,
      label: 'Last 6 Months',
      description: 'Your listening trends over half a year'
    },
    LONG_TERM: {
      value: 'LONG_TERM' as const,
      label: 'All Time',
      description: 'Your favorite artists over several years'
    }
  },
  TOP_ARTISTS: {
    DISPLAY_COUNT: 6,
    MAX_COUNT: 20,
  }
} as const;

export const CONNECTION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  NONE: 'NONE'
} as const;

export const EVENT_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE'
} as const;

export const ATTENDEE_STATUS = {
  INVITED: 'INVITED',
  GOING: 'GOING',
  MAYBE: 'MAYBE',
  DECLINED: 'DECLINED'
} as const;

export const ROUTES = {
  HOME: '/',
  DISCOVER: '/discover',
  EVENTS: '/events',
  PROFILE: '/profile',
  ONBOARDING: '/onboarding',
} as const;

export const API_ENDPOINTS = {
  USERS: {
    ME: '/users/me',
    ME_PROFILE: '/users/me/profile',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE_BY_ID: (id: string) => `/users/${id}/profile`,
  },
  AUTH: {
    LOGIN: '/auth/login',
    ONBOARDING: '/auth/onboarding',
    SPOTIFY_AUTH_URL: '/auth/spotify/auth-url',
    SPOTIFY_CALLBACK: '/auth/spotify/callback',
    SPOTIFY_CONNECT: '/auth/spotify/connect',
  },
  SPOTIFY: {
    SYNC: '/spotify/sync',
  },
  EVENTS: {
    LIST: '/events',
    BY_ID: (id: string) => `/events/${id}`,
    MY_EVENTS: '/events/my',
    ATTEND: (id: string) => `/events/${id}/attend`,
  },
  CONNECTIONS: {
    LIST: '/connections',
    REQUEST: '/connections/request',
    BY_ID: (id: string) => `/connections/${id}`,
    PENDING: '/connections/pending',
    FRIENDS: '/connections/friends',
  }
} as const;
