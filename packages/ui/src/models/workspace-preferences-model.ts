import { z } from 'zod';

export const FEATURES_THAT_CAN_BE_DISABLED = [
  {
    value: 'workflow',
    label: 'Workflows',
  },
  {
    value: 'agent',
    label: 'Agents',
  },
  {
    value: 'connection',
    label: 'Connections',
  },
  {
    value: 'knowledge',
    label: 'Knowledge',
  },
  {
    value: 'variable',
    label: 'Variables',
  },
];

export type FeatureThatCanBeDisabled =
  (typeof FEATURES_THAT_CAN_BE_DISABLED)[number];

export const workspacePreferencesSchema = z.object({
  id: z.string().uuid(),
  disabledFeatures: z.array(
    z.enum(['workflow', 'agent', 'connection', 'knowledge', 'variable']),
  ),
});
export type WorkspacePreferences = z.infer<typeof workspacePreferencesSchema>;

export const updateWorkspacePreferencesSchema = workspacePreferencesSchema
  .pick({
    disabledFeatures: true,
  })
  .partial();

export type UpdateWorkspacePreferencesType = z.infer<
  typeof updateWorkspacePreferencesSchema
>;
