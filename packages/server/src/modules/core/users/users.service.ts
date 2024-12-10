import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';

import { UserDeletedEventPayload } from '../../../types/event-payloads/user-deleted-event-payload.type';
import { OperationsService } from '../../global/operations/operations.service';
import { PrismaService } from '../../global/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserExpansionDto } from './dto/user-expansion.dto';
import { UserIncludeTypeDto } from './dto/user-include-type.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private operationsService: OperationsService,
  ) {}

  async create({
    data,
    forceVerifyEmail,
    includeType,
    expansion,
  }: {
    data: CreateUserDto;
    forceVerifyEmail?: boolean;
    includeType?: UserIncludeTypeDto;
    expansion?: UserExpansionDto;
  }) {
    data.email = data.email.toLowerCase();

    const existingUser = await this.findOneByEmail({
      email: data.email,
      expansion: { deletedAt: true },
      includeType: { deleted: true },
    });

    if (existingUser && !existingUser.deletedAt) {
      //If the user has been deleted, we can allow the user to sign up again.
      throw new ConflictException('User with this email already exists');
    }

    /**
     * If a password is provided, hash it. If not, leave it undefined.
     * A password may not be provided if logging in with a third-party provider.
     */
    let hashedPasswordIfExists: string | undefined;
    if (data.password) {
      hashedPasswordIfExists = bcrypt.hashSync(data.password, 10);
    }

    /**
     * If the option to force verify the email is provided, set the emailVerifiedAt.
     * This is useful for testing purposes and when already verified by a third-party provider.
     */
    let emailVerifiedAt: string | undefined;

    if (forceVerifyEmail) {
      emailVerifiedAt = new Date().toISOString();
    } else {
      //If the email is not verified the sendVerificationEmail method will generate one.
    }

    let newUser;
    if (existingUser?.deletedAt) {
      newUser = await this.prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          ...data,
          deletedAt: null,
          password: hashedPasswordIfExists,
          emailVerifiedAt: emailVerifiedAt,
        },
      });
    } else {
      newUser = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPasswordIfExists,
          emailVerifiedAt: emailVerifiedAt,
        },
      });
    }

    const calculatedFirstName = data.name.split(' ')[0];
    const calculatedLastName = data.name.split(' ')[1];

    this.operationsService.onNewUser({
      email: data.email,
      firstName: calculatedFirstName,
      lastName: calculatedLastName,
      verifiedEmail: !!emailVerifiedAt,
    });

    return this.findOneById({
      userId: newUser.id,
      includeType,
      expansion,
    });
  }

  async findOneById({
    userId,
    includeType,
    expansion,
    throwNotFoundException,
  }: {
    userId: string;
    includeType?: UserIncludeTypeDto;
    expansion?: UserExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!userId) {
      //If there is no id, that means that another method is calling this method without an id
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('User not found');
      } else {
        return null;
      }
    }

    const user = await this.prisma.user.findFirst({
      where: {
        AND: [{ id: userId }, includeType?.deleted ? {} : { deletedAt: null }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: expansion?.createdAt ?? false,
        deletedAt: expansion?.deletedAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        rootProfileImageUrl: expansion?.rootProfileImageUrl ?? false,
        emailVerifiedAt: expansion?.emailVerifiedAt ?? false,
        toursCompleted: expansion?.toursCompleted ?? false,
        activeWorkspace: includeType?.activeWorkspace
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
      },
    });

    if (!user && throwNotFoundException) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findMe({
    userId,
    throwNotFoundException,
  }: {
    userId: string;
    throwNotFoundException?: boolean;
  }) {
    if (!userId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('User not found');
      } else {
        return null;
      }
    }

    const user = await this.prisma.user.findFirst({
      where: {
        AND: [{ id: userId }, { deletedAt: null }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        rootProfileImageUrl: true,
        emailVerifiedAt: true,
        toursCompleted: true,
      },
    });

    if (!user && throwNotFoundException) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe<T>({
    userId,
    data,
  }: {
    userId: string;
    data: UpdateUserDto | T;
  }) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
      },
    });

    return this.findMe({
      userId: userId,
      throwNotFoundException: true,
    });
  }

  async findOneByEmail({
    email,
    includeType,
    expansion,
    throwNotFoundException,
  }: {
    email: string;
    includeType?: UserIncludeTypeDto;
    expansion?: UserExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    const user = await this.prisma.user.findFirst({
      where: {
        AND: [includeType?.deleted ? {} : { deletedAt: null }, { email }],
      },
      select: {
        id: true,
      },
    });

    if (!user && throwNotFoundException) {
      throw new NotFoundException('User not found');
    }

    return this.findOneById({
      userId: user?.id,
      includeType,
      expansion,
    });
  }

  async findOneByWorkspaceUserId({
    workspaceUserId,
    includeType,
    expansion,
    throwNotFoundException,
  }: {
    workspaceUserId: string;
    includeType?: UserIncludeTypeDto;
    expansion?: UserExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    const user = await this.prisma.user.findFirst({
      where: {
        AND: [
          includeType?.deleted
            ? {}
            : {
                deletedAt: null,
              },
          {
            workspaceUsers: {
              some: {
                AND: [
                  includeType?.deleted
                    ? {}
                    : {
                        deletedAt: null,
                      },
                  {
                    id: workspaceUserId,
                  },
                ],
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!user && throwNotFoundException) {
      throw new NotFoundException('User not found');
    }

    return this.findOneById({
      userId: user?.id,
      includeType,
      expansion,
    });
  }

  async update<T>({
    userId,
    data,
    includeType,
    expansion,
  }: {
    userId: string;
    data: UpdateUserDto | T;
    includeType?: UserIncludeTypeDto;
    expansion?: UserExpansionDto;
  }) {
    await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
      },
    });

    return this.findOneById({
      userId: userId,
      includeType,
      expansion,
    });
  }

  async delete({ userId }: { userId: string }) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date().toISOString(),
        rootProfileImageUrl: null,
        password: null,
        name: '',
        emailVerifiedAt: null,
      },
    });

    this.eventEmitter.emit('user.deleted', {
      userId,
    } as UserDeletedEventPayload);

    return true;
  }

  /**
   * `Only use for authentication purposes`
   *
   * Returns the user with the encrypted password.
   */
  findOneByEmailForPasswordValidation({ email }: { email: string }) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }

  /**
   * Used for getting the JWT User that gets set on req.user
   */
  async findActiveWorkspaceUserIdAndWorkspaceIdAndRolesForUser({
    userId,
  }: {
    userId: string;
  }) {
    const workspace = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        activeWorkspace: {
          select: {
            id: true,
            workspaceUsers: {
              where: {
                AND: [
                  {
                    FK_userId: userId,
                  },
                  {
                    deletedAt: null,
                  },
                ],
              },
              select: {
                id: true,
                roles: true,
              },
            },
          },
        },
      },
    });

    //If there's no active workspace, they might've deleted their active workspace.
    //So we'll find the first workspace they belong to and set it as their active workspace.
    if (!workspace?.activeWorkspace) {
      const workspaces = await this.prisma.workspace.findMany({
        where: {
          AND: [
            {
              workspaceUsers: {
                some: {
                  AND: [
                    {
                      FK_userId: userId,
                    },
                    {
                      deletedAt: null,
                    },
                  ],
                },
              },
            },
          ],
        },
        select: {
          id: true,
        },
        take: 1,
      });

      if (workspaces?.length) {
        const updatedWorkspaceInfo = await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            activeWorkspace: {
              connect: {
                id: workspaces[0].id,
              },
            },
          },
          select: {
            id: true,
            activeWorkspace: {
              select: {
                id: true,
                workspaceUsers: {
                  where: {
                    AND: [
                      {
                        FK_userId: userId,
                      },
                      {
                        deletedAt: null,
                      },
                    ],
                  },
                  select: {
                    id: true,
                    roles: true,
                  },
                },
              },
            },
          },
        });

        return {
          activeWorkspaceId: updatedWorkspaceInfo?.activeWorkspace?.id,
          workspaceUserId:
            updatedWorkspaceInfo?.activeWorkspace?.workspaceUsers?.[0]?.id,
          roles:
            updatedWorkspaceInfo?.activeWorkspace?.workspaceUsers?.[0]?.roles,
        };
      }
    }

    return {
      activeWorkspaceId: workspace?.activeWorkspace?.id,
      workspaceUserId: workspace?.activeWorkspace?.workspaceUsers?.[0]?.id,
      roles: workspace?.activeWorkspace?.workspaceUsers?.[0]?.roles,
    };
  }

  async checkUserBelongsToWorkspace({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    const belongs = await this.prisma.user.findFirst({
      where: {
        AND: [
          {
            id: userId,
          },
          {
            workspaceUsers: {
              some: {
                AND: [
                  {
                    FK_workspaceId: workspaceId,
                  },
                  {
                    deletedAt: null,
                  },
                ],
              },
            },
          },
        ],
      },
    });

    return !!belongs;
  }
}
