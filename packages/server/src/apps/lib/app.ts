import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { CoreTool } from 'ai';

import { ServerConfig } from '@/config/server.config';
import { ConnectionsService } from '@/modules/core/connections/connections.service';
import { ExecutionsService } from '@/modules/core/executions/executions.service';
import { KnowledgeService } from '@/modules/core/knowledge/knowledge.service';
import { TasksService } from '@/modules/core/tasks/tasks.service';
import { AiProviderService } from '@/modules/global/ai-provider/ai-provider.service';
import { CreditsService } from '@/modules/global/credits/credits.service';
import { FileHandlerService } from '@/modules/global/file/file-handler.service';
import { HttpService } from '@/modules/global/http/http.service';
import { NotificationsService } from '@/modules/global/notifications/notifications.service';
import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { S3ManagerService } from '@/modules/global/s3/s3.service';

import { WorkflowNodeForRunner } from '../../modules/core/workflow-runner/workflow-runner.service';

import { Action } from './action';
import { Connection } from './connection';
import { Trigger } from './trigger';

export class App {
  constructor(args: AppContructorArgs) {
    this.id = args.id;
    this.name = args.name;
    this.description = args.description;
    this.logoUrl = args.logoUrl;
    this.isPublished = args.isPublished;
    this.needsConnection = args.needsConnection;
    this.availableForAgent = args.availableForAgent;
    this.actions = args.actions;
    this.triggers = args.triggers;
    this.connections = args.connections;
    this.verifyWebhookRequest = args.verifyWebhookRequest;
    this.parseWebhookEventType = args.parseWebhookEventType;
    this.prisma = args.prisma;
    this.connection = args.connection;
    this.execution = args.execution;
    this.knowledge = args.knowledge;
    this.notification = args.notification;
    this.fileHandler = args.fileHandler;
    this.s3 = args.s3;
    this.task = args.task;
    this.jwt = args.jwt;
    this.http = args.http;
    this.eventEmitter = args.eventEmitter;
    this.credits = args.credits;
    this.aiProviders = args.aiProviders;

    //Create maps for easy access
    this.connectionMap = this.connections.reduce(
      (acc, connection) => {
        // Add the current/new format
        acc[connection.id] = connection;

        // Always add the old format by converting _connection_ to -connection-
        const oldFormatId = connection.id.replace(
          /_connection_/g,
          '-connection-',
        );
        acc[oldFormatId] = connection;

        return acc;
      },
      {} as Record<string, Connection>,
    );

    this.actionMap = this.actions.reduce(
      (acc, action) => {
        acc[action.id] = action;
        return acc;
      },
      {} as Record<string, Action>,
    );

    this.triggerMap = this.triggers.reduce(
      (acc, trigger) => {
        acc[trigger.id] = trigger;
        return acc;
      },
      {} as Record<string, Trigger>,
    );
  }

  prisma: PrismaService;
  connection: ConnectionsService;
  execution: ExecutionsService;
  knowledge: KnowledgeService;
  notification: NotificationsService;
  fileHandler: FileHandlerService;
  s3: S3ManagerService;
  task: TasksService;
  jwt: JwtService;
  http: HttpService;
  eventEmitter: EventEmitter2;
  credits: CreditsService;
  aiProviders: AiProviderService;
  redirectUrlLocalHostInDevelopment = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;
  encodedRedirectUrl: string = encodeURIComponent(
    this.redirectUrlLocalHostInDevelopment,
  );
  /**
   * Some services don't allow localhost as a redirect URL.
   * So we'll use ngrok to tunnel the localhost to a public URL
   */

  redirectUrlNgrokTunnelInDevelopment: string =
    ServerConfig.ENVIRONMENT === 'development'
      ? `${ServerConfig.NGROK_TUNNEL_URL}/workflow-apps/oauth2callback`
      : `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;
  encodedRedirectUrlNoLocalhost: string = encodeURIComponent(
    this.redirectUrlNgrokTunnelInDevelopment,
  );

  id: string;
  name: string;
  logoUrl: string;
  description: string;
  isPublished: boolean;

  /**
   * If the app needs a connection to work
   */
  needsConnection = true;

  /**
   * If the app is available for the agent to use
   */
  availableForAgent = true;

  /**
   * Return `false` if app doesn't support webhook triggers or if the webhook request is invalid
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyWebhookRequest(args: {
    webhookBody: unknown;
    webhookHeaders: Record<string, string>;
  }): boolean {
    throw new Error(`Verify webhook request not implemented for ${this.name}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parseWebhookEventType(args: { webhookBody: unknown }): {
    event: unknown;
  } {
    throw new Error(`Parse webhook event not implemented for ${this.name}.`);
  }

  connections: Connection[];
  connectionMap: Record<string, Connection>;

  actions: Action[];
  actionMap: Record<string, Action>;

  triggers: Trigger[];
  triggerMap: Record<string, Trigger>;

  toJSON() {
    const connections = this.connections;

    //We will iterate over every connection to make sure the client_id, client_secret, .etc are
    //configured in the ServerConfig via environment variables. If not, we will set isPublished to false.
    //IF there are no connections, default to true.
    let atLeastOneConnectionHasSecretsNecessaryToPublish = !connections.length;

    const connectionsJSON = connections.map((c) => {
      const json = c.toJSON();

      if (json.valid) {
        atLeastOneConnectionHasSecretsNecessaryToPublish = true;
      }

      return json;
    });

    return {
      id: this.id,
      name: this.name,
      isPublished:
        this.isPublished && atLeastOneConnectionHasSecretsNecessaryToPublish,
      logoUrl: this.logoUrl,
      description: this.description,
      connections: connectionsJSON,
      actions: this.actions.map((a) => a.toJSON()),
      triggers: this.triggers.map((t) => t.toJSON()),
      needsConnection: this.needsConnection,
      availableForAgent: this.availableForAgent,
    };
  }

  /**
   * Used to get the ai sdk tool definition
   */
  getAppTools(args: {
    connectionId: string; //the uuid of the connection
    connectionDescription: string; //To be used in the tool description for ai
    enabledActions: string[]; //The actions that are enabled for the user
    agentId: string;
    workflowId: string;
    projectId: string;
    workspaceId: string;
  }): Record<string, CoreTool<any, any>> {
    const tools: Record<string, CoreTool<any, any>> = {};

    for (const action of this.actions) {
      if (!args.enabledActions.includes(action.id)) {
        continue;
      }

      tools[action.id] = action.toToolJSON({
        connectionId: args.connectionId,
        agentId: args.agentId,
        workflowId: args.workflowId,
        projectId: args.projectId,
        workspaceId: args.workspaceId,
        connectionDescription: args.connectionDescription,
        configValueAgentId: undefined,
        configValueKnowledgeId: undefined,
        configValueWorkflowId: undefined,
        configValueCustomIdentifier: undefined,
      });
    }

    return tools;
  }

  async swapOutAllVariablesInObject(obj: any = {}) {
    const keys = Object.keys(obj);

    for (const key of keys) {
      if (typeof obj[key] === 'string') {
        obj[key] = await this.swapOutVariableIfNeeded({ value: obj[key] });
      } else if (Array.isArray(obj[key])) {
        obj[key] = await Promise.all(
          obj[key].map(async (value: any) => {
            if (typeof value === 'string') {
              return await this.swapOutVariableIfNeeded({ value });
            } else {
              return await this.swapOutAllVariablesInObject(value);
            }
          }),
        );
      }
    }

    return obj;
  }

  async swapOutVariableIfNeeded({ value }: { value: string }) {
    //A variable will be in the format of ={{var:variableId}}
    //We'll want to extract the id, and then swap out the entire ={{var:variableId}} with the value of the variable
    //there may be more than one variable in the string, so we'll need to loop through and swap them all out
    value = JSON.stringify(value);
    const variables = value.match(/={{var:([\w-]+)}}/g);

    if (!variables) {
      try {
        return JSON.parse(value);
      } catch (err) {
        throw new Error(
          `Error parsing value is variables check: ${value} - ${err}`,
        );
      }
    }

    for (const variable of variables) {
      const variableId = variable.split(':')[1].replace('}}', '');
      const variableResponse = await this.prisma.variable.findUnique({
        where: { id: variableId },
        select: {
          id: true,
          value: true,
          dataType: true,
        },
      });

      const variableValue = variableResponse?.value;

      if (!variableValue) {
        throw new NotFoundException('Variable not found');
      }

      const variableRegex = new RegExp(`={{var:${variableId}}}`, 'g');
      value = value.replace(variableRegex, variableValue as string);
    }

    try {
      return JSON.parse(value);
    } catch (err) {
      throw new Error(`Error parsing variables value: ${value} - ${err}`);
    }
  }

  async swapOutAllReferencesInObject({
    values,
    workflowId,
    executionId,
  }: {
    values: any;
    workflowId: string;
    executionId?: string;
  }) {
    const keys = Object.keys(values ?? {});
    for (const key of keys) {
      if (typeof values[key] === 'string') {
        values[key] = await this.swapOutReferenceIfNeeded({
          value: values[key],
          workflowId,
          executionId,
        });
      } else if (Array.isArray(values[key])) {
        values[key] = await Promise.all(
          values[key].map(async (value: any) => {
            if (typeof value === 'string') {
              return await this.swapOutReferenceIfNeeded({
                value,
                workflowId,
                executionId,
              });
            } else {
              return await this.swapOutAllReferencesInObject({
                values: value,
                workflowId,
                executionId,
              });
            }
          }),
        );
      } else if (typeof values[key] === 'object' && values[key] !== null) {
        // Handle the object by recursively calling the same function
        values[key] = await this.swapOutAllReferencesInObject({
          values: values[key],
          workflowId,
          executionId,
        });
      }
    }

    return values;
  }

  async swapOutReferenceIfNeeded({
    value,
    workflowId,
    executionId,
  }: {
    value: any;
    workflowId: string;
    executionId?: string;
  }) {
    // A reference will be in the format of ={{ref:nodeId,path,to,property}}
    const referencePattern = /={{ref:[^}]+}}/g;

    // Recursive function to replace all references in the value
    const recursiveReplace = async (val: any): Promise<any> => {
      if (typeof val === 'string') {
        // Find all reference matches in the string
        const references = val.match(referencePattern);
        if (references) {
          // Loop through all the references and replace them with their actual values
          for (const reference of references) {
            const referencePathString = reference
              .split(':')[1]
              .replace('}}', '');

            // Extract the reference path (nodeId and path)
            const referencePath = referencePathString.split(',');
            const referenceNodeId = referencePath[0];
            const referencePathWithoutNodeId = referencePath.slice(1);

            // Fetch the actual reference value from your system
            const referenceValue = await this.getReferenceValue({
              executionId,
              workflowId,
              referenceNodeId,
              referencePath: referencePathWithoutNodeId,
            });

            let escapedReferenceValue: any;
            if (Array.isArray(referenceValue)) {
              //DO NOT RECURSIVELY REPLACE THE REFERENCE VALUE.
              //This is because the reference value could also have a reference. But we don't check if the user owns that reference.
              //So we only go one level deep.
              escapedReferenceValue = JSON.stringify(referenceValue);
            } else if (referenceValue && typeof referenceValue === 'object') {
              //DO NOT RECURSIVELY REPLACE THE REFERENCE VALUE.
              //This is because the reference value could also have a reference. But we don't check if the user owns that reference.
              //So we only go one level deep.
              escapedReferenceValue = JSON.stringify(referenceValue);
            } else {
              escapedReferenceValue = String(referenceValue);
            }

            // Create a regex to replace the current reference in the string
            const referenceRegex = new RegExp(
              `={{ref:${referencePathString}}}`,
              'g',
            );
            val = val.replace(referenceRegex, escapedReferenceValue);
          }
        }

        // Return the string with all replacements made
        return val;
      } else if (Array.isArray(val)) {
        // Recursively replace in arrays
        return Promise.all(val.map((item) => recursiveReplace(item)));
      } else if (val && typeof val === 'object') {
        // Recursively replace in objects
        const newObj = {};
        for (const key of Object.keys(val)) {
          const newKey = await recursiveReplace(key);
          (newObj as any)[newKey] = await recursiveReplace(val[key]);
        }
        return newObj;
      } else {
        // If it's neither a string, object, nor array, return it as-is (number, boolean, null, etc.)
        return val;
      }
    };

    try {
      // Start the recursive replacement process
      const replacedValue = await recursiveReplace(value);

      // Try to parse the final result if it's a JSON string
      try {
        // return JSON.parse(replacedValue);
        return replacedValue;
      } catch {
        // If it's not valid JSON, return the replaced value as-is
        return replacedValue;
      }
    } catch (err) {
      console.error('Error in swapOutReferenceIfNeeded', err);
      console.error(value);
      throw err;
    }
  }

  async getReferenceValue({
    executionId,
    workflowId,
    referenceNodeId,
    referencePath,
  }: {
    executionId?: string;
    workflowId: string;
    referenceNodeId: string;
    referencePath: string[];
  }) {
    let nodes: WorkflowNodeForRunner[] = [];

    if (executionId) {
      //Get references from execution nodes
      const execution = await this.prisma.execution.findUnique({
        where: {
          id: executionId,
        },
        select: {
          id: true,
          nodes: true,
        },
      });

      nodes = execution?.nodes as WorkflowNodeForRunner[];
    } else {
      //This is only used when manually testing a node
      //Get references from workflow nodes output
      const workflow = await this.prisma.workflow.findUnique({
        where: {
          id: workflowId,
        },
        select: {
          id: true,
          nodes: true,
        },
      });

      nodes = workflow?.nodes as WorkflowNodeForRunner[];
    }

    const referenceNode = nodes.find((n) => n.id === referenceNodeId);

    if (!referenceNode) {
      throw new NotFoundException('Reference node found');
    }

    if (referenceNode.output === undefined) {
      throw new NotFoundException('Reference node has no output');
    }

    //To get reference value, we need to use the referencePath on the node.output
    let referenceValue = referenceNode.output;

    for (let i = 0; i < referencePath.length; i++) {
      const path = referencePath[i];

      // If path is number, it's an array index
      // If path is not a number, it's a property
      if (isNaN(parseInt(path))) {
        referenceValue = referenceValue?.[path]; // Optional chaining to handle undefined
      } else if (!isNaN(parseInt(path))) {
        referenceValue = referenceValue?.[parseInt(path)]; // Optional chaining
      }

      // Break out of the loop if referenceValue is undefined
      if (referenceValue === undefined) {
        return null;
      }
    }

    return referenceValue !== undefined ? referenceValue : null;
  }

  escapeAndStringify = (value: any): string => {
    const escapeString = (str: string) => {
      // return str.replace(/"/g, '\\"'); // Escape double quotes
      return str
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/"/g, '\\"') // Escape double quotes
        .replace(/\n/g, '\\n') // Escape newline characters
        .replace(/\r/g, '\\r'); // Escape carriage return characters
    };

    if (Array.isArray(value)) {
      // Recursively handle each element in the array
      return `[` + value.map(this.escapeAndStringify).join(',') + `]`;
    } else if (typeof value === 'object' && value !== null) {
      // Recursively handle each key-value pair in the object
      return (
        `{` +
        Object.keys(value)
          .map(
            (key) =>
              `'${this.escapeAndStringify(key)}':'${this.escapeAndStringify(value[key])}'`,
          )
          .join(',') +
        `}`
      );
    } else if (typeof value === 'string') {
      return `${escapeString(value)}`;
    } else {
      // For other primitive types, simply return the stringified version
      return JSON.stringify(value);
    }
  };
}

export type AppContructorArgs = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  isPublished: boolean;
  needsConnection: boolean;
  availableForAgent: boolean;
  actions: Action[];
  triggers: Trigger[];
  connections: Connection[];
  verifyWebhookRequest: any;
  parseWebhookEventType: any;
  prisma: PrismaService;
  connection: ConnectionsService;
  execution: ExecutionsService;
  notification: NotificationsService;
  fileHandler: FileHandlerService;
  knowledge: KnowledgeService;
  s3: S3ManagerService;
  task: TasksService;
  jwt: JwtService;
  http: HttpService;
  eventEmitter: EventEmitter2;
  credits: CreditsService;
  aiProviders: AiProviderService;
};

export type AppConstructor = new (args: AppContructorArgs) => App;

export type ConfigValue<T> = {
  connectionId?: string;
} & T;
