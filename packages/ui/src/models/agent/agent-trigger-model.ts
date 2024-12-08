import { z } from 'zod';

import { savedTriggerNodeSchema } from '../workflow/node/node-model';

export const agentTriggerSchema = z.object({
  id: z.string().uuid().optional(),
  node: savedTriggerNodeSchema,
  triggerId: z.string().optional(),
  FK_workflowId: z.string().uuid().optional(),
});
export type AgentTrigger = z.infer<typeof agentTriggerSchema>;
