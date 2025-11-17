import { z } from 'zod';

export const EventCommentOut = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
  }),
});

export type EventCommentOut = z.infer<typeof EventCommentOut>;

export const EventCommentCreateIn = z.object({
  content: z.string().min(1).max(500),
});

export type EventCommentCreateIn = z.infer<typeof EventCommentCreateIn>;

export const EventCommentUpdateIn = z.object({
  content: z.string().min(1).max(500),
});

export type EventCommentUpdateIn = z.infer<typeof EventCommentUpdateIn>;