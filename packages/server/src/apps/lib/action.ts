import {
  ActionResponse,
  FieldConfig,
  InputConfig,
  NestedInputConfig,
  RunActionArgs,
} from '@lecca-io/toolkit';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Connection } from '@prisma/client';
import { CoreTool } from 'ai';
import { z } from 'zod';

import { App } from './app';
import { OAuth2Connection } from './connection';
import { NodeViewOptions } from './trigger';

export class Action {
  constructor(args: ActionConstructorArgs) {
    this.app = args.app;
    this.id = args.id;
    this.name = args.name;
    this.description = args.description;
    this.inputConfig = args.inputConfig;
    this.aiSchema = args.aiSchema;
    this.run = args.run;
    this.mockRun = args.mockRun;
    this.availableForAgent = args.availableForAgent ?? true;
    this.needsConnection = args.needsConnection ?? args.app.needsConnection;
    this.iconUrl = args.iconUrl;
    this.viewOptions = args.viewOptions;

    if (args.handleInterruptingResponse) {
      this.handleInterruptingResponse = args.handleInterruptingResponse;
    }
  }

  app: App;
  id: string;
  name: string;
  description: string;
  inputConfig: InputConfig;
  aiSchema: z.ZodObject<any, any>;
  run: (args: RunActionArgs<unknown>) => Promise<unknown>;
  mockRun: (args: RunActionArgs<unknown>) => Promise<unknown>;
  availableForAgent: boolean;
  iconUrl: null | string;
  needsConnection: boolean;

  /**
   * Options to configure how the node looks in the builder.
   */
  viewOptions: null | NodeViewOptions;

  /**
   * Only used if isInterruptingAction is true.
   *
   * Most actions just return an object with key `success` or `failure`.
   * Interrupting actions would return an object with keys like:
   * `needsInput`
   * `scheduled`
   *
   * that way, the execution can be paused and resumed later.
   */
  handleInterruptingResponse?: ({
    runResponse,
  }: {
    runResponse: unknown;
  }) => ActionResponse<unknown>;

  /**
   * Swaps out the variables and references.
   * Fetches the connection if needed.
   * Handles errors and refreshes the token if needed.
   * Runs the action.
   */
  async prepareAndRunAction(
    args: PrepareAndRunActionArgs,
  ): Promise<ActionResponse<unknown>> {
    try {
      await this.app.swapOutAllVariablesInObject(args.configValue);
      await this.app.swapOutAllReferencesInObject({
        values: args.configValue,
        workflowId: args.workflowId,
        executionId: args.executionId,
      });

      return await this.runAction(args);
    } catch (error) {
      /**
       * If there's an error, check if it's a 401 error.
       * If it is, check if the connection has a refresh token and a refresh method.
       * If the refresh doesn't exist then return the failure.
       * If the refresh doesn't work, return the failure.
       * If the refresh works, then run the action again.
       */
      try {
        const status = error.response?.status;
        //if error status is 401, call this.refreshToken
        if (status === 401 && this.needsConnection) {
          const connection = await this.app.connection.findOne({
            connectionId: (args.configValue as any).connectionId,
            expansion: { credentials: true, connectionId: true },
            throwNotFoundException: true,
          });

          const appConnection = this.app.connectionMap[connection.connectionId];

          if (appConnection && connection.refreshToken) {
            try {
              await (appConnection as OAuth2Connection).refreshAccessToken?.({
                connection: {
                  id: connection.id,
                  refreshToken: connection.refreshToken,
                },
                workspaceId: args.workspaceId,
              });

              return await this.runAction(args);
            } catch (error) {
              return {
                failure:
                  error?.response?.message ||
                  error?.response?.data ||
                  error?.response?.data?.errorDetails ||
                  error.message ||
                  `Something went wrong while running action: ${this.name}}`,
              };
            }
          }
        }

        return {
          failure:
            error?.response?.message ||
            error?.response?.data ||
            error?.response?.data?.errorDetails ||
            error.message ||
            `Something went wrong while running action: ${this.name}}`,
        };
      } catch (error) {
        return {
          failure:
            error?.response?.message ||
            error?.response?.data ||
            error?.response?.data?.errorDetails ||
            error.message ||
            `Something went wrong while retrying the action: ${this.name}}`,
        };
      }
    }
  }

  async runAction(args: {
    configValue: unknown;
    nodeId: string;
    workflowId: string | undefined;
    agentId: string | undefined;
    workspaceId: string;
    projectId: string;
    executionId: string | undefined;
    shouldMock?: boolean;
  }): Promise<ActionResponse<unknown>> {
    let connection: Partial<Connection>;

    if (this.needsConnection) {
      const connectionId = (args.configValue as any).connectionId;

      if (!connectionId)
        throw new BadRequestException('Connection ID is required');

      connection = await this.app.connection.findOne({
        connectionId: connectionId,
        expansion: { credentials: true },
        throwNotFoundException: true,
      });
    }

    if (args.configValue == null) {
      args.configValue = {};
    }

    if (args.shouldMock) {
      return {
        success: await this.mockRun({
          configValue: args.configValue,
          projectId: args.projectId,
          workflowId: args.workflowId,
          agentId: args.agentId,
          workspaceId: args.workspaceId,
          executionId: args.executionId,
          connection: connection,
          prisma: this.app.prisma,
          http: this.app.http,
          fileHandler: this.app.fileHandler,
          s3: this.app.s3,
          aiProviders: this.app.aiProviders,
          credits: this.app.credits,
          task: this.app.task,
          knowledge: this.app.knowledge,
          notification: this.app.notification,
          execution: this.app.execution,
        }),
      };
    } else {
      const runResponse = await this.run({
        configValue: args.configValue,
        projectId: args.projectId,
        workflowId: args.workflowId,
        agentId: args.agentId,
        workspaceId: args.workspaceId,
        executionId: args.executionId,
        connection,
        prisma: this.app.prisma,
        http: this.app.http,
        fileHandler: this.app.fileHandler,
        s3: this.app.s3,
        aiProviders: this.app.aiProviders,
        credits: this.app.credits,
        task: this.app.task,
        knowledge: this.app.knowledge,
        notification: this.app.notification,
        execution: this.app.execution,
      });

      if (this.handleInterruptingResponse) {
        //These have unique response objects when they pause the execution
        return this.handleInterruptingResponse({ runResponse });
      } else {
        return {
          success: runResponse,
        };
      }
    }
  }

  async retrieveDynamicValues({
    fieldId,
    connectionId,
    projectId,
    workspaceId,
    workflowId,
    agentId,
    extraOptions,
  }: {
    fieldId: string;
    connectionId: string | undefined;
    projectId: string;
    workspaceId: string;
    workflowId: string | undefined;
    agentId: string | undefined;
    extraOptions: Record<string, any> | undefined;
  }) {
    //fieldId may be nested. So it could be messages.role or it could just be labels
    const fieldIdParts = fieldId.split('.');

    if (fieldIdParts.length === 1) {
      const field = this.inputConfig.find((c) => c.id === fieldId);
      if (!field) {
        throw new BadRequestException(`Field with id ${fieldId} not found`);
      }

      const flatField = field as FieldConfig;
      if (flatField._getDynamicValues) {
        let connection: Partial<Connection> | undefined;

        if (this.needsConnection) {
          connection = await this.app.connection.findOne({
            connectionId: connectionId,
            expansion: { credentials: true, connectionId: true },
            throwNotFoundException: true,
          });
        }

        try {
          return await flatField._getDynamicValues({
            connection,
            extraOptions,
            projectId,
            workspaceId,
            workflowId,
            agentId,
            http: this.app.http,
            prisma: this.app.prisma,
            aiProviders: this.app.aiProviders,
          });
        } catch (err) {
          const status = err.response?.status;
          if (status === 401 && connection) {
            const appConnection =
              this.app.connectionMap[connection.connectionId];

            if (appConnection && connection.refreshToken) {
              try {
                await (appConnection as OAuth2Connection).refreshAccessToken?.({
                  connection: {
                    id: connection.id,
                    refreshToken: connection.refreshToken,
                  },
                  workspaceId,
                });

                const updatedConnection = await this.app.connection.findOne({
                  connectionId: connectionId,
                  expansion: { credentials: true, connectionId: true },
                  throwNotFoundException: true,
                });

                return await flatField._getDynamicValues({
                  connection: updatedConnection,
                  extraOptions,
                  projectId,
                  workspaceId,
                  workflowId,
                  agentId,
                  http: this.app.http,
                  prisma: this.app.prisma,
                  aiProviders: this.app.aiProviders,
                });
              } catch {
                throw new ForbiddenException(
                  'Please re-authenticate your connection',
                );
              }
            }
          }

          throw err;
        }
      } else {
        throw new BadRequestException(
          `Field with id ${fieldIdParts[0]} does not have a function to get dynamic values`,
        );
      }
    } else if (fieldIdParts.length === 2 || fieldIdParts.length === 3) {
      const NESTED_FIELD_INDEX = fieldIdParts.length === 2 ? 1 : 2;
      const field = this.inputConfig.find((c) => c.id === fieldIdParts[0]);
      if (!field) {
        throw new BadRequestException(
          `Field with id ${fieldIdParts[0]} not found`,
        );
      }

      const nestedField = field as NestedInputConfig;
      const nestedFieldConfig = nestedField.inputConfig.find(
        (c) => c.id === fieldIdParts[NESTED_FIELD_INDEX],
      );

      if (!nestedFieldConfig) {
        throw new BadRequestException(
          `Nested field with id ${fieldIdParts[NESTED_FIELD_INDEX]} not found`,
        );
      }

      if (nestedFieldConfig._getDynamicValues) {
        let connection: Partial<Connection> | undefined;
        if (this.needsConnection) {
          connection = await this.app.connection.findOne({
            connectionId: connectionId,
            expansion: { credentials: true, connectionId: true },
            throwNotFoundException: true,
          });
        }

        try {
          return await nestedFieldConfig._getDynamicValues({
            connection,
            extraOptions,
            projectId,
            workspaceId,
            workflowId,
            agentId,
            http: this.app.http,
            prisma: this.app.prisma,
            aiProviders: this.app.aiProviders,
          });
        } catch (err) {
          const status = err.response?.status;
          if (status === 401 && connection) {
            const appConnection =
              this.app.connectionMap[connection.connectionId];

            if (appConnection && connection.refreshToken) {
              try {
                await (appConnection as OAuth2Connection).refreshAccessToken?.({
                  connection: {
                    id: connection.id,
                    refreshToken: connection.refreshToken,
                  },
                  workspaceId,
                });

                const updatedConnection = await this.app.connection.findOne({
                  connectionId: connectionId,
                  expansion: { credentials: true, connectionId: true },
                  throwNotFoundException: true,
                });

                return await nestedFieldConfig._getDynamicValues({
                  connection: updatedConnection,
                  extraOptions,
                  projectId,
                  workspaceId,
                  workflowId,
                  agentId,
                  http: this.app.http,
                  prisma: this.app.prisma,
                  aiProviders: this.app.aiProviders,
                });
              } catch {
                throw new ForbiddenException(
                  'Please re-authenticate your connection',
                );
              }
            }
          }

          throw err;
        }
      } else {
        throw new BadRequestException(
          `Nested field with id ${fieldIdParts[1]} does not have a function to get dynamic values`,
        );
      }
    } else {
      throw new BadRequestException(
        `Field with id ${fieldId} is nested more than 2 levels deep`,
      );
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      inputConfig: this.inputConfig.map((c) => c),
      needsConnection: this.needsConnection,
      iconUrl: this.iconUrl,
      viewOptions: this.viewOptions,
      availableForAgent: this.availableForAgent,
    };
  }

  toToolJSON(
    args: {
      /**
       * This is added to the configValue object.
       */
      connectionId?: string;

      /**
       * This is added to the description of the tool.
       */
      connectionDescription?: string;

      /**
       * This isn't the parent agent / requesting agent. This is the actual agent being called.
       * This is on the configValues object. It's only used for the actions calling an agent like the "MessageAgent" action.
       */
      configValueAgentId: string | undefined;

      /**
       * This isn't the requesting workflow. This is the actual workflow being ran.
       * This is on the configValues object.
       * It's only used for the actions running a workflow like the "RunWorkflow" action.
       */
      configValueWorkflowId: string | undefined;

      /**
       * This is on the configValues object. It's only used for the action to search knowledge like the "SearchKnowledge" action.
       */
      configValueKnowledgeId: string | undefined;

      /**
       * This is used to pass a custom identifier to the agent task.
       * This way the agent can reference the conversation in the future.
       */
      configValueCustomIdentifier: string | undefined;

      /**
       * This is used to override the description of the tool.
       * Usually, it will be the action description, but in some cases, we want to override it.
       * For example, when it's a sub agent, we want the actual sub agent's description to be used,
       * not the general "message agent" action description.
       */
      overrideDescription?: string;

      /**
       * Injects the ai schema instead of using the default aiSchema on the action.
       * Currently used to dynamically generate the ai schema (zod) for a custom input config.
       * For example, "Manually Run" action allows users to build the custom input config to run a workflow.
       * Then in the "Run Workflow" action, the user, workflow, or agent has to provide the fields required.
       */
      overrideConfigValueAiSchema?: CoreTool<any, any>['parameters'];

      /**
       * Overrides any values in the configValue object.
       */
      overrideConfig?: Record<string, any>;
    } & Pick<
      PrepareAndRunActionArgs,
      'agentId' | 'projectId' | 'workflowId' | 'workspaceId'
    >,
  ): CoreTool<any, any> {
    return {
      parameters: args.overrideConfigValueAiSchema ?? this.aiSchema,

      //This is an attempt to add the connection description to the tool description
      //so that the ai tool can better determine which tool to use if there are more
      //than one of the same tool with different connections. This does increase the
      //prompToken count, so it may not be the best solution. Maybe we should
      //only add it if we can confirm there are duplicate tools with different connections
      //for a single agent.
      description:
        args.overrideDescription ??
        `${this.description}${args.connectionDescription ? `: auth description - ${args.connectionDescription}` : ''}`,
      execute: async (_args: PrepareAndRunActionArgs) => {
        /**
         * Injecting extra parameters into the execute arguments.
         * Can't put these into the parameters object above because those arguments
         * are values the AI will dynamically input.
         */

        let configValue: any = { ..._args };
        const otherArgs: any = {};

        if (args.connectionId) {
          //connection id is part of the configValue object.
          //In the workflow tool, the user selects the connection, so this isn't needed,
          //but in the AI Agent tool, the server injects the connection from the agent configuration.
          configValue.connectionId = args.connectionId;
        }

        if (args.projectId) {
          otherArgs.projectId = args.projectId;
        }

        if (args.workflowId) {
          otherArgs.workflowId = args.workflowId;
        }

        if (args.agentId) {
          otherArgs.agentId = args.agentId;
        }

        if (args.workspaceId) {
          otherArgs.workspaceId = args.workspaceId;
        }

        if (args.configValueAgentId) {
          configValue.agentId = args.configValueAgentId;
        }

        if (args.configValueWorkflowId) {
          configValue.workflowId = args.configValueWorkflowId;
        }

        if (args.configValueKnowledgeId) {
          configValue.knowledgeId = args.configValueKnowledgeId;
        }

        if (args.configValueCustomIdentifier) {
          configValue.customIdentifier = args.configValueCustomIdentifier;
        }

        if (args.overrideConfig) {
          configValue = { ...configValue, ...args.overrideConfig };
        }

        //Skipping swapping because agents don't use template's for references or variables.
        return await this.prepareAndRunAction({
          configValue,
          ...otherArgs,
        });
      },
    };
  }
}

export type ActionConstructorArgs = {
  app: App;
  id: string;
  name: string;
  description: string;
  inputConfig: InputConfig;
  aiSchema: z.ZodObject<any, any>;
  run: (args: RunActionArgs<unknown>) => Promise<unknown>;
  mockRun: (args: RunActionArgs<unknown>) => Promise<unknown>;
  availableForAgent: boolean;
  needsConnection: boolean;
  iconUrl?: string;
  viewOptions: NodeViewOptions | undefined;
  handleInterruptingResponse?: (args: {
    runResponse: unknown;
  }) => ActionResponse<unknown>;
};

type PrepareAndRunActionArgs = {
  configValue: object;
  nodeId: string;
  workflowId: string | undefined;
  agentId: string | undefined;
  workspaceId: string;
  projectId: string;
  executionId: string | undefined;
  shouldMock?: boolean;
  testing?: boolean;
};
