import { z } from 'zod';
import { Pagination } from './queries';

export const ConnectionStatusEnum = z.enum(['PENDING', 'ACCEPTED']);

export const ConnectionRef = z.object({
  id: z.string(),
  status: ConnectionStatusEnum,
  createdAt: z.coerce.date(),
});

export type ConnectionRef = z.infer<typeof ConnectionRef>;

export const ConnectionOut = z.object({
  id: z.string(),
  status: ConnectionStatusEnum,
  compatibilityScore: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  requesterId: z.string(),
  receiverId: z.string(),
  requester: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
  }).optional(),
  receiver: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
  }).optional(),
});

export type ConnectionOut = z.infer<typeof ConnectionOut>;

export const ConnectionCreateIn = z.object({
  receiverId: z.string(),
});

export type ConnectionCreateIn = z.infer<typeof ConnectionCreateIn>;

export const ConnectionUpdateIn = z.object({
  status: ConnectionStatusEnum,
});

export type ConnectionUpdateIn = z.infer<typeof ConnectionUpdateIn>;

export const ConnectionsListFilter = Pagination.extend({
  status: ConnectionStatusEnum.optional(),
  userId: z.string().optional(), 
});

export type ConnectionsListFilter = z.infer<typeof ConnectionsListFilter>;

export const MatchOut = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
    bio: z.string().nullable(),
  }),
  compatibilityScore: z.number(),
  sharedArtists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      imageUrl: z.string().nullable(),
    })
  ),
  sharedGenres: z.array(z.string()),
});

export type MatchOut = z.infer<typeof MatchOut>;
