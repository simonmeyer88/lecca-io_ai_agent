import { z } from 'zod';

import { EdgeType, baseEdgeSchema } from './base-edge-model';

export const workflowEdgeSchema = baseEdgeSchema.extend({
  type: z.literal<EdgeType>('workflow'),
});
export type WorkflowEdgeType = z.infer<typeof workflowEdgeSchema>;
