import { z } from 'zod';

export const IdParam = z.object({ id: z.string() });

export const Pagination = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(250).default(20),
});

export type Pagination = z.infer<typeof Pagination>;
