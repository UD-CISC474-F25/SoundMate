import { Link } from './links/entities/link.entity';

import { CreateLinkDto } from './links/dto/create-link.dto';
import { UpdateLinkDto } from './links/dto/update-link.dto';

export const links = {
  dto: {
    CreateLinkDto,
    UpdateLinkDto,
  },
  entities: {
    Link,
  },
};

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
