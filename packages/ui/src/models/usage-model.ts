import { z } from 'zod';

export const usageSchema = z.object({
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  allottedCredits: z.number(),
  purchasedCredits: z.number(),
});

export type Usage = z.infer<typeof usageSchema>;
