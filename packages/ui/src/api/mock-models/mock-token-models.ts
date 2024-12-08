import { z } from 'zod';

export const mockTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});
