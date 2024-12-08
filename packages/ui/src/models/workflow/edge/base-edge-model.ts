import { z } from 'zod';

/**
 * This is the base edge for all the different types of nodes.
 * Every single edge will have the properties that the base edge has.
 * The zod shemas
 */

export const edgeTypeKeys = ['placeholder', 'workflow'] as const;
export type EdgeType = (typeof edgeTypeKeys)[number];

export const baseEdgeSchema = z.object({
  id: z.string().uuid(),
  source: z.string().uuid(),
  target: z.string().uuid(),
  type: z.enum(edgeTypeKeys),
});
