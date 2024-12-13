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
  prisma: InjectedServices['prisma'];
  http: InjectedServices['http'];
  fileHandler: InjectedServices['fileHandler'];
  s3: InjectedServices['s3'];
  aiProviders: InjectedServices['aiProviders'];
  credits: InjectedServices['credits'];
  task: InjectedServices['task'];
  knowledge: InjectedServices['knowledge'];
  notification: InjectedServices['notification'];
  execution: InjectedServices['execution'];
};
