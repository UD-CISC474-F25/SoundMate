import { z } from 'zod';
import { TimeRangeEnum } from './users';

export const SpotifyProfileOut = z.object({
  id: z.string(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  images: z
    .array(
      z.object({
        url: z.string(),
        height: z.number().nullable(),
        width: z.number().nullable(),
      })
    )
    .optional(),
  external_urls: z
    .object({
      spotify: z.string(),
    })
    .optional(),
});

export type SpotifyProfileOut = z.infer<typeof SpotifyProfileOut>;

export const SpotifyArtistOut = z.object({
  id: z.string(),
  name: z.string(),
  genres: z.array(z.string()),
  images: z
    .array(
      z.object({
        url: z.string(),
        height: z.number().nullable(),
        width: z.number().nullable(),
      })
    )
    .optional(),
  uri: z.string(),
  external_urls: z
    .object({
      spotify: z.string(),
    })
    .optional(),
});

export type SpotifyArtistOut = z.infer<typeof SpotifyArtistOut>;

export const SpotifySyncIn = z.object({
  spotifyAccessToken: z.string().min(1),
  spotifyRefreshToken: z.string().min(1),
  timeRange: TimeRangeEnum.optional().default('LONG_TERM'),
});

export type SpotifySyncIn = z.infer<typeof SpotifySyncIn>;

export const SpotifySyncOut = z.object({
  syncedArtists: z.number().int(),
  lastSyncedAt: z.coerce.date(),
  topArtists: z.array(
    z.object({
      id: z.string(),
      spotifyArtistId: z.string(),
      name: z.string(),
      genres: z.array(z.string()),
      imageUrl: z.string().nullable(),
      rank: z.number().int(),
      timeRange: TimeRangeEnum,
    })
  ),
});

export type SpotifySyncOut = z.infer<typeof SpotifySyncOut>;
