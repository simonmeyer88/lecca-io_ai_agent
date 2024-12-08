import { z } from 'zod';

export const workflowAppConnectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  connectionType: z.enum(['oauth2', 'basic', 'apiKey', 'keyPair']),
  link: z.string().optional(),
});
export type WorkflowAppConnectionType = z.infer<
  typeof workflowAppConnectionSchema
>;
