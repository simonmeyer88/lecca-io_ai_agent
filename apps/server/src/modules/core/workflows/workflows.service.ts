import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowStrategy } from '@prisma/client';

import { ItemBasedPollTrigger } from '@/apps/lib/trigger';
import { WorkflowAppsService } from '@/modules/core/workflow-apps/workflow-apps.service';
import { WorkflowNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';
import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { WorkflowAccessedByWorkspaceUserEventPayload } from '@/types/event-payloads/workflow-access-by-workspace-user-event-payload.type';
import { JwtUser } from '@/types/jwt-user.type';

import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowExpansionDto } from './dto/workflow-expansion.dto';
import { WorkflowFilterByDto } from './dto/workflow-filter-by.dto';
import { WorkflowIncludeTypeDto } from './dto/workflow-include-type.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private workflowAppService: WorkflowAppsService,
  ) {}

  async create({
    data,
    projectId,
    workspaceId,
    expansion,
  }: {
    data: CreateWorkflowDto;

    projectId: string;
    workspaceId: string;
    expansion?: WorkflowExpansionDto;
  }) {
    await this.#validateNodeData({
      nodes: data.nodes,
      projectId,
      patching: false,
    });

    const {
      strategy,
      defaultPollStorage,
      triggerNode,
      nextScheduledExecution,
    } = await this.#extractDataFromNodes({
      newNodes: data.nodes,
      projectId,
      workspaceId,
    });

    const {
      agentIds,
      connectionIds,
      knowledgeIds,
      subWorkflowIds,
      triggerAndActionIds,
      variableIds,
    } = this.#extractComponentReferencesFromNodes({
      nodes: data.nodes,
    });

    const newWorkflow = await this.prisma.workflow.create({
      data: {
        ...data,
        strategy,
        triggerNode,
        agentIds,
        connectionIds,
        knowledgeIds,
        subWorkflowIds,
        triggerAndActionIds,
        variableIds,
        nextScheduledExecution,
        pollStorage: defaultPollStorage,
        FK_projectId: projectId,
      },
      select: {
        id: true,
      },
    });

    return this.findOne({
      workflowId: newWorkflow.id,
      expansion,
    });
  }

  async findOne({
    workflowId,
    expansion,
    throwNotFoundException,
  }: {
    workflowId: string;
    expansion: WorkflowExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!workflowId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Workflow not found');
      } else {
        return null;
      }
    }

    const workflow = await this.prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
      select: {
        id: true,
        name: true,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        isActive: expansion?.isActive ?? false,
        isInternal: expansion?.isInternal ?? false,
        nodes: expansion?.nodes ?? false,
        edges: expansion?.edges ?? false,
        triggerNode: expansion?.triggerNode ?? false,
        triggerAndActionIds: expansion?.triggerAndActionIds ?? false,
        subWorkflowIds: expansion?.subWorkflowIds ?? false,
        agentIds: expansion?.agentIds ?? false,
        pollStorage: expansion?.pollStorage ?? false,
        nextScheduledExecution: expansion?.nextScheduledExecution ?? false,
        workflowOrientation: expansion?.orientation ?? false,
        project: expansion?.project
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
      },
    });

    if (!workflow && throwNotFoundException) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async update<T>({
    workflowId,
    data,
    expansion,
    workspaceId,
  }: {
    workflowId: string;
    workspaceId: string;
    data: UpdateWorkflowDto | T;
    expansion?: WorkflowExpansionDto;
  }) {
    const workflow = await this.prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
      select: {
        FK_projectId: true,
        nodes: true,
        isActive: true,
      },
    });

    let strategy: WorkflowStrategy | undefined;
    let newPollStorage: string | undefined;
    let triggerNode: WorkflowNodeForRunner | undefined;
    let agentIds,
      connectionIds,
      knowledgeIds,
      subWorkflowIds,
      triggerAndActionIds,
      variableIds: string[] | undefined;
    let nextScheduledExecution: string | undefined;

    //This is only populated if there is a "output workflow data" node in the workflow
    //If it gets deleted, then we want to clear the output data from the workflow
    //The output data is only used to map the output data to other nodes in the workflow when using the "run workflow" action
    let shouldClearOutput: boolean;

    if ((data as UpdateWorkflowDto).nodes) {
      await this.#validateNodeData({
        nodes: (data as UpdateWorkflowDto).nodes,
        projectId: workflow.FK_projectId,
        patching: true,
      });

      const {
        strategy: workflowStrategy,
        defaultPollStorage,
        triggerNode: newTriggerNode,
        nextScheduledExecution: newNextScheduledExecution,
        clearOutput,
      } = await this.#extractDataFromNodes({
        workspaceId,
        workflowId,
        projectId: workflow.FK_projectId,
        newNodes: (data as UpdateWorkflowDto).nodes,
        oldNodes: workflow.nodes as WorkflowNodeForRunner[],
        forceRecheck:
          (data as UpdateWorkflowDto).isActive != null
            ? workflow.isActive != (data as UpdateWorkflowDto).isActive
            : false,
      });

      newPollStorage = defaultPollStorage;
      strategy = workflowStrategy;
      triggerNode = newTriggerNode;
      nextScheduledExecution = newNextScheduledExecution;
      shouldClearOutput = clearOutput;

      const {
        agentIds: newAgentIds,
        connectionIds: newConnectionIds,
        knowledgeIds: newKnowledgeIds,
        subWorkflowIds: newSubWorkflowIds,
        triggerAndActionIds: newTriggerAndActionIds,
        variableIds: newVariableIds,
      } = this.#extractComponentReferencesFromNodes({
        nodes: (data as UpdateWorkflowDto).nodes,
      });

      agentIds = newAgentIds;
      connectionIds = newConnectionIds;
      knowledgeIds = newKnowledgeIds;
      subWorkflowIds = newSubWorkflowIds;
      triggerAndActionIds = newTriggerAndActionIds;
      variableIds = newVariableIds;
    }

    const updatedWorkflow = await this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        ...data,
        triggerNode: triggerNode,
        strategy,
        nextScheduledExecution,
        agentIds,
        connectionIds,
        knowledgeIds,
        subWorkflowIds,
        triggerAndActionIds,
        variableIds,
        pollStorage: newPollStorage,
        output: shouldClearOutput ? null : undefined,
      },
      select: {
        id: true,
      },
    });

    return this.findOne({
      workflowId: updatedWorkflow.id,
      expansion,
    });
  }

  async findAllForWorkspace({
    jwtUser,
    workspaceId,
    expansion,
    includeType,
    filterBy,
  }: {
    jwtUser: JwtUser;
    workspaceId: string;
    includeType?: WorkflowIncludeTypeDto;
    expansion?: WorkflowExpansionDto;
    filterBy?: WorkflowFilterByDto;
  }) {
    if (!jwtUser?.roles?.includes('MAINTAINER')) {
      if (includeType?.all)
        throw new ForbiddenException(
          'You do not have permission to request all workflows',
        );
    }

    return this.prisma.workflow.findMany({
      where: {
        AND: [
          {
            project: {
              FK_workspaceId: workspaceId,
            },
          },
          filterBy?.agentCanTrigger === 'true'
            ? {
                strategy: { in: ['manual', 'schedule'] },
              }
            : {},
          filterBy?.projectId
            ? {
                FK_projectId: filterBy.projectId,
              }
            : {},
          includeType?.all
            ? {}
            : {
                project: {
                  workspaceUsers: {
                    some: {
                      id: jwtUser.workspaceUserId,
                    },
                  },
                },
              },
          includeType?.internal ? {} : { isInternal: false },
        ],
      },
      select: {
        id: true,
        name: true,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        isActive: expansion?.isActive ?? false,
        isInternal: expansion?.isInternal ?? false,
        nodes: expansion?.nodes ?? false,
        edges: expansion?.edges ?? false,
        triggerNode: expansion?.triggerNode ?? false,
        triggerAndActionIds: expansion?.triggerAndActionIds ?? false,
        pollStorage: expansion?.pollStorage ?? false,
        nextScheduledExecution: expansion?.nextScheduledExecution ?? false,
        workflowOrientation: expansion?.orientation ?? false,
        project: expansion?.project
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findRecentForWorkspaceUser({
    workspaceUserId,
    expansion,
  }: {
    workspaceUserId: string;
    expansion?: WorkflowExpansionDto;
  }) {
    const recentWorkflows = await this.prisma.recentWorkflow.findMany({
      where: {
        AND: [
          {
            FK_workspaceUserId: workspaceUserId,
          },
          {
            workflow: {
              isInternal: false,
            },
          },
        ],
      },
      select: {
        workflow: {
          select: {
            id: true,
            name: true,
            description: expansion?.description ?? false,
            createdAt: expansion?.createdAt ?? false,
            updatedAt: expansion?.updatedAt ?? false,
            isActive: expansion?.isActive ?? false,
            nodes: expansion?.nodes ?? false,
            edges: expansion?.edges ?? false,
            triggerAndActionIds: expansion?.triggerAndActionIds,
            project: expansion?.project
              ? {
                  select: {
                    id: true,
                    name: true,
                  },
                }
              : false,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recentWorkflows.map((recentWorkflow) => recentWorkflow.workflow);
  }

  async delete({ workflowId }: { workflowId: string }) {
    await this.prisma.workflow.delete({
      where: {
        id: workflowId,
      },
    });

    return true;
  }

  async manuallyCheckAndRunLatestPollingItemForWorkflow({
    workflowId,
  }: {
    workflowId: string;
  }) {
    /**
     * This function will skip the polling schedule and immediately check for the latest item to run.
     * Great for testing. Especially if you're on the free tier. Or else they may have to wait up to 15 minutes to
     * see the workflow run.
     */

    const workflow = await this.prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
      select: {
        id: true,
        triggerNode: true,
        strategy: true,
        isActive: true,
        project: {
          select: {
            id: true,
            FK_workspaceId: true,
          },
        },
      },
    });

    if (workflow.isActive === false) {
      throw new ForbiddenException('Workflow is not active.');
    }

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const triggerNode = workflow.triggerNode as WorkflowNodeForRunner;

    if (!triggerNode) {
      throw new NotFoundException('Invalid Workflow. Trigger node not found');
    }

    const trigger = this.workflowAppService.getTriggerFromNode({
      node: triggerNode,
    });

    return await trigger.runExecutionCheckForPollingWorkflows({
      triggerNode,
      workflowId: workflow.id,
      projectId: workflow.project.id,
      workspaceId: workflow.project.FK_workspaceId,
    });
  }

  async checkWorkspaceUserHasAccessToWorkflow({
    workspaceUserId,
    workflowId,
  }: {
    workspaceUserId: string;
    workflowId: string;
  }) {
    const belongs = await this.prisma.workflow.findFirst({
      where: {
        AND: [
          {
            id: workflowId,
          },
          {
            project: {
              workspaceUsers: {
                some: {
                  id: workspaceUserId,
                },
              },
            },
          },
        ],
      },
    });

    return !!belongs;
  }

  async checkWorkflowBelongsToWorkspace({
    workspaceId,
    workflowId,
  }: {
    workspaceId: string;
    workflowId: string;
  }) {
    const belongs = await this.prisma.workflow.findFirst({
      where: {
        AND: [
          {
            id: workflowId,
          },
          {
            project: {
              FK_workspaceId: workspaceId,
            },
          },
        ],
      },
    });

    return !!belongs;
  }

  async checkProjectHasAccessToConnection({
    projectId,
    connectionId,
  }: {
    projectId: string;
    connectionId: string;
  }) {
    const belongs = await this.prisma.project.findFirst({
      where: {
        AND: [
          {
            id: projectId,
          },
          {
            OR: [
              {
                connections: {
                  some: {
                    id: connectionId,
                  },
                },
              },
              {
                workspace: {
                  connections: {
                    some: {
                      AND: [
                        {
                          id: connectionId,
                        },
                        {
                          FK_projectId: null,
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
      },
    });

    return !!belongs;
  }

  async checkProjectHasAccessToVariable({
    projectId,
    variableId,
  }: {
    projectId: string;
    variableId: string;
  }) {
    const belongs = await this.prisma.project.findFirst({
      where: {
        AND: [
          {
            id: projectId,
          },
          {
            OR: [
              {
                variables: {
                  some: {
                    id: variableId,
                  },
                },
              },
              {
                workspace: {
                  variables: {
                    some: {
                      AND: [
                        {
                          id: variableId,
                        },
                        {
                          FK_projectId: null,
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    });

    return !!belongs;
  }

  async checkProjectHasAccessToAllVariablesInObject({
    values,
    projectId,
  }: {
    values: Record<string, any>;
    projectId: string;
  }) {
    const keys = Object.keys(values);

    for (const key of keys) {
      if (typeof values[key] === 'string') {
        //A variable will be in the format of ={{var:variableId}}
        //We'll want to extract the id, and then swap out the entire ={{var:variableId}} with the value of the variable
        //there may be more than one variable in the string, so we'll need to loop through and swap them all out
        const value = JSON.stringify(values[key]);
        const variables = value.match(/={{var:([\w-]+)}}/g);

        if (!variables) {
          continue;
        }

        for (const variable of variables) {
          const variableId = variable.split(':')[1].replace('}}', '');
          const hasAccess = await this.checkProjectHasAccessToVariable({
            variableId,
            projectId: projectId,
          });

          if (!hasAccess) {
            throw new ForbiddenException(
              'Project does not have access to variable',
            );
          }
        }
      }
    }
  }

  async #validateNodeData({
    nodes,
    projectId,
    patching,
  }: {
    nodes: any;
    projectId: string;
    patching: boolean;
  }) {
    if ((!nodes && !patching) || !nodes.length) {
      throw new BadRequestException('Nodes are required');
    }

    if ((patching && nodes) || !patching) {
      if (!Array.isArray(nodes)) {
        throw new BadRequestException('Nodes must be an array');
      }
    }

    return await Promise.all(
      nodes.map(async (node: any) => {
        if (node.nodeType === 'placeholder') {
          return;
        }

        //VALIDATE REQUIRED FIELDS
        if (!node.id && !patching) {
          throw new BadRequestException('Node ID is required');
        }

        if (!node.appId && !patching) {
          throw new BadRequestException('App ID is required');
        }

        if (!node.name && !patching) {
          throw new BadRequestException('Name is required');
        }

        if (!node.position && !patching) {
          throw new BadRequestException('Position is required');
        }

        //VALIDATE NODE TYPE
        if (node.nodeType === 'action') {
          if (!node.actionId) {
            throw new BadRequestException(
              'Action ID is required on action node',
            );
          }
        } else if (node.nodeType === 'trigger') {
          if (!node.triggerId) {
            throw new BadRequestException(
              'Trigger ID is required on trigger node',
            );
          }
        } else {
          throw new BadRequestException(`Invalid node type: ${node.nodeType}`);
        }

        const value = node.value;

        //VALIDATE CONNECTION OWNERSHIP
        const connectionId = value?.connectionId;

        if (connectionId) {
          if (
            !(await this.checkProjectHasAccessToConnection({
              projectId,
              connectionId,
            }))
          ) {
            throw new BadRequestException(
              'Project does not have access to the connection',
            );
          }
        }

        //VALIDATE VARIABLE OWNERSHIP
        await this.checkProjectHasAccessToAllVariablesInObject({
          projectId,
          values: node.value ?? {},
        });

        //TODO, should we validate all node.value.agentId's and node.value.knowledgeId's?
        //that way we can always confidently trust the knowledgeIds, and agentIds on the workflow object
      }),
    );
  }

  async #extractDataFromNodes({
    newNodes,
    oldNodes,
    workspaceId,
    projectId,
    workflowId,
    forceRecheck,
  }: {
    newNodes: WorkflowNodeForRunner[];
    oldNodes?: WorkflowNodeForRunner[];
    workspaceId: string;
    projectId: string;
    workflowId?: string;
    forceRecheck?: boolean;
  }): Promise<{
    strategy: WorkflowStrategy;
    defaultPollStorage?: string | null;
    triggerNode: WorkflowNodeForRunner;
    nextScheduledExecution?: string;
    clearOutput?: boolean;
  }> {
    const newTriggerNode = newNodes?.find(
      (node: any) => node.nodeType === 'trigger' && node.triggerId != null,
    );
    const oldTriggerNode = oldNodes?.find(
      (node: any) => node.nodeType === 'trigger' && node.triggerId != null,
    );

    if (!newTriggerNode) {
      throw new BadRequestException('Trigger node is required');
    }

    const trigger = this.workflowAppService.getTriggerFromNode({
      node: newTriggerNode,
    });

    if (!trigger) {
      throw new BadRequestException('Invalid trigger node');
    }

    let returnObject:
      | undefined
      | {
          strategy: WorkflowStrategy;
          defaultPollStorage?: string | null;
          triggerNode: WorkflowNodeForRunner;
          nextScheduledExecution?: string;
          clearOutput?: boolean;
        };

    if (trigger.strategy === 'manual') {
      returnObject = {
        strategy: WorkflowStrategy.manual,
        defaultPollStorage: null,
        triggerNode: newTriggerNode,
      };
    } else if (trigger.strategy.startsWith('poll')) {
      let pollStorage: string | undefined;

      //1. if thre are no old nodes, then this is new, so we need to set the pollStorage
      //2. If the old trigger node is different from the new trigger node, then we need to set the pollStorage
      //3. If the old trigger node triggerId is different from the new trigger node triggerId, then we need to set the pollStorage
      //The ui tries to swap out the the node.id to make sure this runs when the trigger is changed, but it may miss some.
      //One bug I can think of is if it's a item-based trigger searching in a folder (for example), and then the user changes the folder,
      //then the triggerId will be the same, but we need to run this again to get the new items in the folder. We may need an endpoint to force this to run again.
      if (newTriggerNode.value != null) {
        if (
          forceRecheck ||
          !oldNodes || //1
          oldTriggerNode?.id !== newTriggerNode.id || //2
          oldTriggerNode?.triggerId !== newTriggerNode.triggerId //3
        ) {
          if (trigger.strategy === 'poll.dedupe-item-based') {
            const triggerResponses = await trigger.prepareAndRunTrigger({
              configValue: newTriggerNode.value,
              nodeId: newTriggerNode.id,
              workflowId,
              workspaceId,
              inputData: null,
              agentId: null,
              executionId: null,
              projectId,
            });

            if (
              !triggerResponses ||
              triggerResponses?.failure ||
              !triggerResponses?.success?.length
            ) {
              pollStorage = undefined;
            } else {
              const itemIdentifier = (
                trigger as unknown as ItemBasedPollTrigger
              ).extractItemIdentifierFromResponse({
                response: triggerResponses.success[0],
              });

              if (itemIdentifier) {
                pollStorage = itemIdentifier;
              }
            }
          } else if (trigger.strategy === 'poll.dedupe-length-based') {
            const triggerResponses = await trigger.prepareAndRunTrigger({
              configValue: newTriggerNode.value,
              nodeId: newTriggerNode.id,
              workflowId,
              workspaceId,
              inputData: null,
              agentId: null,
              executionId: null,
              projectId,
            });

            if (
              !triggerResponses ||
              triggerResponses?.failure ||
              !triggerResponses?.success?.length
            ) {
              pollStorage = undefined;
            } else {
              pollStorage = triggerResponses.success.length.toString();
            }
          } else if (trigger.strategy === 'poll.dedupe-time-based') {
            pollStorage = new Date().getTime().toString();
          } else {
            throw new BadRequestException(
              `Add poll strategy to extractStrategyFromNodes: ${trigger.strategy}`,
            );
          }
        }
      }

      returnObject = {
        strategy: WorkflowStrategy.poll,
        defaultPollStorage: pollStorage,
        triggerNode: newTriggerNode,
      };
    } else if (trigger.strategy.startsWith('webhook')) {
      returnObject = {
        strategy: WorkflowStrategy.webhook,
        defaultPollStorage: null,
        triggerNode: newTriggerNode,
      };
    } else if (trigger.strategy.startsWith('schedule')) {
      //Run this because we need to get the next scheduled execution

      let nextScheduledExecution: string | undefined;

      if (newTriggerNode.value != null) {
        const triggerResponses = await trigger.prepareAndRunTrigger({
          configValue: newTriggerNode.value,
          nodeId: newTriggerNode.id,
          workflowId,
          workspaceId,
          inputData: null,
          projectId: null,
          agentId: null,
          executionId: null,
        });

        if (
          !triggerResponses ||
          triggerResponses?.failure ||
          !triggerResponses?.success?.length
        ) {
          throw new BadRequestException(triggerResponses?.failure);
        }

        nextScheduledExecution = triggerResponses?.success[0] as string;
      }

      returnObject = {
        strategy: WorkflowStrategy.schedule,
        defaultPollStorage: null,
        triggerNode: newTriggerNode,
        nextScheduledExecution: nextScheduledExecution,
      };
    } else {
      throw new BadRequestException(
        `Add strategy to extractStrategyFromNodes: ${trigger.strategy}`,
      );
    }

    const outputWorkflowDataNode = newNodes.find(
      (node) => node.actionId === 'flow-control_action_output-workflow-data',
    );

    if (!outputWorkflowDataNode) {
      returnObject.clearOutput = true;
    }

    return returnObject;
  }

  #extractComponentReferencesFromNodes({
    nodes,
  }: {
    nodes: WorkflowNodeForRunner[];
  }) {
    const triggerAndActionIds: string[] = [];
    const subWorkflowIds: string[] = [];
    const agentIds: string[] = [];
    const connectionIds: string[] = [];
    const knowledgeIds: string[] = [];
    const variableIds: string[] = [];

    nodes.forEach((node: WorkflowNodeForRunner) => {
      //ACTIONS AND TRIGGERS
      if (node.actionId || node.triggerId) {
        triggerAndActionIds.push(node.actionId ?? node.triggerId);
      }

      //WORKFLOWS
      if (
        node.actionId === 'flow-control_action_run-workflow' &&
        node.value?.workflowId
      ) {
        subWorkflowIds.push(node.value?.workflowId);
      }

      //AGENTS
      if (node.actionId === 'ai_action_message-agent' && node.value?.agentId) {
        agentIds.push(node.value?.agentId);
      }

      //CONNECTIONS
      if (node.value?.connectionId) {
        connectionIds.push(node.value.connectionId);
      }

      //KNOWLEDGE
      if (
        node.actionId === 'knowledge_action_search-knowledge' &&
        node.value?.knowledgeId
      ) {
        knowledgeIds.push(node.value.knowledgeId);
      }

      if (node.value != null) {
        const stringValue = JSON.stringify(node.value);
        const variables = stringValue.match(/={{var:([\w-]+)}}/g);

        if (variables && variables.length) {
          for (const variable of variables) {
            const variableId = variable.split(':')[1].replace('}}', '');
            if (variableId) {
              variableIds.push(variableId);
            }
          }
        }
      }
    });

    return {
      triggerAndActionIds,
      subWorkflowIds,
      agentIds,
      connectionIds,
      knowledgeIds,
      variableIds,
    };
  }

  @OnEvent('workflow.accessed-by-workspace-user')
  async handleWorkflowAccessedByWorkspaceUserEvent(
    payload: WorkflowAccessedByWorkspaceUserEventPayload,
  ) {
    /**
     * Update recentWorkflows table for the workspace user.
     * Currently we only set a limit of 10 recent workflows.
     * So if there are more than 10 recent workflows, we delete the oldest one.
     */
    const MAX_RECENT_WORKFLOWS = 10;

    const recentWorkflows = await this.prisma.recentWorkflow.findMany({
      where: {
        FK_workspaceUserId: payload.workspaceUserId,
      },
      select: {
        id: true,
        FK_workflowId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const alreadyExists = recentWorkflows.find(
      (recentWorkflow) => recentWorkflow.FK_workflowId === payload.workflowId,
    );

    if (!alreadyExists) {
      //Since we'll be adding a new one, delete the oldest one if there are 10 or more
      //Doing delete many incase we ever have more than 1 of the same workflow in the recent workflows
      if (recentWorkflows.length >= MAX_RECENT_WORKFLOWS) {
        await this.prisma.recentWorkflow
          .deleteMany({
            where: {
              //Delete the oldest one
              FK_workflowId: recentWorkflows[0].FK_workflowId,
            },
          })
          .catch(() => {
            //Sometimes it may not exist. Weird issue where this function get's called twice.
          });
      }
    } else {
      //If the workflow is already in the recent workflows, delete it, then we'll add it again to make it the most recent
      //Doing delete many incase we ever have more than 1 of the same workflow in the recent workflows
      await this.prisma.recentWorkflow
        .deleteMany({
          where: {
            FK_workflowId: alreadyExists.FK_workflowId,
          },
        })
        .catch(() => {
          //Sometimes it may not exist. Weird issue where this function get's called twice.
        });
    }

    await this.prisma.recentWorkflow.create({
      data: {
        FK_workspaceUserId: payload.workspaceUserId,
        FK_workflowId: payload.workflowId,
      },
    });

    return true;
  }

  async setTestingWebhookToTrue({ workflowId }: { workflowId: string }) {
    const workflowWithTriggerNode = await this.prisma.workflow.findFirst({
      where: {
        id: workflowId,
      },
      select: {
        triggerNode: true,
      },
    });

    if (!workflowWithTriggerNode) {
      throw new NotFoundException('Workflow not found to test webhook');
    }

    if (!workflowWithTriggerNode.triggerNode) {
      throw new BadRequestException(
        'Workflow does not have a trigger node to test webhook',
      );
    }

    const updatedTriggerNode = {
      ...(workflowWithTriggerNode.triggerNode as WorkflowNodeForRunner),
      isListeningForWebhooksTest: true,
    };

    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        triggerNode: updatedTriggerNode,
      },
      select: {
        id: true,
        triggerNode: true,
      },
    });
  }

  async getTestWebhookDataFromPollStorageIfNotListeningAnymore({
    workflowId,
  }: {
    workflowId: string;
  }) {
    //When we test a webhook, we set the data on the workflow pollStorage.
    //after we set the data, we set isListeningForWebhooksTest to false.
    //there could still be old data, that's why we check if isListeningForWebhooksTest is false.
    //because if it's false that means that webhook.service -> updateWorkflowPollStorageWithWebhookData
    //has already been called and set the data and set the isListening boolean to false.

    const workflowWithTriggerNode = await this.prisma.workflow.findFirst({
      where: {
        AND: [
          {
            id: workflowId,
          },
          {
            triggerNode: {
              path: ['isListeningForWebhooksTest'],
              equals: false,
            },
          },
        ],
      },
      select: {
        pollStorage: true,
      },
    });

    if (!workflowWithTriggerNode) {
      return {
        hasData: false,
      };
    }

    try {
      const parsedData = JSON.parse(workflowWithTriggerNode.pollStorage);

      return { hasData: true, data: parsedData };
    } catch {
      return { hasData: true, data: workflowWithTriggerNode.pollStorage };
    }
  }
}
