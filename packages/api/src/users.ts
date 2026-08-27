import { z } from 'zod';
import { Pagination } from './queries';

export const TimeRangeEnum = z.enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']);

export const UserRef = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
});

export type UserRef = z.infer<typeof UserRef>;

export const TopArtistOut = z.object({
  id: z.string(),
  spotifyArtistId: z.string(),
  name: z.string(),
  genres: z.array(z.string()),
  imageUrl: z.string().nullable(),
  rank: z.number().int(),
  timeRange: TimeRangeEnum,
});

export type TopArtistOut = z.infer<typeof TopArtistOut>;

export const UserOut = z.object({
  id: z.string(),
  email: z.string().email(),
  spotifyId: z.string().nullable(),
  username: z.string(),
  displayName: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  bio: z.string().nullable(),
  spotifyProfileUrl: z.string().nullable(),
  showSpotifyProfile: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastLogin: z.coerce.date().nullable(),
});

export type UserOut = z.infer<typeof UserOut>;

export const UserProfileOut = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  bio: z.string().nullable(),
  spotifyProfileUrl: z.string().nullable(),
  showSpotifyProfile: z.boolean(),
  createdAt: z.coerce.date(),
  topArtists: z.array(TopArtistOut),
});

export type UserProfileOut = z.infer<typeof UserProfileOut>;

export const UserUpdateIn = z.object({
  displayName: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters long' })
    .max(50, { message: 'Display name must not exceed 50 characters' })
    .optional(),
  bio: z
    .string()
    .max(500, { message: 'Bio must not exceed 500 characters' })
    .optional()
    .nullable(),
  showSpotifyProfile: z.boolean().optional(),
});

export type UserUpdateIn = z.infer<typeof UserUpdateIn>;

export const UsersListFilter = Pagination.extend({
  search: z.string().optional(),
  hasTopArtists: z.boolean().optional(),
});

export type UsersListFilter = z.infer<typeof UsersListFilter>;

// Manually-built taste profile for users who haven't (or can't yet) connect
// Spotify. Powers the same matching algorithm as synced Spotify data.
export const TasteProfileIn = z.object({
  artists: z
    .array(z.string().trim().min(1).max(100))
    .min(3, { message: 'Add at least 3 artists' })
    .max(15, { message: 'You can add up to 15 artists' }),
  genres: z
    .array(z.string().trim().min(1).max(40))
    .min(1, { message: 'Add at least 1 genre' })
    .max(10, { message: 'You can add up to 10 genres' }),
});

export type TasteProfileIn = z.infer<typeof TasteProfileIn>;
