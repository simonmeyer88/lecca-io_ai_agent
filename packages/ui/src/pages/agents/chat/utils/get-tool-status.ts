import { SavedActionNode } from '../../../../models/workflow/node/node-model';
import { WorkflowAppActionType } from '../../../../models/workflow/workflow-app-action-model';

/**
 * The tool is not configured if the connection is not selected, workflowId, agentId, knowledgeId, or any __internal__ field.
 * Note that __internal__ was added later, so all future internal fields will have __internal__
 */

export const getToolStatus = (
  node: SavedActionNode,
  action: WorkflowAppActionType,
) => {
  //TODO
};
