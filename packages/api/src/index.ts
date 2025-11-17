export { Link, CreateLinkDto, UpdateLinkDto } from './links';

export { IdParam, Pagination } from './queries';

export { LoginIn, CompleteOnboardingIn, AuthOut } from './auth';

export {
  UserRef,
  UserOut,
  UserProfileOut,
  UserUpdateIn,
  UsersListFilter,
  TopArtistOut,
  TimeRangeEnum,
} from './users';

// Export event schemas
export {
  EventRef,
  EventOut,
  EventCreateIn,
  EventUpdateIn,
  EventRsvpIn,
  EventAttendeeOut,
  EventCommentOut,
  EventCommentCreateIn,
  EventCommentUpdateIn,
  EventsListFilter,
  EventVisibilityEnum,
  AttendeeStatusEnum,
  ArtistRef,
} from './events';

export {
  SpotifyProfileOut,
  SpotifyArtistOut,
  SpotifySyncIn,
  SpotifySyncOut,
} from './spotify';

export {
  ConnectionRef,
  ConnectionOut,
  ConnectionCreateIn,
  ConnectionUpdateIn,
  ConnectionsListFilter,
  ConnectionStatusEnum,
  MatchOut,
} from './connections';
