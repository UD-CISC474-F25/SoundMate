import { z } from 'zod';
import { Pagination } from './queries';

export const EventVisibilityEnum = z.enum(['PUBLIC', 'PRIVATE']);
export const AttendeeStatusEnum = z.enum(['INVITED', 'GOING', 'MAYBE', 'DECLINED']);

export const EventRef = z.object({
  id: z.string(),
  title: z.string(),
  dateTime: z.coerce.date().nullable(),
  visibility: EventVisibilityEnum,
});

export type EventRef = z.infer<typeof EventRef>;

export const ArtistRef = z.object({
  id: z.string(),
  spotifyArtistId: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
});

export type ArtistRef = z.infer<typeof ArtistRef>;

export const EventOut = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dateTime: z.coerce.date().nullable(),
  location: z.string().nullable(),
  musicTag: z.string().nullable(),
  visibility: EventVisibilityEnum,
  maxAttendees: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  creatorId: z.string(),
  artistId: z.string().nullable(),
  creator: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
  }).optional(),
  artist: ArtistRef.optional().nullable(),
  attendeesCount: z.number().int().optional(),
  userAttendanceStatus: AttendeeStatusEnum.optional().nullable(),
});

export type EventOut = z.infer<typeof EventOut>;

export const EventCreateIn = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100),
  description: z.string().max(1000).optional().nullable(),
  dateTime: z.string().optional().nullable(), // ISO string
  location: z.string().max(200).optional().nullable(),
  musicTag: z.string().max(50).optional().nullable(),
  artistId: z.string().optional().nullable(),
  visibility: EventVisibilityEnum.optional().default('PRIVATE'),
  maxAttendees: z.number().int().positive().optional().nullable(),
});

export type EventCreateIn = z.infer<typeof EventCreateIn>;

export const EventUpdateIn = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  dateTime: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  musicTag: z.string().max(50).optional().nullable(),
  artistId: z.string().optional().nullable(),
  visibility: EventVisibilityEnum.optional(),
  maxAttendees: z.number().int().positive().optional().nullable(),
});

export type EventUpdateIn = z.infer<typeof EventUpdateIn>;

export const EventRsvpIn = z.object({
  status: AttendeeStatusEnum,
});

export type EventRsvpIn = z.infer<typeof EventRsvpIn>;

export const EventAttendeeOut = z.object({
  id: z.string(),
  status: AttendeeStatusEnum,
  createdAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
  }),
});

export type EventAttendeeOut = z.infer<typeof EventAttendeeOut>;

export const EventsListFilter = Pagination.extend({
  visibility: EventVisibilityEnum.optional(),
  creatorId: z.string().optional(),
  artistId: z.string().optional(),
  upcoming: z.boolean().optional(), 
  attending: z.boolean().optional(), 
});

export type EventsListFilter = z.infer<typeof EventsListFilter>;
