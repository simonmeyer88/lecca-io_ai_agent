import { z } from 'zod';

export const THEMES = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export type Theme = (typeof THEMES)[number];

export const WORKFLOW_ORIENTATIONS = ['HORIZONTAL', 'VERTICAL'] as const;
export type WorkflowOrientation = (typeof WORKFLOW_ORIENTATIONS)[number];

export const workspaceUserPreferencesSchema = z.object({
  theme: z.enum(THEMES),
  workflowOrientation: z.enum(WORKFLOW_ORIENTATIONS),
});
export type WorkspaceUserPreferences = z.infer<
  typeof workspaceUserPreferencesSchema
>;

export const updateWorkspaceUserPreferencesSchema =
  workspaceUserPreferencesSchema
    .pick({
      theme: true,
      workflowOrientation: true,
    })
    .partial();
export type UpdateWorkspaceUserPreferencesType = z.infer<
  typeof updateWorkspaceUserPreferencesSchema
>;
