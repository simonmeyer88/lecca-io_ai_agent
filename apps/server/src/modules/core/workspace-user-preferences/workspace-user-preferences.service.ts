import { PrismaService } from '@/modules/global/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateWorkspaceUserPreferencesDto } from './dto/update-workspace-user-preferences.dto';

@Injectable()
export class WorkspaceUserPreferencesService {
  constructor(private prisma: PrismaService) {}

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
        throw new NotFoundException('Workspace user preferences not found');
      } else {
        return null;
      }
    }

    const workspaceUserPreferences =
      await this.prisma.workspaceUserPreferences.findFirst({
        where: {
          workspaceUser: {
            id: workspaceUserId, //Find me is only called by the controller. And the controller checks for active user already.
          },
        },
        select: {
          theme: true,
          workflowOrientation: true,
        },
      });

    if (!workspaceUserPreferences && throwNotFoundException) {
      throw new NotFoundException('Workspace user preferences not found');
    }

    return workspaceUserPreferences;
  }

  async updateMe<T>({
    workspaceUserId,
    data,
  }: {
    workspaceUserId: string;
    data: UpdateWorkspaceUserPreferencesDto | T;
  }) {
    await this.prisma.workspaceUserPreferences.update({
      where: {
        FK_workspaceUserId: workspaceUserId,
      },
      data,
      select: {
        id: true,
      },
    });

    //Don't have a this.findOne but findMe will work because users will only ever be accessing their own preferences
    return this.findMe({
      workspaceUserId: workspaceUserId,
      throwNotFoundException: true,
    });
  }
}
