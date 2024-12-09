import { ConnectionData } from './connection.types';
import { InjectedServices } from './services.types';

export type RunActionArgs<ConfigValue> = {
  configValue: ConfigValue;
  connection?: ConnectionData;
  projectId: string;
  workflowId: string | undefined;
  workspaceId: string;
  executionId: string | undefined;
  agentId: string | undefined;
  testing?: boolean;
  http?: InjectedServices['http'];
};
