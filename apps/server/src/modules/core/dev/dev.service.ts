import { Injectable } from '@nestjs/common';
import { CreditsService } from '../../global/credits/credits.service';
import { ServerConfig } from '@/config/server.config';
import { DevUpdateWorkspaceCreditDto } from './dto/dev-update-workspace-credit.dto';
import { PrismaService } from '@/modules/global/prisma/prisma.service';

@Injectable()
export class DevService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {}

  getWorkspaces = async () => {
    return await this.prisma.workspace.findMany({
      select: {
        id: true,
        createdAt: true,
        createdByWorkspaceUser: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        workspaceUsers: {
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
        billing: {
          select: {
            stripeCustomerId: true,
            planType: true,
            status: true,
          },
        },
        connections: {
          select: {
            _count: true,
          },
        },
        knowledge: {
          select: {
            _count: true,
          },
        },
        variables: {
          select: {
            _count: true,
          },
        },
        usage: {
          select: {
            allottedCredits: true,
            purchasedCredits: true,
            refreshedAt: true,
          },
        },
        projects: {
          select: {
            _count: true,
            workflows: {
              select: {
                _count: true,
                executions: {
                  select: {
                    _count: true,
                  },
                },
              },
            },
            agents: {
              select: {
                _count: true,
                tasks: {
                  select: {
                    _count: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  };

  updateWorkspaceCredits = async (data: DevUpdateWorkspaceCreditDto) => {
    //Absolute the data.credits. If they were negative, they will be positive now.
    data.credits = Math.abs(data.credits);

    return await this.creditsService.updateWorkspaceCredits({
      creditsUsed: data.credits,
      workspaceId: data.workspaceId,
      projectId: undefined,
      data: {
        ref: {},
        details: {
          reason: data.reason ?? `Updated by ${ServerConfig.PLATFORM_NAME}`,
        },
      },
    });
  };
}
