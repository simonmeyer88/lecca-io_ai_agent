import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { JwtUser } from '@/types/jwt-user.type';
import { UserDeletedEventPayload } from '@/types/event-payloads/user-deleted-event-payload.type';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { S3ManagerService } from '../../global/s3/s3.service';
import { CreateWorkspaceUserDto } from './dto/create-workspace-user.dto';
import { UpdateWorkspaceUserRolesDto } from './dto/update-workspace-user-roles.dto';
import { UpdateWorkspaceUserDto } from './dto/update-workspace-user.dto';
import { WorkspaceUserExpansionDto } from './dto/workspace-user-expansion.dto';
import { WorkspaceUserFilterByDto } from './dto/workspace-user-filter-by.dto';
import { WorkspaceUserIncludeTypeDto } from './dto/workspace-user-include-type.dto';
import { WorkspaceUserRole } from '@prisma/client';

@Injectable()
export class WorkspaceUsersService {
  constructor(
    private prisma: PrismaService,
    private s3Manager: S3ManagerService,
  ) {}

  async create({
    data,
    expansion,
  }: {
    data: CreateWorkspaceUserDto;
    expansion?: WorkspaceUserExpansionDto;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: data.FK_userId,
      },
      select: {
        rootProfileImageUrl: true,
        name: true,
      },
    });

    const newWorkspaceUser = await this.prisma.workspaceUser.create({
      data: {
        ...data,
        profileImageUrl: data.profileImageUrl ?? user.rootProfileImageUrl,
        preferences: {
          create: {},
        },
      },
      select: {
        id: true,
        FK_workspaceId: true,
      },
    });

    //Anytime a workspace user is created, we create a few default things for them.

    // // 1. Create Default Project
    // const defaultProject = await this.prisma.project.create({
    //   data: {
    //     name: 'Personal Project',
    //     FK_createdByWorkspaceUserId: newWorkspaceUser.id,
    //     FK_workspaceId: newWorkspaceUser.FK_workspaceId,
    //     workspaceUsers: {
    //       connect: {
    //         id: newWorkspaceUser.id,
    //       },
    //     },
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    // // 2. Create Default Agent
    // await this.prisma.agent.create({
    //   data: {
    //     name: `${user.name.split(' ')[0]}'s Assistant`,
    //     description:
    //       'Your personal assistant. Add more tools to increase capabilities!',
    //     FK_projectId: defaultProject.id,
    //     llmProvider: ServerConfig.DEFAULT_LLM_PROVIDER,
    //     llmModel: ServerConfig.DEFAULT_LLM_MODEL,
    //     tools: [
    //       {
    //         id: 'e81faad9-ab23-4217-8ac9-baa3b4c9378b',
    //         appId: 'web',
    //         nodeType: 'action',
    //         actionId: 'web_action_google-search',
    //         description: 'Search the web using Google.',
    //         name: 'Google Search',
    //         position: {
    //           x: 0,
    //           y: 0,
    //         },
    //       },
    //       {
    //         id: 'd9c0727d-5418-48b1-ad7b-7c7f4c4d4d4b',
    //         appId: 'web',
    //         nodeType: 'action',
    //         actionId: 'web_action_extract-static-website-content',
    //         description: 'Visits a static website and extracts data.',
    //         name: 'Extract Static Website Content',
    //         position: {
    //           x: 0,
    //           y: 0,
    //         },
    //       },
    //       {
    //         id: 'd361206e-9c36-412b-a804-e07445c73818',
    //         appId: 'date',
    //         nodeType: 'action',
    //         actionId: 'date_action_get-current-date',
    //         description: 'Gets the current date using the provided timezone.',
    //         name: 'Get Current Date',
    //         position: {
    //           x: 0,
    //           y: 0,
    //         },
    //       },
    //     ],
    //   },
    //   select: {
    //     id: true,
    //   },
    // });

    return this.findOne({
      workspaceUserId: newWorkspaceUser.id,
      expansion,
    });
  }
  async findOne({
    workspaceUserId,
    expansion,
    includeType,
    throwNotFoundException,
  }: {
    workspaceUserId: string;
    includeType?: WorkspaceUserIncludeTypeDto;
    expansion?: WorkspaceUserExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!workspaceUserId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Workspace user not found');
      } else {
        return null;
      }
    }

    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        AND: [
          {
            id: workspaceUserId,
          },
          includeType?.deleted
            ? {}
            : {
                deletedAt: null,
              },
        ],
      },
      select: {
        id: true,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        deletedAt: expansion?.deletedAt ?? false,
        profileImageUrl: expansion?.profileImageUrl ?? false,
        roles: expansion?.roles ?? false,
        workspace: expansion?.workspace
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        user: expansion?.user
          ? {
              select: {
                id: true,
                email: true,
                name: true,
              },
            }
          : false,
      },
    });

    if (!workspaceUser && throwNotFoundException) {
      throw new NotFoundException('Workspace user not found');
    }

    return workspaceUser;
  }

  async findMe({
    workspaceUserId,
    throwNotFoundException,
  }: {
    workspaceUserId: string;
    throwNotFoundException?: boolean;
  }) {
    if (!workspaceUserId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Workspace user not found');
      } else {
        return null;
      }
    }

    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        id: workspaceUserId, //Find me is only called by the controller. And the controller checks for active user already.
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        profileImageUrl: true,
        roles: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            toursCompleted: true,
          },
        },
      },
    });

    if (!workspaceUser && throwNotFoundException) {
      throw new NotFoundException('Workspace user not found');
    }

    return workspaceUser;
  }

  async findAllForWorkspace({
    workspaceId,
    expansion,
    includeType,
    filterBy,
  }: {
    workspaceId: string;
    includeType?: WorkspaceUserIncludeTypeDto;
    expansion?: WorkspaceUserExpansionDto;
    filterBy?: WorkspaceUserFilterByDto;
  }) {
    return this.prisma.workspaceUser.findMany({
      where: {
        AND: [
          {
            FK_workspaceId: workspaceId,
          },
          includeType?.deleted
            ? {}
            : {
                deletedAt: null,
              },
          filterBy?.projectId
            ? {
                projects: {
                  some: {
                    id: filterBy.projectId,
                  },
                },
              }
            : {},
        ],
      },
      select: {
        id: true,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        deletedAt: expansion?.deletedAt ?? false,
        profileImageUrl: expansion?.profileImageUrl ?? false,
        roles: expansion?.roles ?? false,
        workspace: expansion?.workspace
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        user: expansion?.user
          ? {
              select: {
                id: true,
                email: true,
                name: true,
              },
            }
          : false,
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }

  async update<T>({
    workspaceUserId,
    data,
    expansion,
    includeType,
  }: {
    workspaceUserId: string;
    data: UpdateWorkspaceUserDto | T;
    includeType?: WorkspaceUserIncludeTypeDto;
    expansion?: WorkspaceUserExpansionDto;
  }) {
    const workspaceUser = await this.prisma.workspaceUser.update({
      where: {
        id: workspaceUserId,
      },
      data,
      select: {
        id: true,
      },
    });

    return this.findOne({
      workspaceUserId: workspaceUser.id,
      includeType,
      expansion,
    });
  }

  async updateRoles({
    workspaceUserId,
    data,
    expansion,
    includeType,
    jwtUser,
  }: {
    workspaceUserId: string;
    data: UpdateWorkspaceUserRolesDto;
    includeType?: WorkspaceUserIncludeTypeDto;
    expansion?: WorkspaceUserExpansionDto;
    jwtUser: JwtUser;
  }) {
    const workspaceUserBeingUpdated = await this.findOne({
      workspaceUserId,
      expansion: {
        roles: true,
      },
    });

    /**
     * Owners can update any roles.
     * They can update other owner's roles and create owners.
     * Therefore we don't need to validate the roles. The checks below
     * are for if the requestor is not an owner.
     */
    if (!jwtUser.roles.includes('OWNER')) {
      if (workspaceUserBeingUpdated.roles.includes(WorkspaceUserRole.OWNER)) {
        throw new ForbiddenException(
          "Only other owners can update owner's roles",
        );
      }
      if (data.roles.includes(WorkspaceUserRole.OWNER)) {
        throw new ForbiddenException('Only other owners can add owners');
      }
    }

    return await this.update({
      workspaceUserId,
      data,
      expansion,
      includeType,
    });
  }

  async findWorkspaceUserByWorkspaceIdAndUserId({
    workspaceId,
    userId,
    expansion,
    includeType,
  }: {
    workspaceId: string;
    userId: string;
    includeType?: WorkspaceUserIncludeTypeDto;
    expansion?: WorkspaceUserExpansionDto;
  }) {
    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        AND: [
          {
            FK_workspaceId: workspaceId,
          },
          {
            FK_userId: userId,
          },
          includeType?.deleted
            ? {}
            : {
                deletedAt: null,
              },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!workspaceUser) {
      return null;
    }

    return this.findOne({
      workspaceUserId: workspaceUser.id,
      includeType,
      expansion,
    });
  }

  async delete({ workspaceUserId }: { workspaceUserId: string }) {
    await this.prisma.workspaceUser.update({
      data: {
        deletedAt: new Date(),
        profileImageUrl: null,
        roles: [],
        recentWorkflows: {
          set: [],
        },
        notifications: {
          set: [],
        },
        projects: {
          set: [],
        },
        projectInvitations: {
          set: [],
        },
        createdProjects: {
          set: [],
        },
        createdWorkspaces: {
          set: [],
        },
      },
      where: {
        id: workspaceUserId,
      },
    });

    return true;
  }

  async getPresignedPostUrlForProfileImage({
    fileName,
    workspaceUserId,
    workspaceId,
  }: {
    fileName: string;
    workspaceUserId: string;
    workspaceId: string;
  }) {
    let fileNameExtension = fileName.split('.').pop();
    if (!fileNameExtension || fileNameExtension.length === 0) {
      fileNameExtension = undefined;
    } else {
      fileNameExtension = fileNameExtension.toLocaleLowerCase();
    }

    return this.s3Manager.getPresignedPostUrl({
      filePath: `workspaces/${workspaceId}/workspace-users/${workspaceUserId}/profile-image/profile-image${fileNameExtension ? `.${fileNameExtension}` : ''}`,
      fileName: fileName,
      options: {
        ExpirationMinutes: 5,
        publicRead: true,
      },
    });
  }

  async checkWorkspaceUserBelongsToWorkspace({
    workspaceUserId,
    workspaceId,
  }: {
    workspaceUserId: string;
    workspaceId: string;
  }) {
    const belongs = await this.prisma.workspaceUser.findFirst({
      where: {
        AND: [
          {
            id: workspaceUserId,
          },
          {
            deletedAt: null,
          },
          {
            FK_workspaceId: workspaceId,
          },
        ],
      },
    });

    return !!belongs;
  }

  @OnEvent('user.deleted')
  async handleUserDeletedEvent(payload: UserDeletedEventPayload) {
    /**
     * If a user is (soft) deleted, we need to (soft) delete all of the workspace users as well.
     */

    const deletedWorkspaceUsers = await this.prisma.workspaceUser.findMany({
      where: {
        AND: [
          {
            FK_userId: payload.userId,
          },
          {
            deletedAt: null,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      deletedWorkspaceUsers.map((workspaceUser) =>
        this.delete({ workspaceUserId: workspaceUser.id }),
      ),
    );
  }
}
