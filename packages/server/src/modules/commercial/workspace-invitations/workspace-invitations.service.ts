import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceUserRole } from '@prisma/client';

import { UsersService } from '../../core/users/users.service';
import { WorkspacesService } from '../../core/workspaces/workspaces.service';
import { PrismaService } from '../../global/prisma/prisma.service';

import { CreateWorkspaceInvitationDto } from './dto/create-workspace-invitation.dto';
import { UpdateWorkspaceInvitationDto } from './dto/update-workspace-invitation.dto';

@Injectable()
export class WorkspaceInvitationsService {
  constructor(
    private prisma: PrismaService,
    private workspacesService: WorkspacesService,
    private usersService: UsersService,
  ) {}

  async create({
    workspaceId,
    data,
  }: {
    workspaceId: string;
    data: CreateWorkspaceInvitationDto;
  }) {
    //CHECK IF INVITATION ALREADY EXISTS FOR THIS USER
    const existingInvitation = await this.findOneByEmailAndWorkspaceId({
      workspaceId,
      email: data.email,
    });

    if (existingInvitation) {
      throw new ConflictException(
        'An invitation already exists for this email',
      );
    }

    //CHECK IF USER ALREADY BELONGS TO WORKSPACE
    const existingWorkspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        AND: [
          {
            FK_workspaceId: workspaceId,
          },
          {
            deletedAt: null,
          },
          {
            user: { email: data.email },
          },
        ],
      },
    });

    if (existingWorkspaceUser) {
      throw new ConflictException('This user already belongs to the workspace');
    }

    const newInvitation = await this.prisma.workspaceInvitation.create({
      data: {
        ...data,
        FK_workspaceId: workspaceId,
      },
      select: {
        id: true,
      },
    });

    return this.findOneById({ invitationId: newInvitation.id });
  }

  async findOneById({
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

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: {
        id: invitationId,
      },
      select: {
        id: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation && throwNotFoundException) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  async findOneByEmailAndWorkspaceId({
    workspaceId,
    email,
    throwNotFoundException,
  }: {
    workspaceId: string;
    email: string;
    throwNotFoundException?: boolean;
  }) {
    if (!email || !workspaceId) {
      if (throwNotFoundException) {
        throw new NotFoundException('Invitation not found');
      } else {
        return null;
      }
    }

    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        AND: [
          {
            FK_workspaceId: workspaceId,
          },
          {
            email,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!invitation && throwNotFoundException) {
      throw new NotFoundException('Invitation not found');
    }

    return this.findOneById({
      invitationId: invitation?.id,
      throwNotFoundException,
    });
  }

  findAllForEmail({ email }: { email: string }) {
    return this.prisma.workspaceInvitation.findMany({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        workspace: {
          name: 'asc',
        },
      },
    });
  }

  findAllForWorkspace({ workspaceId }: { workspaceId: string }) {
    return this.prisma.workspaceInvitation.findMany({
      where: {
        FK_workspaceId: workspaceId,
      },
      select: {
        id: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        email: 'asc',
      },
    });
  }

  async update<T>({
    invitationId,
    data,
  }: {
    invitationId: string;
    data: UpdateWorkspaceInvitationDto | T;
  }) {
    const invitation = await this.prisma.workspaceInvitation.update({
      where: {
        id: invitationId,
      },
      data,
      select: {
        id: true,
      },
    });

    return this.findOneById({ invitationId: invitation.id });
  }

  async acceptInvitation({
    invitationId,
    throwNotFoundException,
  }: {
    invitationId: string;
    throwNotFoundException?: boolean;
  }) {
    const invitation = await this.findOneById({
      invitationId,
      throwNotFoundException,
    });

    const user = await this.usersService.findOneByEmail({
      email: invitation.email,
      throwNotFoundException,
    });

    const newWorkspaceUser = await this.workspacesService.joinWorkspace({
      workspaceId: invitation.workspace.id,
      userId: user.id,
      roles: invitation.roles as WorkspaceUserRole[],
    });

    await this.workspacesService.setActiveWorkspaceForUser({
      workspaceId: invitation.workspace.id,
      userId: user.id,
    });

    await this.delete({ invitationId });

    return newWorkspaceUser;
  }

  async delete({ invitationId }: { invitationId: string }) {
    await this.prisma.workspaceInvitation.delete({
      where: {
        id: invitationId,
      },
    });

    return true;
  }

  async checkWorkspaceInvitationBelongsToUserEmail({
    workspaceInvitationId,
    email,
  }: {
    workspaceInvitationId: string;
    email: string;
  }) {
    const belongs = await this.prisma.workspaceInvitation.findFirst({
      where: {
        AND: [
          {
            id: workspaceInvitationId,
          },
          {
            email,
          },
        ],
      },
    });

    return !!belongs;
  }
}
