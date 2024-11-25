import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { JwtUser } from '@/types/jwt-user.type';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkflowTemplateDto } from './dto/create-workflow-template.dto';
import { WorkflowTemplateExpansionDto } from './dto/workflow-template-expansion.dto';
import { WorkflowTemplateIncludeTypeDto } from './dto/workflow-template-include-type.dto';
import { WorkflowTemplateFilterByDto } from './dto/workflow-template-filter-by.dto';
import { WorkflowNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';

@Injectable()
export class WorkflowTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create({
    data,
    workspaceId,
    expansion,
  }: {
    data: CreateWorkflowTemplateDto;
    workspaceId: string;
    expansion: WorkflowTemplateExpansionDto;
  }) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        AND: [
          {
            id: data.workflowId,
          },
          {
            project: {
              FK_workspaceId: workspaceId,
            },
          },
        ],
      },
      select: {
        name: true,
        description: true,
        nodes: true,
        edges: true,
        output: true,
        triggerAndActionIds: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow does not belong to workspace');
    }

    let FK_projectId: string | undefined;
    if (data.projectId) {
      const projectIsInWorkspace = await this.prisma.project.findFirst({
        where: {
          AND: [{ id: data.projectId }, { FK_workspaceId: workspaceId }],
        },
      });

      if (!projectIsInWorkspace) {
        throw new NotFoundException('Project does not belong to workspace');
      }

      FK_projectId = data.projectId;
      delete data.projectId;
    }

    const newWorkflowTemplate = await this.prisma.workflowTemplate.create({
      data: {
        ...workflow,
        FK_workspaceId: workspaceId,
        FK_projectId,
      },
      select: {
        id: true,
      },
    });

    return this.findOne({
      workflowTemplateId: newWorkflowTemplate.id,
      expansion,
    });
  }

  async findAllShared({
    workspaceId,
    sharedToType,
  }: {
    workspaceId: string;
    sharedToType: 'workspace' | 'global'; //omitting project for now since that can be retrieved from the projects endpoint
  }) {
    const templates = await this.prisma.workflowTemplate.findMany({
      where: {
        AND: [
          { sharedTo: sharedToType === 'workspace' ? 'workspace' : 'global' },
          sharedToType === 'workspace' ? { FK_workspaceId: workspaceId } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        triggerAndActionIds: true,
        sharedTo: true,
      },
    });

    return templates;
  }

  async findShared({
    workflowTemplateId,
    workspaceUserId,
    workspaceId,
  }: {
    workflowTemplateId: string;
    workspaceUserId: string;
    workspaceId: string;
  }) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: {
        id: workflowTemplateId,
      },
      select: {
        sharedTo: true,
        FK_workspaceId: true,
        FK_projectId: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    if (
      template.sharedTo === 'workspace' &&
      template.FK_workspaceId !== workspaceId
    ) {
      throw new NotFoundException('Workflow template not found in workspace');
    } else if (template.sharedTo === 'project') {
      if (template.FK_projectId) {
        const userHasAccessToProject = await this.prisma.project.findFirst({
          where: {
            AND: [
              {
                id: template.FK_projectId,
              },
              {
                OR: [
                  {
                    workspaceUsers: {
                      some: {
                        id: workspaceUserId,
                      },
                    },
                  },
                  {
                    workspace: {
                      workspaceUsers: {
                        some: {
                          AND: [
                            { id: workspaceUserId },
                            {
                              roles: {
                                has: 'MAINTAINER',
                              },
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

        if (!userHasAccessToProject) {
          throw new NotFoundException('Workflow template not found in project');
        }
      }
    }

    return this.findOne({
      workflowTemplateId,
      expansion: {
        description: true,
        edges: true,
        nodes: true,
        triggerAndActionIds: true,
      },
      throwNotFoundException: true,
    });
  }

  async findOne({
    jwtUser,
    workflowTemplateId,
    expansion,
    throwNotFoundException,
  }: {
    /**
     * Only required for the getBYId method because we need to check if the user has access to the workflow template.
     */
    jwtUser?: JwtUser;
    workflowTemplateId: string;
    expansion?: WorkflowTemplateExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!workflowTemplateId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Workflow template not found');
      } else {
        return null;
      }
    }

    if (
      jwtUser &&
      !(await this.checkWorkspaceUserHasAccessToWorkflowTemplate({
        workflowTemplateId,
        workspaceUserId: jwtUser.workspaceUserId,
      }))
    ) {
      throw new ForbiddenException(
        'User does not have access to workflow template',
      );
    }

    const workflowTemplate = await this.prisma.workflowTemplate.findUnique({
      where: {
        id: workflowTemplateId,
      },
      select: {
        id: true,
        name: true,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        edges: expansion?.edges ?? false,
        nodes: expansion?.nodes ?? false,
        triggerAndActionIds: expansion?.triggerAndActionIds ?? false,
        sharedTo: expansion?.sharedTo ?? false,
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

    if (!workflowTemplate && throwNotFoundException) {
      throw new NotFoundException('Workflow template not found');
    }

    return workflowTemplate;
  }

  async findAllForWorkspace({
    jwtUser,
    workspaceId,
    expansion,
    filterBy,
    includeType,
  }: {
    jwtUser: JwtUser;
    workspaceId: string;
    includeType?: WorkflowTemplateIncludeTypeDto;
    filterBy?: WorkflowTemplateFilterByDto;
    expansion?: WorkflowTemplateExpansionDto;
  }) {
    return this.prisma.workflowTemplate.findMany({
      where: {
        AND: [
          { FK_workspaceId: workspaceId },
          filterBy?.projectId
            ? {
                FK_projectId: filterBy.projectId,
              }
            : {},
          //Filters down connections project has access to (global workspace and project owned)
          filterBy?.projectAccessId
            ? {
                OR: [
                  {
                    FK_projectId: filterBy.projectAccessId,
                  },
                  {
                    FK_projectId: null,
                  },
                ],
              }
            : {},
          includeType?.all
            ? jwtUser?.roles?.includes('MAINTAINER')
              ? {}
              : {
                  OR: [
                    {
                      FK_projectId: null,
                    },
                    {
                      project: {
                        workspaceUsers: {
                          some: {
                            id: jwtUser.workspaceUserId,
                          },
                        },
                      },
                    },
                  ],
                }
            : {
                project: {
                  workspaceUsers: {
                    some: {
                      id: jwtUser.workspaceUserId,
                    },
                  },
                },
              },
        ],
      },
      select: {
        id: true,
        name: true,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        edges: expansion?.edges ?? false,
        nodes: expansion?.nodes ?? false,
        sharedTo: expansion?.sharedTo ?? false,
        triggerAndActionIds: expansion?.triggerAndActionIds ?? false,
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

  async delete({ workflowTemplateId }: { workflowTemplateId: string }) {
    await this.prisma.workflowTemplate.delete({
      where: {
        id: workflowTemplateId,
      },
    });

    return true;
  }

  async shareToWorkspace({
    workflowTemplateId,
    expansion,
  }: {
    workflowTemplateId: string;
    expansion: WorkflowTemplateExpansionDto;
  }) {
    const { cleanNodes } = await this.extractCleanWorkflowData({
      workflowTemplateId,
    });

    await this.prisma.workflowTemplate.update({
      where: {
        id: workflowTemplateId,
      },
      data: {
        sharedTo: 'workspace',
        FK_projectId: {
          set: null,
        },
        nodes: cleanNodes,
        // FK_workspaceId want to keep workspaceId, so we know where it's from.
      },
      select: {
        id: true,
      },
    });

    //We'll want to clean up the workflow properties like any variableIds, connectionIds, and all outputs?
    //Maybe we can make those cleanup properties optional for the user?

    return this.findOne({
      workflowTemplateId,
      expansion,
      throwNotFoundException: true,
    });
  }

  async shareGlobally({
    workflowTemplateId,
    expansion,
  }: {
    workflowTemplateId: string;
    expansion: WorkflowTemplateExpansionDto;
  }) {
    const { cleanNodes } = await this.extractCleanWorkflowData({
      workflowTemplateId,
    });

    await this.prisma.workflowTemplate.update({
      where: {
        id: workflowTemplateId,
      },
      data: {
        sharedTo: 'global',
        FK_projectId: {
          set: null,
        },
        nodes: cleanNodes,
        // FK_workspaceId want to keep workspaceId, so we know where it's from.
      },
      select: {
        id: true,
      },
    });

    return this.findOne({
      workflowTemplateId,
      expansion,
      throwNotFoundException: true,
    });
  }

  async extractCleanWorkflowData({
    workflowTemplateId,
  }: {
    workflowTemplateId: string;
  }) {
    const workflow = await this.prisma.workflowTemplate.findUnique({
      where: {
        id: workflowTemplateId,
      },
      select: {
        nodes: true,
        output: true,
      },
    });

    const cleanNodes = (
      workflow.nodes as unknown as WorkflowNodeForRunner[]
    ).map((node) => {
      if (node.value) {
        //CLEAN CONNECTION ON CONFIG
        node.value.connectionId = undefined;
        node.value.knowledgeId = undefined;
        node.value.agentId = undefined;
        node.value.workflowId = undefined;
        //This is for notifications on human in the loop steps. However it's not very unique and other actions might use this.
        //We won't use assignees when creating templates to avoid this.
        node.value.assignee = undefined;

        //CLEAN OUTPUTS ON CONFIGS
        node.value.output = undefined;
      }

      if (node.raw) {
        node.raw.connectionId = undefined;
        node.raw.knowledgeId = undefined;
        node.raw.agentId = undefined;
        node.raw.workflowId = undefined;
        //This is for notifications on human in the loop steps. However it's not very unique and other actions might use this.
        //We won't use assignees when creating templates to avoid this.
        node.raw.assignee = undefined;
      }

      return node;
    });

    return {
      cleanNodes,
    };
  }

  async checkWorkspaceUserHasAccessToWorkflowTemplate({
    workspaceUserId,
    workflowTemplateId,
  }: {
    workspaceUserId: string;
    workflowTemplateId: string;
  }) {
    const belongs = await this.prisma.workflowTemplate.findFirst({
      where: {
        AND: [
          {
            id: workflowTemplateId,
          },
          {
            OR: [
              //THIS IS IF TEMPLATE IS GLOBAL
              {
                sharedTo: 'global',
              },
              //THIS IS IF TEMPLATE IS WITHIN A PROJECT AND HASNT BEEN SHARED
              {
                AND: [
                  {
                    sharedTo: 'project',
                  },
                  {
                    workspace: {
                      workspaceUsers: {
                        some: {
                          id: workspaceUserId,
                        },
                      },
                    },
                  },
                  {
                    OR: [
                      {
                        project: null,
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
                ],
              },
              //THIS IS IF TEMPLATE IS SHARED WITHIN A WORKSPACE
              {
                AND: [
                  {
                    sharedTo: 'workspace',
                  },
                  {
                    workspace: {
                      workspaceUsers: {
                        some: {
                          id: workspaceUserId,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    return !!belongs;
  }

  async checkWorkspaceUserHasEditingPermmissionsForWorkflowTemplate({
    workspaceUserId,
    workflowTemplateId,
  }: {
    workspaceUserId: string;
    workflowTemplateId: string;
  }) {
    const belongs = await this.prisma.workflowTemplate.findFirst({
      where: {
        AND: [
          {
            id: workflowTemplateId,
          },
          {
            AND: [
              {
                workspace: {
                  workspaceUsers: {
                    some: {
                      id: workspaceUserId,
                    },
                  },
                },
              },
              {
                OR: [
                  {
                    project: null,
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
            ],
          },
        ],
      },
    });

    return !!belongs;
  }

  async checkWorkflowTemplateBelongsToWorkspace({
    workspaceId,
    workflowTemplateId,
  }: {
    workspaceId: string;
    workflowTemplateId: string;
  }) {
    const belongs = await this.prisma.workflowTemplate.findFirst({
      where: {
        AND: [
          {
            id: workflowTemplateId,
          },
          {
            FK_workspaceId: workspaceId,
          },
        ],
      },
    });

    return !!belongs;
  }
}
