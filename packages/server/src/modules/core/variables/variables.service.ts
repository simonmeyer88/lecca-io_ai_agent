import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { JwtUser } from '@/types/jwt-user.type';

import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { VariableExpansionDto } from './dto/variable-expansion.dto';
import { VariableFilterByDto } from './dto/variable-filter-by.dto';
import { VariableIncludeTypeDto } from './dto/variable-include-type.dto';

@Injectable()
export class VariablesService {
  constructor(private prisma: PrismaService) {}

  async create({
    data,
    workspaceId,
    expansion,
  }: {
    data: CreateVariableDto;
    workspaceId: string;
    expansion: VariableExpansionDto;
  }) {
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

    if (data.dataType === 'number') {
      data.value = Number(data.value);
    }

    const newVariable = await this.prisma.variable.create({
      data: {
        ...data,
        FK_workspaceId: workspaceId,
        FK_projectId,
      },
      select: {
        id: true,
      },
    });

    return this.findOne({
      variableId: newVariable.id,
      expansion,
    });
  }

  async findOne({
    variableId,
    expansion,
    throwNotFoundException,
  }: {
    variableId: string;
    expansion: VariableExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!variableId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Variable not found');
      } else {
        return null;
      }
    }

    const variable = await this.prisma.variable.findUnique({
      where: {
        id: variableId,
      },
      select: {
        id: true,
        name: true,
        dataType: true,
        type: true,
        value: expansion?.value ?? false,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        workspace: expansion?.workspace
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
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

    if (!variable && throwNotFoundException) {
      throw new NotFoundException('Variable not found');
    }

    return variable;
  }

  async update<T>({
    variableId,
    data,
    expansion,
  }: {
    variableId: string;
    data: UpdateVariableDto | T;
    expansion?: VariableExpansionDto;
  }) {
    if ((data as UpdateVariableDto).dataType === 'number') {
      (data as UpdateVariableDto).value = Number(
        (data as UpdateVariableDto).value,
      );
    }

    const variable = await this.prisma.variable.update({
      where: { id: variableId },
      data,
      select: {
        id: true,
      },
    });

    return this.findOne({
      variableId: variable.id,
      expansion,
    });
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
    includeType?: VariableIncludeTypeDto;
    filterBy?: VariableFilterByDto;
    expansion?: VariableExpansionDto;
  }) {
    return this.prisma.variable.findMany({
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
        dataType: true,
        type: true,
        value: expansion?.value ?? false,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        workspace: expansion?.workspace
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
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

  async delete({ variableId }: { variableId: string }) {
    await this.prisma.variable.delete({
      where: {
        id: variableId,
      },
    });

    return true;
  }

  async checkWorkspaceUserHasAccessToVariable({
    workspaceId,
    workspaceUserId,
    variableId,
  }: {
    workspaceId: string;
    workspaceUserId: string;
    variableId: string;
  }) {
    const variable = await this.prisma.variable.findFirst({
      where: {
        AND: [
          {
            id: variableId,
          },
          {
            FK_workspaceId: workspaceId,
          },
        ],
      },
      select: {
        project: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!variable?.project) {
      //If the variable does not belong to a project,
      //then it belongs to the workspace.
      return true;
    } else {
      const userBelongsToProject = await this.prisma.project.findFirst({
        where: {
          AND: [
            {
              id: variable.project.id,
            },
            {
              workspaceUsers: {
                some: {
                  id: workspaceUserId,
                },
              },
            },
          ],
        },
      });

      return !!userBelongsToProject;
    }
  }

  /**
   * Variable belongs to workspace maintainer and/or the project maintainer
   *
   * If the variable belongs to a project, then the workspace maintainer or project maintainer has access
   * If the variable only belongs to the workspace, then the workspace maintainer has access
   */
  async checkVariableBelongsToWorkspaceUser({
    workspaceId,
    workspaceUserId,
    variableId,
  }: {
    workspaceId: string;
    workspaceUserId: string;
    variableId: string;
  }) {
    const variable = await this.prisma.variable.findFirst({
      where: {
        AND: [
          {
            id: variableId,
          },
          {
            FK_workspaceId: workspaceId,
          },
        ],
      },
      select: {
        project: {
          select: {
            id: true,
          },
        },
      },
    });

    if (variable.project) {
      //Currently we have no project roles, so if you have access to the project, you can modify the variable.
      const userBelongsToProject = await this.prisma.project.findFirst({
        where: {
          AND: [
            {
              id: variable.project.id,
            },
            {
              workspaceUsers: {
                some: {
                  id: workspaceUserId,
                },
              },
            },
          ],
        },
      });

      return !!userBelongsToProject;
    } else {
      //If varible does not belong to a project, then it belongs to the workspace.
      //Only workspace maintainers can modify workspace variables.
      const userBelongsToWorkspace = await this.prisma.workspaceUser.findFirst({
        where: {
          AND: [
            {
              FK_workspaceId: workspaceId,
            },
            {
              id: workspaceUserId,
            },
            {
              roles: {
                has: 'MAINTAINER',
              },
            },
          ],
        },
      });

      return !!userBelongsToWorkspace;
    }
  }
}
