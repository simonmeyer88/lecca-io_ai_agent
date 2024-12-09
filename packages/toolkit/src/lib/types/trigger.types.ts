import { ConnectionData } from './connection.types';

export type RunTriggerArgs<ConfigValue, InputData = unknown> = {
  inputData?: InputData;
  configValue: ConfigValue;
  connection?: ConnectionData;
  projectId: string;
  workspaceId: string;
  workflowId?: string;
  executionId: string | undefined;
  testing?: boolean;
};
