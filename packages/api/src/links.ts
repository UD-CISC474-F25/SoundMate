import { z } from 'zod';

export const LinkOut = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  url: z.string().url(),
  order: z.number().int(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type LinkOut = z.infer<typeof LinkOut>;

export const Link = LinkOut;
export type Link = LinkOut;

export const CreateLinkDto = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title must be 50 characters or less'),
  url: z.string().url('Must be a valid URL'),
  order: z.number().int().min(0).optional(),
});

export type CreateLinkDto = z.infer<typeof CreateLinkDto>;

export const UpdateLinkDto = z.object({
  title: z.string().min(1).max(50).optional(),
  url: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
});

export type UpdateLinkDto = z.infer<typeof UpdateLinkDto>;
