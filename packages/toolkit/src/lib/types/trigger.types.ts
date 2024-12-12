import { ConnectionData } from './connection.types';
import { InjectedServices } from './services.types';

export type RunTriggerArgs<ConfigValue, InputData = unknown> = {
  inputData?: InputData;
  configValue: ConfigValue;
  connection?: ConnectionData;
  projectId: string;
  workspaceId: string;
  workflowId?: string;
  executionId: string | undefined;
  testing?: boolean;
  prisma: InjectedServices['prisma'];
  http: InjectedServices['http'];
  fileHandler: InjectedServices['fileHandler'];
  s3: InjectedServices['s3'];
  aiProviders: InjectedServices['aiProviders'];
  credits: InjectedServices['credits'];
  task: InjectedServices['task'];
  knowledge: InjectedServices['knowledge'];
};
