export type WorkflowNode = {
  id: string;
  position: { x: number; y: number };
  appId: string;
  nodeType: 'action' | 'trigger' | 'placeholder' | 'decide-path';
  actionId: string | undefined;
  triggerId: string | undefined;
  description: string;
  name: string;
  value: Record<string, any>;
  raw: Record<string, any>;
  output?: any;
  references?: {
    [key: string]: Record<string, any>;
  };
  variables?: {
    [key: string]: Record<string, any>;
  };
  isListeningForWebhooksTest?: boolean;
};

export type ExecutionNodeForRunner = WorkflowNode & {
  /**
   * `RUNNING` - Action is running normally
   *
   * `SUCCESS` - Action completed successfully
   *
   * `FAILED` - Action failed
   *
   * `RUNNING` will be the default when a node is pushed to the executions.
   * After a node runs, it will be updated to `SUCCESS` or `FAILED`
   */
  executionStatus?:
    | 'RUNNING'
    | 'SUCCESS'
    | 'FAILED'
    | 'NEEDS_INPUT'
    | 'SCHEDULED';

  /**
   * A message for the User to understand the status of the node
   */
  executionStatusMessage?: string;

  /**
   * The time when the node started running
   */
  startTime?: string;

  /**
   * The time when the node stopped running
   */
  endTime?: string;
};
