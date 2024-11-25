import { z } from 'zod';

export const knowledgeVectorRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  s3Link: z.string().optional(),
  part: z.number().optional(),
  knowledge: z
    .object({
      id: z.string().uuid(),
    })
    .optional(),
});
export type KnowledgeVectorRef = z.infer<typeof knowledgeVectorRefSchema>;
