import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FieldConfig, InputConfig, NestedInputConfig } from './input-config';
import { ConfigValue, WorkflowApp } from './workflow-app';
import { Connection } from '@prisma/client';
import {
  ExecutionNodeForRunner,
  WorkflowNodeForRunner,
} from '../../modules/core/workflow-runner/workflow-runner.service';
import { isValidMilli } from '../utils/is-valid-milli';
import { OAuth2Connection } from './connection';
import { CoreTool } from 'ai';
import { filterDataByConditions } from '../utils/filter-data-by-conditions';
import { ServerConfig } from '@/config/server.config';

export abstract class Trigger {
  constructor(args: TriggerConstructorArgs) {
    this.app = args.app;
  }

  app: WorkflowApp;
  needsConnection() {
    return true;
  }

  abstract id(): string;
  abstract name(): string;
  abstract strategy(): TriggerStrategy;
  abstract description(): string;
  abstract inputConfig(): InputConfig[];

  availableForAgent(): boolean {
    return true;
  }
  iconUrl(): null | string {
    return null;
  }
  group(): null | { value: string; label: string } {
    return null;
  }
  viewOptions(): null | NodeViewOptions {
    return null;
  }

  /**
   * Very important that for ItemBasedPollTrigger, the response is sorted in descending order, e.g. latest/newest first.
   */
  abstract run(args: {
    /**
     * webhook data
     */
    inputData?: unknown;
    configValue: unknown;
    connection?: Partial<Connection>;
    workflowId?: string;
    workspaceId: string;
    projectId: string;

    /**
     * If this is true, the action won't necessarily be mocked,
     * but the action will run in a way that it returns data or in a way that makes sense to test.
     * For example, some triggers only search for recent data, but if the user is testing a node,
     * they may not have recent data, but they want to have real data they can map values with and test
     * that they're workflow is working properly.
     * */
    testing?: boolean;
  }): Promise<unknown[]>;
  abstract mockRun(args: {
    inputData?: unknown;
    configValue: unknown;
    connection?: Partial<Connection>;
    workflowId?: string;
    workspaceId: string;
    projectId: string;
  }): Promise<unknown[]>;

  /**POLLING METHODS */
  async runExecutionCheckForPollingWorkflows(args: {
    triggerNode: WorkflowNodeForRunner;
    workflowId: string;
    workspaceId: string;
    projectId: string;
  }) {
    const triggerStartTime = new Date();

    const triggerResponses = await this.prepareAndRunTrigger({
      configValue: args.triggerNode.value,
      nodeId: args.triggerNode.id,
      inputData: null,
      executionId: undefined,
      workflowId: args.workflowId,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      agentId: undefined,
    });
    const triggerEndTime = new Date();

    if (triggerResponses.failure) {
      await this.app.prisma.workflow.update({
        where: { id: args.workflowId },
        data: {
          isActive: false,
        },
      });

      const getProjectWithAllWorkspaceUsersInProject =
        await this.app.prisma.project.findUnique({
          where: {
            id: args.projectId,
          },
          select: {
            name: true,
            workspaceUsers: {
              select: {
                id: true,
              },
            },
          },
        });

      if (!getProjectWithAllWorkspaceUsersInProject?.workspaceUsers?.length) {
        getProjectWithAllWorkspaceUsersInProject?.workspaceUsers?.forEach(
          async (workspaceUser) => {
            await this.app.notification.create({
              data: {
                link: `${ServerConfig.CLIENT_URL}/projects/${args.projectId}/workflows/${args.workflowId}`,
                title: `Workflow, ${getProjectWithAllWorkspaceUsersInProject.name.substring(0, 45)}${getProjectWithAllWorkspaceUsersInProject.name.length > 45 ? '...' : ''}, has been disabled due to failed trigger`,
                message: `The workflow has been disabled because the trigger failed to run. Details: ${triggerResponses.failure.substring(0, 200)}${triggerResponses.failure.length > 200 ? '...' : ''}`,
                workspaceUserId: workspaceUser.id,
              },
            });
          },
        );
      }

      throw new BadRequestException(triggerResponses.failure);
    } else if (triggerResponses.success) {
      const workflowWithPollStorage = await this.app.prisma.workflow.findUnique(
        {
          where: { id: args.workflowId },
          select: { pollStorage: true },
        },
      );

      const triggersToRun = await this.filterPollTriggersToRun({
        triggerResponses: triggerResponses.success,
        pollStorage: workflowWithPollStorage?.pollStorage ?? null,
        workflowId: args.workflowId,
      });

      //If you wrap this in a promise, then the run # on the execution could be the same.
      //It's not common that more than 1 will run, so we'll just put this in a loop.

      const executionIds: string[] = [];

      for (const singleTriggerResponse of triggersToRun) {
        const newExecution = await this.triggerNonManualWorkflow({
          triggerNode: args.triggerNode,
          workflowId: args.workflowId,
          triggerStartTime,
          triggerEndTime,
          triggerResponse: singleTriggerResponse,
        });

        executionIds.push(newExecution.id);
      }

      return {
        executionIds: executionIds,
      };
    } else {
      throw new BadRequestException(
        `Something went wrong while running poll trigger: ${this.name()}`,
      );
    }
  }
  async filterPollTriggersToRun({
    triggerResponses,
    pollStorage,
    workflowId,
  }: {
    triggerResponses: unknown[];
    pollStorage: string | null;
    workflowId: string;
  }): Promise<unknown[]> {
    //This checks the strategy the action is set to and if it should run.
    switch (this.strategy()) {
      case 'poll.dedupe-time-based':
        return await (
          this as unknown as TimeBasedPollTrigger
        ).dedupeTimeBasedStrategy({
          triggerResponses,
          pollStorage,
          workflowId,
        });
      case 'poll.dedupe-length-based':
        return await (
          this as unknown as LengthBasedPollTrigger
        ).dedupeLengthBasedStrategy({
          triggerResponses,
          pollStorage,
          workflowId,
        });
      case 'poll.dedupe-item-based':
        return await (
          this as unknown as ItemBasedPollTrigger
        ).dedupeItemBasedStrategy({
          triggerResponses,
          pollStorage,
          workflowId,
        });
      default:
        throw new BadRequestException(
          `Strategy ${this.strategy()} is not supported`,
        );
    }
  }

  /**WEBHOOK METHODS */
  async runExecutionCheckForWebhookWorkflows(args: {
    inputData: unknown;
    triggerNode: WorkflowNodeForRunner;
    workflowId: string;
    workspaceId: string;
    projectId: string;
  }) {
    const triggerStartTime = new Date();

    const triggerResponses = await this.prepareAndRunTrigger({
      configValue: args.triggerNode.value,
      nodeId: args.triggerNode.id,
      inputData: args.inputData,
      workflowId: args.workflowId,
      executionId: undefined,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      agentId: undefined,
    });

    const triggerEndTime = new Date();

    if (triggerResponses.failure) {
      await this.app.prisma.workflow.update({
        where: { id: args.workflowId },
        data: {
          isActive: false,
        },
      });

      const getProjectWithAllWorkspaceUsersInProject =
        await this.app.prisma.project.findUnique({
          where: {
            id: args.projectId,
          },
          select: {
            name: true,
            workspaceUsers: {
              select: {
                id: true,
              },
            },
          },
        });

      if (!getProjectWithAllWorkspaceUsersInProject?.workspaceUsers?.length) {
        getProjectWithAllWorkspaceUsersInProject?.workspaceUsers?.forEach(
          async (workspaceUser) => {
            await this.app.notification.create({
              data: {
                link: `${ServerConfig.CLIENT_URL}/projects/${args.projectId}/workflows/${args.workflowId}`,
                title: `Workflow, ${getProjectWithAllWorkspaceUsersInProject.name.substring(0, 45)}${getProjectWithAllWorkspaceUsersInProject.name.length > 45 ? '...' : ''}, has been disabled due to failed trigger`,
                message: `The workflow has been disabled because the trigger failed to run. Details: ${triggerResponses.failure.substring(0, 200)}${triggerResponses.failure.length > 200 ? '...' : ''}`,
                workspaceUserId: workspaceUser.id,
              },
            });
          },
        );
      }

      throw new BadRequestException(triggerResponses.failure);
    } else if (triggerResponses.success) {
      if (triggerResponses.success.length === 1) {
        /**
         * Webhook triggers will return a success array with the webhook payload.
         * If an empty array is returned, then the trigger filter conditions
         * were not met, so we don't run the workflow.
         */
        return await this.triggerNonManualWorkflow({
          triggerNode: args.triggerNode,
          workflowId: args.workflowId,
          triggerStartTime,
          triggerEndTime,
          triggerResponse: triggerResponses.success[0],
        });
      }
    } else {
      throw new BadRequestException(
        `Something went wrong while running webhook trigger: ${this.name()}`,
      );
    }
  }

  /**SCHEDULE METHODS */
  async runExecutionCheckForScheduledWorkflows(args: {
    triggerNode: WorkflowNodeForRunner;
    workflowId: string;
    workspaceId: string;
    projectId: string;
  }) {
    const triggerStartTime = new Date();

    await this.triggerNonManualWorkflow({
      triggerNode: args.triggerNode,
      workflowId: args.workflowId,
      triggerStartTime,
      triggerEndTime: triggerStartTime,
      triggerResponse: `Scheduled trigger for ${triggerStartTime.toISOString()}`,
    });

    //Now that the trigger has run, we need to set the next execution time

    const triggerResponses = await this.prepareAndRunTrigger({
      configValue: args.triggerNode.value,
      nodeId: args.triggerNode.id,
      workflowId: args.workflowId,
      executionId: undefined,
      workspaceId: args.workspaceId,
      inputData: null,
      projectId: args.projectId,
      agentId: undefined,
    });

    if (
      !triggerResponses ||
      triggerResponses?.failure ||
      !triggerResponses?.success?.length
    ) {
      throw new BadRequestException(triggerResponses?.failure);
    }

    const nextScheduledExecution = triggerResponses.success[0] as string;

    await this.app.prisma.workflow.update({
      where: {
        id: args.workflowId,
      },
      data: {
        nextScheduledExecution: nextScheduledExecution,
      },
    });
  }

  async triggerNonManualWorkflow({
    workflowId,
    triggerNode,
    triggerStartTime,
    triggerEndTime,
    triggerResponse: triggerResponses,
  }: {
    workflowId: string;
    triggerNode: WorkflowNodeForRunner;
    triggerStartTime: Date;
    triggerEndTime: Date;
    triggerResponse: unknown;
  }) {
    const triggerNodeWithExecutionData: ExecutionNodeForRunner = {
      ...triggerNode,
      startTime: triggerStartTime.toISOString(),
      endTime: triggerEndTime.toISOString(),
      executionStatus: 'SUCCESS',
      executionStatusMessage: 'Trigger ran successfully',
      output: triggerResponses,
    };

    return await this.app.execution.create({
      workflowId,
      triggerNode: triggerNodeWithExecutionData,
      skipQueue: false,
      inputData: null,
    });
  }

  /**
   * Fetches the connection if needed.
   * Handles errors and refreshes the token if needed.
   * Checks conditions (from configValue if it exists)
   * Runs the action if conditions are met.
   */
  async prepareAndRunTrigger(
    args: PrepareAndRunTriggerArgs,
  ): Promise<TriggerResponse<unknown>> {
    try {
      //Only swap out variables, not references, since a trigger can't have a reference.
      if (!args.skipSwapping) {
        await this.app.swapOutAllVariablesInObject(args.configValue);
      }

      if (args.configValue == null) {
        args.configValue = {};
      }

      const response = await this.runTrigger(args);
      if (response.success && !args.skipValidatingConditions) {
        //Validate conditions
        response.success = filterDataByConditions({
          configValue: args.configValue,
          data: response.success,
        });

        if (!response.success.length) {
          response.conditionsMet = false;
        }
      }

      return response;
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
        if (status === 401 && this.needsConnection()) {
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

              const response = await this.runTrigger(args);

              if (response.success && !args.skipValidatingConditions) {
                //Validate conditions
                response.success = filterDataByConditions({
                  configValue: args.configValue,
                  data: response.success,
                });

                if (!response.success.length) {
                  response.conditionsMet = false;
                }
              }

              return response;
            } catch (error) {
              return {
                failure:
                  error?.response?.message ||
                  error?.response?.data ||
                  error?.response?.data?.errorDetails ||
                  error.message ||
                  `Something went wrong while running trigger: ${this.name()}}`,
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
            `Something went wrong while running trigger: ${this.name()}}`,
        };
      } catch (error) {
        return {
          failure:
            error?.response?.message ||
            error?.response?.data ||
            error?.response?.data?.errorDetails ||
            error.message ||
            `Something went wrong while retrying the trigger: ${this.name()}}`,
        };
      }
    }
  }

  async runTrigger(args: {
    configValue: unknown;
    nodeId: string;
    workflowId: string;
    projectId: string;
    workspaceId: string;
    executionId?: string;
    shouldMock?: boolean;
    testing?: boolean;
    /**
     * webhook data or injected data from somewhere else.
     * Currently using this for passing webhook data in and for passing "Run Workflow" data into the "Manually Run" trigger.
     */
    inputData: unknown;
  }): Promise<TriggerResponse<unknown>> {
    let connection: Partial<Connection>;

    if (this.needsConnection()) {
      const connectionId = (args.configValue as any).connectionId;

      if (!connectionId)
        throw new BadRequestException('Connection ID is required');

      connection = await this.app.connection.findOne({
        connectionId: connectionId,
        expansion: { credentials: true },
        throwNotFoundException: true,
      });
    }

    if (args.shouldMock) {
      return {
        success: await this.mockRun({
          inputData: args.inputData,
          configValue: args.configValue,
          connection,
          workspaceId: args.workspaceId,
          projectId: args.projectId,
          workflowId: args.workflowId,
        }),
      };
    } else {
      return {
        success: await this.run({
          inputData: args.inputData,
          configValue: args.configValue,
          connection,
          workspaceId: args.workspaceId,
          projectId: args.projectId,
          workflowId: args.workflowId,
          testing: args.testing,
        }),
      };
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
      const field = this.inputConfig().find((c) => c.id === fieldId);
      if (!field) {
        throw new BadRequestException(`Field with id ${fieldId} not found`);
      }

      const flatField = field as FieldConfig;
      if (flatField._getDynamicValues) {
        let connection: Partial<Connection> | undefined;

        if (this.needsConnection()) {
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
      const field = this.inputConfig().find((c) => c.id === fieldIdParts[0]);
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

        if (this.needsConnection()) {
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
      id: this.id(),
      name: this.name(),
      description: this.description(),
      inputConfig: this.inputConfig().map((c) => c),
      needsConnection: this.needsConnection(),
      iconUrl: this.iconUrl(),
      viewOptions: this.viewOptions(),
      strategy: this.strategy(),
      availableForAgent: this.availableForAgent(),
    };
  }

  toToolJSON(): CoreTool<any, any> {
    return {
      parameters: this.inputConfig().map((c) => c),
      description: this.description(),
      execute: (args: PrepareAndRunTriggerArgs) =>
        //Skipping swapping because the tool doesn't contain references or variables.
        this.prepareAndRunTrigger({
          ...args,
          skipSwapping: true,
          skipValidatingConditions: true,
        }),
    };
  }
}

export abstract class WebhookAppTrigger extends Trigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  viewOptions(): NodeViewOptions {
    return {
      showWebhookListenerButton: true,
      saveButtonOptions: {
        hideSaveAndTestButton: true,
      },
    };
  }

  abstract eventType(): string;

  /**
   * The webhook payload must have something to identify what connection it's for.
   * For example, stripe has a team.id in the payload, so we'll match that with the
   * team id in the connection metadata. When we save the oauth2 connection, we save
   * this metadata.
   */
  abstract webhookPayloadMatchesIdentifier(args: {
    webhookBody: unknown;
    connectionMetadata: Record<string, any>;
  }): boolean;

  strategy(): TriggerStrategy {
    return 'webhook.app';
  }
}

export abstract class CustomWebhookTrigger extends Trigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  viewOptions(): NodeViewOptions {
    return {
      showWebhookListenerButton: true,
      saveButtonOptions: {
        hideSaveAndTestButton: true,
      },
    };
  }

  strategy(): TriggerStrategy {
    return 'webhook.custom';
  }
}

export abstract class TimeBasedPollTrigger extends Trigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  strategy(): TriggerStrategy {
    return 'poll.dedupe-time-based';
  }

  async dedupeTimeBasedStrategy({
    triggerResponses,
    pollStorage,
    workflowId,
  }: {
    triggerResponses: unknown[];
    pollStorage: string | null;
    workflowId: string;
  }): Promise<unknown[]> {
    let newPollStorage = pollStorage;

    const filteredResponses = triggerResponses.filter((singleResponse) => {
      const timestamp = this.extractTimestampFromResponse({
        response: singleResponse,
      });

      if (timestamp == null) {
        return false;
      } else if (pollStorage == null) {
        newPollStorage = timestamp;
        return true;
      }

      if (isValidMilli(pollStorage)) {
        if (parseInt(timestamp) > parseInt(pollStorage)) {
          newPollStorage =
            parseInt(timestamp) > parseInt(newPollStorage ?? pollStorage)
              ? timestamp
              : newPollStorage;
          return true;
        }

        return false;
      } else {
        //This means it's not a valid millisecond timestamp. Should never get here.
        //But we'll set it to a correct millisecond type. The reason we'd get here
        //is if this workflow had a different trigger type and then it changed to a time type.
        //We handle clearing the pollStorage in the workflow service, but incase we miss something
        //we'll keep this here.
        if (isValidMilli(newPollStorage)) {
          newPollStorage =
            parseInt(timestamp) > parseInt(newPollStorage)
              ? timestamp
              : newPollStorage;
        } else {
          newPollStorage = timestamp;
        }

        return false;
      }
    });

    //Ensure the largest timestamp is stored
    if (newPollStorage !== pollStorage) {
      await this.app.prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          pollStorage: newPollStorage,
        },
      });
    }

    return filteredResponses;
  }

  /**
   * Should return a millisecond timestamp or null if it can't be extracted.
   * Use the DateStringToMilliOrNull function to convert a date string to a millisecond timestamp.
   */
  abstract extractTimestampFromResponse(args: {
    response: unknown;
  }): string | null;
}

export abstract class ItemBasedPollTrigger extends Trigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  strategy(): TriggerStrategy {
    return 'poll.dedupe-item-based';
  }

  async dedupeItemBasedStrategy({
    triggerResponses,
    pollStorage,
    workflowId,
  }: {
    triggerResponses: unknown[];
    pollStorage: string | null;
    workflowId: string;
  }): Promise<unknown[]> {
    let newPollStorage = pollStorage;
    const lastItemId = pollStorage;

    if (lastItemId == null) {
      //This means it hasn't polled before. A value will be set from the most recent trigger responses
      if (triggerResponses.length) {
        newPollStorage = this.extractItemIdentifierFromResponse({
          response: triggerResponses[0],
        });
      }

      if (newPollStorage != null) {
        // Update pollStorage in database
        await this.app.prisma.workflow.update({
          where: {
            id: workflowId,
          },
          data: {
            pollStorage: newPollStorage,
          },
        });
      }

      return triggerResponses;
    } else {
      const lastItemIndex = triggerResponses.findIndex(
        (singleResponse) =>
          this.extractItemIdentifierFromResponse({
            response: singleResponse,
          }) === lastItemId,
      );

      let newItems = [];
      if (lastItemIndex == -1) {
        if (triggerResponses.length) {
          newPollStorage = this.extractItemIdentifierFromResponse({
            response: triggerResponses[0],
          });
        }
        return triggerResponses;
      } else {
        newItems = triggerResponses.slice(0, lastItemIndex);
        if (newItems.length) {
          newPollStorage = this.extractItemIdentifierFromResponse({
            response: newItems[0],
          });
        }
      }

      if (newPollStorage !== pollStorage) {
        await this.app.prisma.workflow.update({
          where: {
            id: workflowId,
          },
          data: {
            pollStorage: newPollStorage,
          },
        });
      }

      return newItems;
    }
  }

  abstract extractItemIdentifierFromResponse(args: {
    response: unknown;
  }): string | null;
}

export abstract class LengthBasedPollTrigger extends Trigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  strategy(): TriggerStrategy {
    return 'poll.dedupe-length-based';
  }

  async dedupeLengthBasedStrategy({
    triggerResponses,
    pollStorage,
    workflowId,
  }: {
    triggerResponses: unknown[];
    pollStorage: string | null;
    workflowId: string;
  }): Promise<unknown[]> {
    const newLength = triggerResponses?.length;
    const previousLength = Number(pollStorage) || newLength;

    if (newLength < previousLength) {
      await this.app.prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          pollStorage: newLength.toString(),
        },
      });
      return [];
    } else if (newLength === previousLength) {
      return [];
    } else {
      await this.app.prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          pollStorage: newLength.toString(),
        },
      });

      //Return the new items. So if there were 5 new items, return the last 5 items of the array
      return triggerResponses.slice(newLength - (newLength - previousLength));
    }
  }
}

export type TriggerConstructorArgs = {
  app: WorkflowApp;
};

export type RunTriggerArgs<T, INPUT_DATA = unknown> = {
  inputData?: INPUT_DATA;
  configValue: ConfigValue<T>;
  projectId: string;
  workspaceId: string;
  workflowId?: string;
  connection?: Partial<Connection>;
  testing?: boolean;
};

export type TriggerResponse<T> = {
  success?: T[];
  failure?: any;
  conditionsMet?: boolean;
};

//WorkfowStrategy is at the workflow level like poll, webhook, etc.
//TriggerStrategy is more specific
export type TriggerStrategy =
  | 'manual'
  | 'poll.dedupe-time-based'
  | 'poll.dedupe-item-based'
  | 'poll.dedupe-length-based'
  | 'webhook.app'
  | 'webhook.custom'
  | 'schedule';

type PrepareAndRunTriggerArgs = {
  configValue: any;
  inputData: unknown;
  nodeId: string;
  workspaceId: string;
  projectId: string;
  executionId: string | undefined;
  agentId: string | undefined;
  workflowId: string | undefined;
  shouldMock?: boolean;
  skipSwapping?: boolean;
  skipValidatingConditions?: boolean;
  testing?: boolean;
};

export type NodeViewOptions = {
  hideConditions?: boolean;
  showWebhookListenerButton?: boolean;
  showManualInputButton?: boolean;
  manualInputButtonOptions?: {
    label: string;
    tooltip: string;
  };
  saveButtonOptions?: {
    /**
     * This would hide the "Save & Test" (Now Generate Output) button regardless of
     * if you have replaceSaveAndTestButton values set or not.
     */
    hideSaveAndTestButton?: boolean;

    /**
     * This would hide the "Save" button, not the Save & Test button.
     * This is useful for actions/triggers where when you save it, it needs to
     * generate an outcome or run the node immediately.
     *
     * Currently used for the "Manually Run" trigger with the replaceMainButton
     * because when you save a manually run trigger, you want it to run the mockRun
     * so it can generate the custom input config for that workflow so other workflows
     * can map their input values when using the "Run Workflow" action.
     *
     * Also used for the "Output Workflow Data" action with the replaceMainButton
     * because when you save the "Output Workflow Data" action, you want it to run the mockRun
     * because the mockRun for that trigger generates the output on the workflow so other workflows
     * can map their values when using the "Run Workflow" action.
     */
    hideSaveButton?: boolean;

    /**
     * Some "Save & Test" buttons don't work for all triggers/actions.
     * For example, the "Manually Run" trigger doesn't have a "Save & Test" button.
     * It has a "Save & Generate Output" button. So we would use this to replace the button
     * and configure whether it calls the real run or the mock run.
     *
     * So instead of the "Save & Test" button being a dropdown for Real or Mock, it would be replaced
     * with the options selected.
     */
    replaceSaveAndTestButton?: {
      type: 'real' | 'mock';
      label: string;
      tooltip?: string;
    };
    replaceSaveButton?: {
      type: 'real' | 'mock' | 'save';
      label: string;
      tooltip?: string;
    };
  };
};
