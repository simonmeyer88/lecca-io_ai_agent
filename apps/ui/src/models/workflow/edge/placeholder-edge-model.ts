import { z } from 'zod';

import { EdgeType, baseEdgeSchema } from './base-edge-model';

export const placeholderEdgeSchema = baseEdgeSchema.extend({
  type: z.literal<EdgeType>('placeholder'),
});
export type PlaceholderEdgeType = z.infer<typeof placeholderEdgeSchema>;
