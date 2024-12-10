import apps from '@lecca-io/apps';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Connection } from '@prisma/client';

import { JwtUser } from '../../../types/jwt-user.type';
import { CryptoService } from '../../global/crypto/crypto.service';
import { PrismaService } from '../../global/prisma/prisma.service';

import { ConnectionExpansionDto } from './dto/connection-expansion.dto';
import { ConnectionFilterByDto } from './dto/connection-filter-by.dto';
import { ConnectionIncludeTypeDto } from './dto/connection-include-type.dto';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Injectable()
export class ConnectionsService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  async findAllForWorkspace({
    jwtUser,
    workspaceId,
    expansion,
    filterBy,
    includeType,
  }: {
    jwtUser: JwtUser;
    workspaceId: string;
    includeType?: ConnectionIncludeTypeDto;
    filterBy?: ConnectionFilterByDto;
    expansion?: ConnectionExpansionDto;
  }) {
    const connections = await this.prisma.connection.findMany({
      where: {
        AND: [
          { FK_workspaceId: workspaceId },
          filterBy?.projectId
            ? {
                FK_projectId: filterBy.projectId,
              }
            : {},
          filterBy?.workflowAppId
            ? {
                workflowAppId: filterBy.workflowAppId,
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
          /**
           * Include type: all
           * Maintainers can retrieve all
           * Non-maintainers can retrieve all from their projects and that don't belong to any project (workspace).
           */
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
        //Credentials need to be decrypted upon usage.
        //Credentials expansion is deleted in expansion decorator if it came from client.
        //Don't send credentials to client. We don't have a reason to.
        accessToken: expansion?.credentials ?? false,
        refreshToken: expansion?.credentials ?? false,
        apiKey: expansion?.credentials ?? false,
        username: expansion?.credentials ?? false,
        password: expansion?.credentials ?? false,
        privateKey: expansion?.credentials ?? false,
        publicKey: expansion?.credentials ?? false,
        connectionId: expansion?.connectionId ?? false,
        workflowAppId:
          (expansion?.workflowApp || expansion?.workflowAppId) ?? false,
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

    if (expansion?.workflowApp) {
      connections.forEach((connection) => {
        (connection as any).workflowApp = apps[connection.workflowAppId];
      });
    }

    return connections;
  }

  async create({
    data,
    expansion,
  }: {
    data: CreateConnectionDto;
    expansion?: ConnectionExpansionDto;
  }) {
    this.#validateCreateConnectionArgs({ data });
    this.#encryptCredentials({ data });

    const newConnection = await this.prisma.connection.create({
      data,
      select: {
        id: true,
      },
    });

    return this.findOne({
      connectionId: newConnection.id,
      expansion,
    });
  }

  async findOne({
    connectionId,
    expansion,
    throwNotFoundException,
  }: {
    connectionId: string;
    expansion?: ConnectionExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!connectionId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Connection not found');
      } else {
        return null;
      }
    }

    const connection = await this.prisma.connection.findUnique({
      where: {
        id: connectionId,
      },
      select: {
        id: true,
        name: true,
        description: expansion?.description ?? false,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        //Credentials need to be decrypted upon usage.
        //Credentials expansion is deleted in expansion decorator if it came from client.
        //Don't send credentials to client. We don't have a reason to.
        accessToken: expansion?.credentials ?? false,
        refreshToken: expansion?.credentials ?? false,
        apiKey: expansion?.credentials ?? false,
        username: expansion?.credentials ?? false,
        password: expansion?.credentials ?? false,
        privateKey: expansion?.credentials ?? false,
        publicKey: expansion?.credentials ?? false,
        metadata: expansion?.metadata ?? false,
        connectionId: expansion?.connectionId ?? false,
        workflowAppId: expansion?.workflowAppId ?? false,
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

    if (!connection && throwNotFoundException) {
      throw new NotFoundException('Connection not found');
    }

    if (expansion?.credentials) {
      //The expansion?.credentials will only exist if the server requests it.
      //The client cannot request credentials.
      this.decryptCredentials({ data: connection });
    }

    return connection;
  }

  async update<T>({
    connectionId,
    data,
    expansion,
  }: {
    connectionId: string;
    data: UpdateConnectionDto | T;
    expansion?: ConnectionExpansionDto;
  }) {
    this.#validateCreateConnectionArgs({ data: data as CreateConnectionDto });
    this.#encryptCredentials({ data: data as CreateConnectionDto });

    const connection = await this.prisma.connection.update({
      where: { id: connectionId },
      data,
      select: {
        id: true,
      },
    });

    return this.findOne({
      connectionId: connection.id,
      expansion,
    });
  }

  async delete({ connectionId }: { connectionId: string }) {
    await this.prisma.connection.delete({
      where: {
        id: connectionId,
      },
    });

    return true;
  }

  async checkWorkspaceUserHasAccessToConnection({
    workspaceId,
    workspaceUserId,
    connectionId,
  }: {
    workspaceId: string;
    workspaceUserId: string;
    connectionId: string;
  }) {
    const connection = await this.prisma.connection.findFirst({
      where: {
        AND: [
          {
            id: connectionId,
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

    if (!connection?.project) {
      //If the connection does not belong to a project,
      //then it belongs to the workspace.
      return true;
    } else {
      const userBelongsToProject = await this.prisma.project.findFirst({
        where: {
          AND: [
            {
              id: connection.project.id,
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
   * Connection belongs to workspace maintainer and/or the project maintainer
   *
   * If the connection belongs to a project, then the workspace maintainer or project maintainer has access
   * If the connection only belongs to the workspace, then the workspace maintainer has access
   */
  async checkConnectionBelongsToWorkspaceUser({
    workspaceId,
    workspaceUserId,
    connectionId,
  }: {
    workspaceId: string;
    workspaceUserId: string;
    connectionId: string;
  }) {
    const connection = await this.prisma.connection.findFirst({
      where: {
        AND: [
          {
            id: connectionId,
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

    if (connection.project) {
      //Currently we have no project roles, so if you have access to the project, you can modify the connection.
      const userBelongsToProject = await this.prisma.project.findFirst({
        where: {
          AND: [
            {
              id: connection.project.id,
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

  async #validateCreateConnectionArgs({ data }: { data: CreateConnectionDto }) {
    if (data.accessToken || data.refreshToken) {
      if (
        data.apiKey ||
        data.username ||
        data.password ||
        data.privateKey ||
        data.publicKey
      )
        throw new BadRequestException(
          'Connection cannot have both OAuth2 and API Key or Basic Auth or Key Pair credentials',
        );
    } else if (data.apiKey) {
      if (
        data.accessToken ||
        data.refreshToken ||
        data.username ||
        data.password
      )
        throw new BadRequestException(
          'Connection cannot have both API Key and OAuth2 or Basic Auth or Key Pair credentials',
        );
    } else if (data.username || data.password) {
      if (
        data.accessToken ||
        data.refreshToken ||
        data.apiKey ||
        data.privateKey ||
        data.publicKey
      )
        throw new BadRequestException(
          'Connection cannot have both Basic Auth credentials and OAuth2 or API Key or Key Pair credentials',
        );
    } else if (data.publicKey || data.privateKey) {
      if (
        data.accessToken ||
        data.refreshToken ||
        data.apiKey ||
        data.username ||
        data.password
      ) {
        throw new BadRequestException(
          'Connection cannot have both Key Pair credentials and OAuth2 or API Key or Basic Auth credentials',
        );
      }
    }
  }

  decryptCredentials({ data }: { data: Partial<Connection> }) {
    try {
      if (data.accessToken) {
        data.accessToken = this.cryptoService.decrypt(data.accessToken);
      }

      if (data.refreshToken) {
        data.refreshToken = this.cryptoService.decrypt(data.refreshToken);
      }

      if (data.apiKey) {
        data.apiKey = this.cryptoService.decrypt(data.apiKey);
      }

      if (data.username) {
        data.username = this.cryptoService.decrypt(data.username);
      }

      if (data.password) {
        data.password = this.cryptoService.decrypt(data.password);
      }

      if (data.privateKey) {
        data.privateKey = this.cryptoService.decrypt(data.privateKey);
      }

      if (data.publicKey) {
        data.publicKey = this.cryptoService.decrypt(data.publicKey);
      }
    } catch {
      throw new ForbiddenException('Invalid credentials');
    }
  }

  async #encryptCredentials({ data }: { data: CreateConnectionDto }) {
    if (data.accessToken) {
      data.accessToken = this.cryptoService.encrypt(data.accessToken);
    }

    if (data.refreshToken) {
      data.refreshToken = this.cryptoService.encrypt(data.refreshToken);
    }

    if (data.apiKey) {
      data.apiKey = this.cryptoService.encrypt(data.apiKey);
    }

    if (data.username) {
      data.username = this.cryptoService.encrypt(data.username);
    }

    if (data.password) {
      data.password = this.cryptoService.encrypt(data.password);
    }

    if (data.privateKey) {
      data.privateKey = this.cryptoService.encrypt(data.privateKey);
    }

    if (data.publicKey) {
      data.publicKey = this.cryptoService.encrypt(data.publicKey);
    }
  }
}
