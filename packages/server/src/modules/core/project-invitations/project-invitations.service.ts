import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../global/prisma/prisma.service';

import { CreateProjectInvitationDto } from './dto/create-project-invitation.dto';

@Injectable()
export class ProjectInvitationsService {
  constructor(private prisma: PrismaService) {}

  async create({
    data,
    projectId,
  }: {
    data: CreateProjectInvitationDto;
    projectId: string;
  }) {
    //Check if invitation already exists
    const existingInvitation = await this.prisma.projectInvitation.findFirst({
      where: {
        AND: [
          {
            FK_projectId: projectId,
          },
          {
            FK_workspaceUserId: data.workspaceUserId,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (existingInvitation) {
      throw new ConflictException('An invitation already exists for this user');
    }

    //Validate workspaceUser does not already belong to project.
    const workspaceUserInProject = await this.prisma.project.findFirst({
      where: {
        AND: [
          {
            id: projectId,
          },
          {
            workspaceUsers: {
              some: {
                id: data.workspaceUserId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (workspaceUserInProject) {
      throw new ConflictException('This user already belongs to the project');
    }

    //Validate workspaceUser belongs to workspace.
    const projectWithWorkspace = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
      select: {
        workspace: {
          select: {
            id: true,
          },
        },
      },
    });

    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        AND: [
          {
            FK_workspaceId: projectWithWorkspace.workspace.id,
          },
          {
            id: data.workspaceUserId,
          },
        ],
      },
    });

    if (!workspaceUser) {
      throw new ForbiddenException(
        'You do not have permission to invite this user',
      );
    }

    const newProjectInvitation = await this.prisma.projectInvitation.create({
      data: {
        FK_projectId: projectId,
        FK_workspaceUserId: data.workspaceUserId,
      },
      select: {
        id: true,
      },
    });

    return this.findOne({ invitationId: newProjectInvitation.id });
  }

  async findOne({
    invitationId,
    throwNotFoundException,
  }: {
    invitationId: string;
    throwNotFoundException?: boolean;
  }) {
    if (!invitationId) {
      if (throwNotFoundException) {
        throw new NotFoundException('Invitation not found');
      } else {
        return null;
      }
    }

    const invitation = await this.prisma.projectInvitation.findUnique({
      where: {
        id: invitationId,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        workspaceUser: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invitation && throwNotFoundException) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  findAllForWorkspaceUser({ workspaceUserId }: { workspaceUserId: string }) {
    return this.prisma.projectInvitation.findMany({
      where: {
        FK_workspaceUserId: workspaceUserId,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        project: {
          name: 'asc',
        },
      },
    });
  }

  findAllForProject({ projectId }: { projectId: string }) {
    return this.prisma.projectInvitation.findMany({
      where: {
        FK_projectId: projectId,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        workspaceUser: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        project: {
          name: 'asc',
        },
      },
    });
  }

  async acceptInvitation({ invitationId }: { invitationId: string }) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: {
        id: invitationId,
      },
      select: {
        id: true,
        project: {
          select: {
            id: true,
          },
        },
        workspaceUser: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!invitation) {
      return false;
    }

    //Add workspaceUser to project
    await this.prisma.project.update({
      where: {
        id: invitation.project.id,
      },
      data: {
        workspaceUsers: {
          connect: {
            id: invitation.workspaceUser.id,
          },
        },
      },
    });

    await this.delete({ invitationId });

    return true;
  }

  async delete({ invitationId }: { invitationId: string }) {
    await this.prisma.projectInvitation.delete({
      where: {
        id: invitationId,
      },
    });

    return true;
  }

  async checkProjectInvitationBelongsToWorkspaceUser({
    workspaceUserId,
    invitationId,
  }: {
    workspaceUserId: string;
    invitationId: string;
  }) {
    const belongs = await this.prisma.projectInvitation.findFirst({
      where: {
        AND: [
          {
            id: invitationId,
          },
          {
            FK_workspaceUserId: workspaceUserId,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    return !!belongs;
  }

  async checkProjectInvitationBelongsToWorkspace({
    workspaceId,
    invitationId,
  }: {
    workspaceId: string;
    invitationId: string;
  }) {
    const belongs = await this.prisma.projectInvitation.findFirst({
      where: {
        AND: [
          {
            id: invitationId,
          },
          {
            project: {
              workspace: {
                id: workspaceId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    return !!belongs;
  }
}
