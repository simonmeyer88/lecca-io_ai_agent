import { z } from 'zod';

export const knowledgeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  chunkSize: z.number().optional(),
  chunkOverlap: z.number().optional(),
  project: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
  _count: z
    .object({
      vectorRefs: z.number().optional(),
    })
    .optional(),
});
export type Knowledge = z.infer<typeof knowledgeSchema>;

export const createKnowledgeSchema = knowledgeSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    projectId: z.string().uuid().optional(),
  });

export type CreateKnowledgeType = z.infer<typeof createKnowledgeSchema>;

export const updateKnowledgeSchema = knowledgeSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    projectId: z.string().uuid().optional(),
  })
  .partial();

export type UpdateKnowledgeType = z.infer<typeof updateKnowledgeSchema>;

export const uploadRawTextKnowledgeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  text: z.string().min(1, { message: 'Text is required' }),
  chunkSize: z.number(),
  chunkOverlap: z.number(),
});

export type UploadRawTextKnowledgeType = z.infer<
  typeof uploadRawTextKnowledgeSchema
>;

export const uploadFileKnowledgeSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  text: z.string(), //Can't put min because the text is processed from the file until after submit
  chunkSize: z.number(),
  chunkOverlap: z.number(),
});

export type UploadFileKnowledgeType = z.infer<typeof uploadFileKnowledgeSchema>;
