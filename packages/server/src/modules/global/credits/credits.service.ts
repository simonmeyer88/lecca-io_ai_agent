import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BillingPlanType } from '@prisma/client';

import { ServerConfig } from '../../../config/server.config';
import { JwtUser } from '../../../types/jwt-user.type';
import {
  AiProvider,
  AiProviderService,
} from '../ai-provider/ai-provider.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreditExpansionDto } from './dto/credit-expansion.dto';
import { CreditFilterByDto } from './dto/credit-filter-by.dto';
import { CreditIncludeTypeDto } from './dto/credit-include-type.dto';

/**
 * We handle all the credit related operations here.
 *
 * $10 = 1000 credits
 * $1 = 100 credits
 * $0.01 = 1 credit
 *
 * Different API's have different conversion rates to our credits.
 *
 */

@Injectable()
export class CreditsService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
  ) {}

  async findOne({
    creditId,
    expansion,
    throwNotFoundException,
  }: {
    creditId: string;
    expansion?: CreditExpansionDto;
    throwNotFoundException?: boolean;
  }) {
    if (!creditId) {
      //If there is no id, that means that another method is calling this method without an id.
      //Prisma will throw an error if we don't provide an id, so we throw a custom error here or return null.
      if (throwNotFoundException) {
        throw new NotFoundException('Credit not found');
      } else {
        return null;
      }
    }

    const credit = await this.prisma.credit.findUnique({
      where: {
        id: creditId,
      },
      select: {
        id: true,
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        creditsUsed: expansion?.creditsUsed ?? false,
        details: expansion?.details ?? false,
        project: expansion?.project
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        workflow: expansion?.workflow
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        agent: expansion?.agent
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        task: expansion?.task
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        execution: expansion?.execution
          ? {
              select: {
                id: true,
                executionNumber: true,
              },
            }
          : false,
        knowledge: expansion?.knowledge
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
      },
    });

    if (!credit && throwNotFoundException) {
      throw new NotFoundException('Credit not found');
    }

    return credit;
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
    includeType: CreditIncludeTypeDto;
    expansion: CreditExpansionDto;
    filterBy: CreditFilterByDto;
  }) {
    if (!jwtUser?.roles?.includes('MAINTAINER')) {
      if (includeType?.all)
        throw new ForbiddenException(
          'You do not have permission to request all executions',
        );
    }

    const credits = await this.prisma.credit.findMany({
      where: {
        AND: [
          {
            FK_workspaceId: workspaceId,
          },
          filterBy?.projectId
            ? {
                FK_projectId: filterBy.projectId,
              }
            : {},
          filterBy?.workflowId
            ? {
                FK_workflowId: filterBy.workflowId,
              }
            : {},
          filterBy?.agentId
            ? {
                FK_agentId: filterBy.agentId,
              }
            : {},
          filterBy?.executionId
            ? {
                FK_executionId: filterBy.executionId,
              }
            : {},
          filterBy?.taskId
            ? {
                FK_taskId: filterBy.taskId,
              }
            : {},
          filterBy?.knowledgeId
            ? {
                FK_knowledgeId: filterBy.knowledgeId,
              }
            : {},
          includeType?.all
            ? {}
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
        createdAt: expansion?.createdAt ?? false,
        updatedAt: expansion?.updatedAt ?? false,
        creditsUsed: expansion?.creditsUsed ?? false,
        details: expansion?.details ?? false,
        project: expansion?.project
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        workflow: expansion?.workflow
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        agent: expansion?.agent
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        task: expansion?.task
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
        execution: expansion?.execution
          ? {
              select: {
                id: true,
                executionNumber: true,
              },
            }
          : false,
        knowledge: expansion?.knowledge
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return credits;
  }

  transformLlmTokensToCredits = ({
    aiProvider,
    model,
    data,
  }: {
    aiProvider: AiProvider;
    model: string;
    data: TokenConversionData;
  }) => {
    const provider = this.aiProvider.providers[aiProvider];
    const languageModel = provider.languageModels[model];
    const inputTokens = data.inputTokens;
    const outputTokens = data.outputTokens;

    if (inputTokens == null || outputTokens == null) {
      throw new Error(
        `Cannot transform token usage data to credits. Missing input or output tokens: ${JSON.stringify(data)}`,
      );
    }

    if (!languageModel) {
      throw new Error(
        `Cannot transform token usage data to credits. Invalid model: ${model}`,
      );
    }

    const inputInverseConversion = languageModel.creditConversionData.input;
    const outputInverseConversion = languageModel.creditConversionData.output;

    if (aiProvider === 'ollama') {
      //This is just a dirty way of making ollama free since it's running locally
      return 0;
    } else {
      return Math.ceil(
        inputTokens / inputInverseConversion +
          outputTokens / outputInverseConversion,
      );
    }
  };

  checkIfWorkspaceHasLlmCredits = async ({
    workspaceId,
    // aiProvider,
    // model,
    throwIfFalse = true,
  }: {
    workspaceId: string;
    aiProvider: AiProvider;
    model: string;
    throwIfFalse?: boolean;
  }) => {
    // const provider = this.aiProvider.providers[aiProvider];
    // const languageModel = provider.languageModels[model];

    const minimumCreditsRequired = 1;

    const workspaceWithUsage = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        usage: {
          select: {
            allottedCredits: true,
            purchasedCredits: true,
          },
        },
      },
    });

    const totalAvailableCredits =
      workspaceWithUsage?.usage?.allottedCredits +
      workspaceWithUsage?.usage?.purchasedCredits;

    const hasEnoughCredits =
      minimumCreditsRequired <= (totalAvailableCredits || 0);

    if (!hasEnoughCredits && throwIfFalse) {
      if (this.isBillingEnabled() === true) {
        throw new Error(
          `Your workspace has insufficient credits to use this feature.`,
        );
      } else {
        //We won't throw an error if billing is not enabled.
        return false;
      }
    } else {
      return hasEnoughCredits;
    }
  };

  transformCostToCredits = ({
    data,
    usageType,
  }: {
    data: UsageTypeData;
    usageType: UsageType;
  }) => {
    let calculatedCredits: number;

    switch (usageType) {
      //EXECUTIONS
      case 'workflow-execution': {
        calculatedCredits = CONVERSION_RATE_MAP[usageType].minimumRequired;
        break;
      }
      //EMBED RATE
      case 'openai-text-embedding-ada-002': {
        const tokenData = data as EmbeddingChunkData;

        const chunks = tokenData.numEmbeddings;

        if (chunks == null) {
          throw new Error(
            `Cannot transform embedding data to credits. Missing chunks: ${JSON.stringify(data)}`,
          );
        }

        calculatedCredits = Math.ceil(
          chunks * CONVERSION_RATE_MAP[usageType].conversion.embedRate,
        );
        break;
      }
      //MONEY
      case 'extract-dynamic-website-content':
      case 'extract-static-website-content':
      case 'vapi': {
        const usdData = data as UsdConversionData;

        if (usdData.cost == null) {
          throw new Error(
            `Cannot transform USD usage data to credits. Missing cost: ${JSON.stringify(data)}`,
          );
        }

        calculatedCredits = Math.ceil(
          usdData.cost * CONVERSION_RATE_MAP[usageType].conversion.cost,
        );
        break;
      }
      //SERPER CREDIT
      case 'serper': {
        const serperData = data as SerperConversionData;

        if (serperData.credits == null) {
          throw new Error(
            `Cannot transform serper usage data to credits. Missing credit: ${JSON.stringify(data)}`,
          );
        }

        calculatedCredits = Math.ceil(
          serperData.credits * CONVERSION_RATE_MAP['serper'].conversion.credit,
        );
        break;
      }
      default:
        throw new Error(
          `Cannot transform usage data to credits: Invalid usage type: ${usageType}. Add them to the credits.service`,
        );
    }

    return calculatedCredits;
  };

  checkIfWorkspaceHasEnoughCredits = async ({
    workspaceId,
    usageType,
    throwIfFalse = true,
    overrideMinimumRequired,
  }: {
    workspaceId: string;
    usageType: UsageType;
    throwIfFalse?: boolean;
    overrideMinimumRequired?: number;
  }) => {
    const minimumCreditsRequired =
      overrideMinimumRequired ?? CONVERSION_RATE_MAP[usageType].minimumRequired;

    if (minimumCreditsRequired == null) {
      throw new Error(
        `Cannot check if workspace has enough credits. Invalid usage type: ${usageType}. Add them to the credits.service`,
      );
    }

    const workspaceWithUsage = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        usage: {
          select: {
            allottedCredits: true,
            purchasedCredits: true,
          },
        },
      },
    });

    const totalAvailableCredits =
      workspaceWithUsage?.usage?.allottedCredits +
      workspaceWithUsage?.usage?.purchasedCredits;

    const hasEnoughCredits =
      minimumCreditsRequired <= (totalAvailableCredits || 0);

    if (!hasEnoughCredits && throwIfFalse) {
      if (this.isBillingEnabled() === true) {
        throw new Error(
          `Your workspace has insufficient credits to use this feature.`,
        );
      } else {
        //We won't throw an error if billing is not enabled.
        return false;
      }
    } else {
      return hasEnoughCredits;
    }
  };

  #createCreditUsageItem = async ({
    workspaceId,
    creditsUsed,
    projectId,
    data,
  }: UpdateWorkspaceCreditsData) => {
    return await this.prisma.credit.create({
      data: {
        FK_workspaceId: workspaceId,
        creditsUsed,
        details: data.details ?? {},
        FK_projectId: projectId ?? undefined,
        FK_agentId: data.ref?.agentId ?? undefined,
        FK_workflowId: data.ref?.workflowId ?? undefined,
        FK_executionId: data.ref?.executionId ?? undefined,
        FK_taskId: data.ref?.taskId ?? undefined,
        FK_knowledgeId: data.ref?.knowledgeId ?? undefined,
      },
      select: {
        id: true,
      },
    });
  };

  updateWorkspaceCredits = async (
    args: UpdateWorkspaceCreditsData,
  ): Promise<CreditUsageResponse> => {
    if (this.isBillingEnabled() === false) {
      return;
    }

    const workspaceWithCurrentCredits = await this.prisma.workspace.findUnique({
      where: {
        id: args.workspaceId,
      },
      select: {
        usage: {
          select: {
            allottedCredits: true,
            purchasedCredits: true,
          },
        },
      },
    });

    //Set current credit values
    const allottedCredits =
      workspaceWithCurrentCredits.usage.allottedCredits ?? 0;
    const purchasedCredits =
      workspaceWithCurrentCredits.usage.purchasedCredits ?? 0;

    //Calculate updated credit value
    //Use allotted credits first, then purchased credits
    let newAllottedCredits = allottedCredits;
    let newPurchasedCredits = purchasedCredits;

    if (allottedCredits >= args.creditsUsed) {
      newAllottedCredits = Math.max(0, allottedCredits - args.creditsUsed);
    } else {
      newAllottedCredits = 0;
      newPurchasedCredits = Math.max(
        0,
        purchasedCredits - (args.creditsUsed - allottedCredits),
      );
    }

    await this.prisma.workspace.update({
      where: {
        id: args.workspaceId,
      },
      data: {
        usage: {
          update: {
            allottedCredits: newAllottedCredits,
            purchasedCredits: newPurchasedCredits,
          },
        },
      },
    });

    const creditUsageResponse = {
      originalallottedCredits: allottedCredits,
      originalPurchasedCredits: purchasedCredits,
      originalTotalCredits: allottedCredits + purchasedCredits,
      updatedallottedCredits: newAllottedCredits,
      updatedPurchasedCredits: newPurchasedCredits,
      updatedTotalCredits: newAllottedCredits + newPurchasedCredits,
      creditsUsed: args.creditsUsed,
      creditsUpdatedAt: new Date().toISOString(),
    };

    await this.#createCreditUsageItem(args);

    return creditUsageResponse;
  };

  getWorkspaceTotalCredits = async ({
    workspaceId,
  }: {
    workspaceId: string;
  }) => {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        usage: {
          select: {
            allottedCredits: true,
            purchasedCredits: true,
          },
        },
      },
    });

    return (
      workspace.usage.allottedCredits + workspace.usage.purchasedCredits || 0
    );
  };

  getUsageTypeFromEmbeddingModel = ({
    model,
  }: {
    model: 'text-embedding-ada-002' | 'text-embedding-3-small';
  }): UsageType => {
    if (model === 'text-embedding-3-small') {
      return 'openai-text-embedding-ada-002';
    } else if (model === 'text-embedding-ada-002') {
      return 'openai-text-embedding-ada-002';
    } else {
      throw new Error(
        `Invalid embedding model for billing: ${model}. Add them to the credits.service`,
      );
    }
  };

  isBillingEnabled = () => {
    return (
      ServerConfig.STRIPE_SECRET_KEY != null &&
      ServerConfig.STRIPE_WEBHOOK_SECRET != null
    );
  };

  getMonthlyProatedCreditAllotment = ({ plan }: { plan: BillingPlanType }) => {
    //So we will allot credits based on the number of days left in the current month.

    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    const daysInMonth = lastDayOfMonth.getDate();

    const daysLeftInMonth = daysInMonth - today.getDate();

    return Math.ceil(
      (CREDIT_ALLOTMENT_MAP[plan] / daysInMonth) * daysLeftInMonth,
    );
  };

  async checkCreditBelongsToWorkspaceUser({
    workspaceUserId,
    creditId,
  }: {
    workspaceUserId: string;
    creditId: string;
  }) {
    const belongs = await this.prisma.credit.findFirst({
      where: {
        AND: [
          {
            id: creditId,
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
    });

    return !!belongs;
  }

  async checkCreditBelongsToWorkspace({
    workspaceId,
    creditId: creditIt,
  }: {
    workspaceId: string;
    creditId: string;
  }) {
    const belongs = await this.prisma.credit.findFirst({
      where: {
        AND: [
          {
            id: creditIt,
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
}

type UpdateWorkspaceCreditsData = {
  workspaceId: string;
  projectId: string | undefined;
  creditsUsed: number;
  data: {
    ref:
      | {
          workflowId?: string;
          executionId?: string;
          agentId?: string;
          taskId?: string;
          knowledgeId?: string;
        }
      | undefined;
    details: Record<string, any>;
  };
};

type UsageType =
  | 'serper'
  | 'extract-dynamic-website-content'
  | 'extract-static-website-content'
  | 'vapi'
  | 'openai-text-embedding-ada-002'
  | 'workflow-execution'
  | 'ollama';

type UsageTypeData =
  | TokenConversionData
  | SerperConversionData
  | UsdConversionData
  | EmbeddingChunkData
  | ExecutionData;
/**
 * Used for models that use input and output tokens.
 */
type TokenConversionData = {
  inputTokens: number;
  outputTokens: number;
};

/**
 * Used for Serper's API that returns credits used.
 */
type SerperConversionData = {
  credits: number;
};

/**
 * Used for data that is in USD.
 */
type UsdConversionData = {
  cost: number;
};

/**
 * Embedding model data (in chunks).
 * We don't charge for the tokens, we charge for the chunks at a different rate.
 */
type EmbeddingChunkData = {
  numEmbeddings: number;
};

/**
 * Workflow execution data
 */
type ExecutionData = {
  executionId: string;
};

//Used when the usage type is in USD.
const USD_DOLLAR_CONVERSION_RATE = 100;

//Conversion rate for each usage type.
//We'll divide the values by the conversion rate to get the credits.
const CONVERSION_RATE_MAP: Record<
  UsageType,
  {
    conversion?: any;
    inverseConversion?: any;
    minimumRequired: number;
  }
> = {
  ollama: {
    minimumRequired: 0,
    inverseConversion: {
      input: 0,
      output: 0,
    },
  },
  serper: {
    conversion: {
      credit: 1,
    },
    minimumRequired: 1,
  },
  'extract-dynamic-website-content': {
    conversion: {
      cost: USD_DOLLAR_CONVERSION_RATE,
    },
    minimumRequired: 2,
  },
  'extract-static-website-content': {
    conversion: {
      cost: USD_DOLLAR_CONVERSION_RATE,
    },
    minimumRequired: 1,
  },
  vapi: {
    conversion: {
      cost: USD_DOLLAR_CONVERSION_RATE,
    },
    minimumRequired: 5,
  },
  'openai-text-embedding-ada-002': {
    conversion: {
      embedRate: 0.1,
    },
    minimumRequired: 1,
  },
  'workflow-execution': {
    minimumRequired: 1,
  },
};

/**
 * This is how much we allot each day
 */
export const CREDIT_ALLOTMENT_MAP: Record<BillingPlanType, number> = {
  free: 250,
  professional: 1_500,
  business: 10_000,
  team: 5_000,
  custom: 0,
};

export type CreditUsageResponse = {
  originalallottedCredits: number;
  originalPurchasedCredits: number;
  originalTotalCredits: number;
  updatedallottedCredits: number;
  updatedPurchasedCredits: number;
  updatedTotalCredits: number;
  creditsUsed: number;
  creditsUpdatedAt: string;
};
