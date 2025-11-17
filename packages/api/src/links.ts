import { z } from 'zod';

export const Link = z.object({
  id: z.number().int(),
  title: z.string(),
  url: z.string().url(),
  description: z.string(),
});

export type Link = z.infer<typeof Link>;

export const CreateLinkDto = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string(),
});

export type CreateLinkDto = z.infer<typeof CreateLinkDto>;

export const UpdateLinkDto = CreateLinkDto.partial();

export type UpdateLinkDto = z.infer<typeof UpdateLinkDto>;
