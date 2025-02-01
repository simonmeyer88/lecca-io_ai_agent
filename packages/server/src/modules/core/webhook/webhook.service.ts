import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Connection, ExecutionStatus } from '@prisma/client';

import {
  CustomWebhookTrigger,
  WebhookAppTrigger,
} from '../../../apps/lib/trigger';
import { PrismaService } from '../../global/prisma/prisma.service';
import { WorkflowAppsService } from '../workflow-apps/workflow-apps.service';
import {
  ExecutionNodeForRunner,
  ImmediatelyRunExecutionPayload,
  WorkflowNodeForRunner,
} from '../workflow-runner/workflow-runner.service';

@Injectable()
export class WebhookService {
  constructor(
    private prisma: PrismaService,
    private workflowAppService: WorkflowAppsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async handleAppWebhookEvent({
    appId,
    rawBody,
    headers,
  }: {
    appId: string;
    rawBody: unknown;
    headers: Record<string, string>;
  }) {
    const app = this.workflowAppService.apps[appId];

    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    if (
      !app.verifyWebhookRequest({
        webhookBody: rawBody,
        webhookHeaders: headers,
      })
    ) {
      throw new ForbiddenException('Invalid webhook request');
    }

    const body = JSON.parse(rawBody as string);

    const { event } = app.parseWebhookEventType({
      webhookBody: body,
    });

    //Using the event type, we need to get a list of
    //all the triggers that use this event type
    const eventTriggers = app.triggers.filter((trigger) => {
      return (
        trigger.strategy === 'webhook.app' &&
        (trigger as WebhookAppTrigger).eventType === event
      );
    });

    await Promise.allSettled(
      eventTriggers.map(async (trigger) => {
        const workflows = await this.prisma.workflow.findMany({
          where: {
            AND: [
              {
                isActive: true,
              },
              {
                strategy: 'webhook',
              },
              {
                triggerNode: {
                  path: ['triggerId'],
                  equals: trigger.id,
                },
              },
            ],
          },
          select: {
            id: true,
            triggerNode: true,
            FK_projectId: true,
            project: {
              select: {
                FK_workspaceId: true,
              },
            },
          },
        });

        const workflowsMatchingIdentifier: typeof workflows = [];

        await Promise.allSettled(
          workflows.map(async (workflow) => {
            let connection: Partial<Connection> | undefined;

            const triggerConnectionId = (
              workflow.triggerNode as WorkflowNodeForRunner
            )?.value?.connectionId;

            //Need the trigger connection metadata to check if the webhook payload matches the identifier
            if (triggerConnectionId) {
              connection = await this.prisma.connection.findUnique({
                where: {
                  id: triggerConnectionId,
                },
                select: {
                  metadata: true,
                },
              });

              if (connection) {
                const metadata = connection.metadata as unknown as Record<
                  string,
                  any
                >;

                const matches = (
                  trigger as WebhookAppTrigger
                ).webhookPayloadMatchesIdentifier({
                  webhookBody: body,
                  connectionMetadata: metadata,
                });

                if (matches) {
                  workflowsMatchingIdentifier.push(workflow);
                  return true;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            }
          }),
        );

        return await Promise.allSettled(
          workflowsMatchingIdentifier.map(async (workflow) => {
            await trigger.runExecutionCheckForWebhookWorkflows({
              inputData: { body },
              workspaceId: workflow.project.FK_workspaceId,
              triggerNode: workflow.triggerNode as WorkflowNodeForRunner,
              workflowId: workflow.id,
              projectId: workflow.FK_projectId,
            });

            await this.updateWorkflowPollStorageWithWebhookData({
              workflowId: workflow.id,
              body: {
                body,
                // I don't think we want to put the headers in since they are coming from the webhook provider.
                // We pass the headers on the custom webhook trigger since the user is sending the webhook.
                // I'm not sure if there's sensitive data or not in the headers? So we won't save it for now.
                // headers: req.headers
              },
            });
          }),
        );
      }),
    );
  }

  async handleWorkflowWebhookEvent({
    workflowId,
    body,
  }: {
    workflowId: string;
    body: unknown;
  }) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        AND: [
          {
            id: workflowId,
          },
          {
            isActive: true,
          },
        ],
      },
      select: {
        id: true,
        triggerNode: true,
        output: true,
        FK_projectId: true,
        project: {
          select: {
            FK_workspaceId: true,
          },
        },
      },
    });

    if (!workflow) {
      //Either there is no workflow or it's inactive. Won't do anything
      return;
    }

    const trigger = this.workflowAppService.apps['flow-control'].triggerMap[
      'flow-control_trigger_listen-for-webhook'
    ] as CustomWebhookTrigger;

    if (!trigger) {
      throw new Error('Trigger not found for webhook');
    }

    /**
     * If the workflow has an output, then we want to wait for the output when returning a response.
     * If there is not output, then just run the execution asynchronously and return null.;
     */
    if (workflow.output === undefined) {
      trigger.runExecutionCheckForWebhookWorkflows({
        inputData: body,
        workspaceId: workflow.project.FK_workspaceId,
        triggerNode: workflow.triggerNode as WorkflowNodeForRunner,
        workflowId: workflow.id,
        projectId: workflow.FK_projectId,
      });

      return null;
    } else {
      const newExecution = await trigger.runExecutionCheckForWebhookWorkflows({
        inputData: body,
        workspaceId: workflow.project.FK_workspaceId,
        triggerNode: workflow.triggerNode as WorkflowNodeForRunner,
        workflowId: workflow.id,
        projectId: workflow.FK_projectId,
      });

      //Poll database every 2 seconds to see if workflow finished.
      //Do it for a maximum of 1 minute.
      let counter = 0;
      const interval = 2000;
      const maxCounter = 30;

      const executionStatusAndOutput: {
        status: ExecutionStatus | 'TIMEOUT';
        output: any;
      } = await new Promise((resolve) => {
        const intervalId = setInterval(async () => {
          counter++;

          const execution = await this.prisma.execution.findFirst({
            where: {
              AND: [
                {
                  id: newExecution.id,
                },
                {
                  status: {
                    in: ['SUCCESS', 'FAILED', 'NEEDS_INPUT', 'SCHEDULED'],
                  },
                },
              ],
            },
            select: {
              status: true,
              output: true,
            },
          });

          if (execution) {
            clearInterval(intervalId);
            resolve({ status: execution.status, output: execution.output });
          }

          if (counter >= maxCounter) {
            clearInterval(intervalId);
            resolve({ status: 'TIMEOUT', output: null });
          }
        }, interval);
      });

      switch (executionStatusAndOutput.output) {
        case 'SUCCESS': {
          return {
            status: 'SUCCESS',
            message: 'Workflow executed successfully',
            output: executionStatusAndOutput?.output,
          };
        }
        case 'FAILED':
          return {
            status: 'FAILED',
            message: 'Workflow execution failed',
            output: executionStatusAndOutput?.output,
          };
        case 'NEEDS_INPUT':
          return {
            status: 'NEEDS_INPUT',
            message: 'Workflow execution needs input',
            output: executionStatusAndOutput?.output,
          };
        case 'TIMEOUT':
          return {
            status: 'TIMEOUT',
            message: 'Workflow execution timed out (60 seconds max)',
            output: executionStatusAndOutput?.output,
          };
        default:
          return {
            status: 'FAILED',
            message: 'Workflow execution failed',
            output: executionStatusAndOutput?.output,
          };
      }
    }
  }

  async handleExecutionWebhookEvent({
    executionId,
    nodeId,
    data,
  }: {
    executionId: string;
    nodeId: string;
    data: Record<string, any>;
  }) {
    const execution = await this.prisma.execution.findFirst({
      where: {
        /**
         * I would search for an execution where it's status is "NEEDS_INPUT"
         * but if the are 2 nodes that split and one needs input and another one doesn't
         * the execution status might save the latest one that ran. We probably could fix that
         * (and should fix it), but for now, we'll just check if the execution node has a
         * "NEEDS_INPUT" status.
         */
        id: executionId,
      },
      select: {
        id: true,
        nodes: true,
      },
    });

    if (!execution || !execution.nodes) {
      //Either there is no execution or it's doesn't need input. Won't do anything
      return;
    }

    const executionNode = (execution.nodes as ExecutionNodeForRunner[]).find(
      (node) => node.id === nodeId,
    );

    if (
      !executionNode ||
      (executionNode.executionStatus !== 'NEEDS_INPUT' &&
        //SCHEDULED is here because you can manually resume the execution
        executionNode.executionStatus !== 'SCHEDULED')
    ) {
      //Either there is no execution node or it's doesn't need input. Won't do anything
      return;
    }

    const executionNodeAction =
      this.workflowAppService.apps['flow-control'].actionMap[
        executionNode.actionId
      ];

    //It's okay to run directly without preparing
    //because we don't need variables, reference values, project, agentId, .etc.
    //We only need the decision data, executionId, and nodeId
    const successfulRun = await executionNodeAction?.run({
      configValue: {
        ...data,
        nodeId,
      } as any,
      executionId,
      taskId: undefined,
      agentId: undefined,
      projectId: undefined,
      workflowId: undefined,
      workspaceId: undefined,
      http: this.workflowAppService.apps['flow-control'].http,
      prisma: this.workflowAppService.apps['flow-control'].prisma,
      fileHandler: this.workflowAppService.apps['flow-control'].fileHandler,
      s3: this.workflowAppService.apps['flow-control'].s3,
      aiProviders: this.workflowAppService.apps['flow-control'].aiProviders,
      credits: this.workflowAppService.apps['flow-control'].credits,
      task: this.workflowAppService.apps['flow-control'].task,
      knowledge: this.workflowAppService.apps['flow-control'].knowledge,
      notification: this.workflowAppService.apps['flow-control'].notification,
      execution: this.workflowAppService.apps['flow-control'].execution,
    });

    if (successfulRun) {
      //Rerun the execution
      this.#immediatelyRunExecution({
        executionId,
        inputData: undefined,
        continueFromTheseNodeIds: [nodeId],
      });
    }
  }

  async updateWorkflowPollStorageWithWebhookData({
    workflowId,
    body,
  }: {
    workflowId: string;
    body: unknown;
  }) {
    //Check if the workflow is listening for webhooks
    const findWorkflowToListeningForWebhook =
      await this.prisma.workflow.findFirst({
        where: {
          AND: [
            {
              id: workflowId,
            },
            {
              strategy: 'webhook',
            },
            {
              triggerNode: {
                path: ['isListeningForWebhooksTest'],
                equals: true,
              },
            },
          ],
        },
        select: {
          id: true,
          triggerNode: true,
        },
      });

    if (findWorkflowToListeningForWebhook) {
      //Set isListeningForWebhooksTest to false
      //because we only want to listen/test once.
      //This is set to true when the client is testing a webhook
      const updatedTriggerNode = {
        ...(findWorkflowToListeningForWebhook.triggerNode as WorkflowNodeForRunner),
        isListeningForWebhooksTest: false,
      };

      await this.prisma.workflow.update({
        where: {
          id: workflowId,
        },
        data: {
          pollStorage: JSON.stringify(body),
          triggerNode: updatedTriggerNode,
        },
        select: {
          id: true,
        },
      });
    }
  }

  #immediatelyRunExecution({
    executionId,
    inputData,
    continueFromTheseNodeIds,
  }: ImmediatelyRunExecutionPayload) {
    const emitPayload: ImmediatelyRunExecutionPayload = {
      executionId,
      inputData,
      continueFromTheseNodeIds,
    };

    this.eventEmitter.emit('workspaceExecution.immediatelyRun', emitPayload);
  }
}
