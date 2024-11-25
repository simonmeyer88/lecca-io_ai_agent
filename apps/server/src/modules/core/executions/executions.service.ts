import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { JwtUser } from '@/types/jwt-user.type';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExecutionExpansionDto } from './dto/execution-expansion.dto';
import { ExecutionFilterByDto } from './dto/execution-filter-by.dto';
import { ExecutionIncludeTypeDto } from './dto/execution-include-type.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ExecutionNodeForRunner,
  ImmediatelyRunExecutionPayload,
  RunExecutionQueueForWorkspacePayload,
  WorkflowNodeForRunner,
} from '@/modules/core/workflow-runner/workflow-runner.service';
import { CreditsService } from '../../global/credits/credits.service';

@Injectable()
export class ExecutionsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private credits: CreditsService,
  ) {}

  async manuallyExecuteWorkflow({
    workflowId,
    skipQueue,
    inputData,
  }: {
    workflowId: string;
    skipQueue: boolean;
    inputData: Record<string, any> | undefined;
  }) {
    const workflow = await this.prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
      select: {
        id: true,
        triggerNode: true,
        strategy: true,
        isActive: true,
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

    if (workflow.strategy !== 'manual' && workflow.strategy !== 'schedule') {
      throw new ForbiddenException(
        'Workflow is not valid for manual execution. Only manually run and scheduled workflows can be triggered manually',
      );
    }

    return await this.create({
      workflowId,
      triggerNode: undefined,
      skipQueue,
      inputData,
    });
  }

  async create({
    workflowId,
    triggerNode,
    skipQueue,
    inputData,
  }: {
    workflowId: string;

    /**
     * This will be undefined for manual workflows (and manually run scheduled workflows)
     * This is because our webhook and polling triggers have already ran, so they just
     * have to create an execution and add thir existing trigger node to the excution.
     *
     * Whereas manual workflows have to create an execution then run the trigger node as part of the execution.
     */
    triggerNode: ExecutionNodeForRunner | undefined;
    skipQueue: boolean;

    /**
     * When manually triggering a workflow, the user can provide custom input values mapping to the "Manually Run" trigger node custom fields
     */
    inputData: Record<string, any> | undefined;
  }) {
    const workflowWithWorkspaceId = await this.prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
      select: {
        project: {
          select: {
            FK_workspaceId: true,
          },
        },
        workflowOrientation: true,
      },
    });

    const workspaceId = workflowWithWorkspaceId.project.FK_workspaceId;

    if (!workspaceId) {
      throw new NotFoundException('Workspace not found to create execution');
    }

    await this.credits.checkIfWorkspaceHasEnoughCredits({
      usageType: 'workflow-execution',
      workspaceId: workspaceId,
    });

    //Find the highest execution number for the workflow, and then add 1
    const latestExecution = await this.prisma.execution.findFirst({
      where: {
        FK_workflowId: workflowId,
      },
      select: {
        executionNumber: true,
      },
      orderBy: {
        executionNumber: 'desc',
      },
    });

    const executionNumber = latestExecution?.executionNumber ?? 0;

    const execution = await this.prisma.execution.create({
      data: {
        startedAt: new Date().toISOString(),
        status: 'RUNNING',
        statusMessage: 'Execution started',
        executionNumber: executionNumber + 1,
        workflowOrientation: workflowWithWorkspaceId.workflowOrientation,
        FK_workflowId: workflowId,
        edges: [],
        nodes: triggerNode ? [triggerNode] : [],
      },
      select: {
        id: true,
      },
    });

    if (skipQueue) {
      this.#immediatelyRunExecution({
        executionId: execution.id,
        inputData,
      });
    } else {
      this.#addExecutionToQueue({
        executionId: execution.id,
        workspaceId,
      });
    }

    return execution;
  }

  async findOne({
    executionId,
    expansion,
    throwNotFoundException,
  }: {
    executionId: string;
    expansion?: ExecutionExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!executionId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Execution not found');
      } else {
        return null;
      }
    }

    const execution = await this.prisma.execution.findUnique({
      where: {
        id: executionId,
      },
      select: {
        id: true,
        // startedAt: expansion?.startedAt ?? false,
        startedAt: true,
        stoppedAt: expansion?.stoppedAt ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        executionNumber: expansion?.executionNumber ?? false,
        nodes: expansion?.nodes ?? false,
        edges: expansion?.edges ?? false,
        status: expansion?.status ?? false,
        statusMessage: expansion?.statusMessage ?? false,
        output: expansion?.output ?? false,
        continueExecutionAt: expansion?.continueExecutionAt ?? false,
        workflowOrientation: expansion?.orientation ?? false,
        workflow: expansion?.workflow
          ? {
              select: {
                id: true,
                name: true,
                project: expansion?.project
                  ? {
                      select: {
                        id: true,
                        name: true,
                        workspace: expansion?.workspace
                          ? {
                              select: {
                                id: true,
                                name: true,
                              },
                            }
                          : false,
                      },
                    }
                  : false,
              },
            }
          : false,
      },
    });

    if (!execution && throwNotFoundException) {
      throw new NotFoundException('Execution not found');
    }

    return execution;
  }

  async findAllForWorkspace({
    jwtUser,
    workspaceId,
    includeType,
    expansion,
    filterBy,
  }: {
    jwtUser: JwtUser;
    workspaceId: string;
    includeType: ExecutionIncludeTypeDto;
    expansion: ExecutionExpansionDto;
    filterBy: ExecutionFilterByDto;
  }) {
    if (!jwtUser?.roles?.includes('MAINTAINER')) {
      if (includeType?.all)
        throw new ForbiddenException(
          'You do not have permission to request all executions',
        );
    }

    const executions = await this.prisma.execution.findMany({
      where: {
        AND: [
          {
            workflow: {
              project: {
                FK_workspaceId: workspaceId,
              },
            },
          },
          filterBy?.projectId
            ? {
                workflow: {
                  FK_projectId: filterBy.projectId,
                },
              }
            : {},
          filterBy?.workflowId
            ? {
                FK_workflowId: filterBy.workflowId,
              }
            : {},
          includeType?.all
            ? {}
            : {
                workflow: {
                  project: {
                    workspaceUsers: {
                      some: {
                        id: jwtUser.workspaceUserId,
                      },
                    },
                  },
                },
              },
          includeType?.internal
            ? {}
            : {
                workflow: {
                  isInternal: false,
                },
              },
        ],
      },
      select: {
        id: true,
        startedAt: expansion?.startedAt ?? false,
        stoppedAt: expansion?.stoppedAt ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        executionNumber: expansion?.executionNumber ?? false,
        nodes: expansion?.nodes ?? false,
        edges: expansion?.edges ?? false,
        status: expansion?.status ?? false,
        statusMessage: expansion?.statusMessage ?? false,
        output: expansion?.output ?? false,
        continueExecutionAt: expansion?.continueExecutionAt ?? false,
        workflowOrientation: expansion?.orientation ?? false,
        workflow: expansion?.workflow
          ? {
              select: {
                id: true,
                name: true,
                project: expansion?.project
                  ? {
                      select: {
                        id: true,
                        name: true,
                        workspace: expansion?.workspace
                          ? {
                              select: {
                                id: true,
                                name: true,
                              },
                            }
                          : false,
                      },
                    }
                  : false,
              },
            }
          : false,
      },
      orderBy: [{ startedAt: 'desc' }, { executionNumber: 'desc' }],
    });

    return executions;
  }

  async update<T>({
    executionId,
    data,
    expansion,
  }: {
    executionId: string;
    data: UpdateExecutionDto | T;
    expansion?: ExecutionExpansionDto;
  }) {
    const execution = await this.prisma.execution.update({
      where: { id: executionId },
      data,
      select: {
        id: true,
      },
    });

    return this.findOne({
      executionId: execution.id,
      expansion,
    });
  }

  async delete({ executionId }: { executionId: string }) {
    await this.prisma.execution.delete({
      where: {
        id: executionId,
      },
    });

    return true;
  }

  async checkIfExecutionUpdatedAtHasChanged({
    executionId,
    updatedAt,
  }: {
    executionId: string;
    updatedAt: string;
  }) {
    const execution = await this.prisma.execution.findFirst({
      where: {
        AND: [
          { id: executionId },
          {
            updatedAt: {
              gt: updatedAt,
            },
          },
        ],
      },
      select: {
        updatedAt: true,
      },
    });

    return { hasChanged: !!execution };
  }

  async checkExecutionBelongsToWorkspaceUser({
    workspaceUserId,
    executionId,
  }: {
    workspaceUserId: string;
    executionId: string;
  }) {
    const belongs = await this.prisma.execution.findFirst({
      where: {
        AND: [
          {
            id: executionId,
          },
          {
            workflow: {
              project: {
                workspaceUsers: {
                  some: {
                    id: workspaceUserId,
                  },
                },
              },
            },
          },
        ],
      },
    });

    return !!belongs;
  }

  async checkExecutionBelongsToWorkspace({
    workspaceId,
    executionId,
  }: {
    workspaceId: string;
    executionId: string;
  }) {
    const belongs = await this.prisma.execution.findFirst({
      where: {
        AND: [
          {
            id: executionId,
          },
          {
            workflow: {
              project: {
                FK_workspaceId: workspaceId,
              },
            },
          },
        ],
      },
    });

    return !!belongs;
  }

  async #addExecutionToQueue({
    executionId,
    workspaceId,
  }: {
    executionId: string;
    workspaceId: string;
  }) {
    try {
      await this.prisma.workspaceExecutionQueue.upsert({
        where: {
          FK_workspaceId: workspaceId,
        },
        update: {
          items: {
            create: {
              FK_executionId: executionId,
            },
          },
        },
        create: {
          FK_workspaceId: workspaceId,
          items: {
            create: {
              FK_executionId: executionId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const emitPayload: RunExecutionQueueForWorkspacePayload = {
        workspaceId,
      };

      this.eventEmitter.emit('workspaceExecutionQueue.start', emitPayload);
    } catch (e) {
      console.error(e);
    }
  }

  #immediatelyRunExecution({
    executionId,
    inputData,
  }: {
    executionId: string;
    inputData: Record<string, any> | undefined;
  }) {
    const emitPayload: ImmediatelyRunExecutionPayload = {
      executionId,
      inputData,
      continueFromTheseNodeIds: undefined,
    };

    this.eventEmitter.emit('workspaceExecution.immediatelyRun', emitPayload);
  }
}
