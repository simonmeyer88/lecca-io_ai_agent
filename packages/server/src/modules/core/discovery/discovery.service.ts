import { Injectable } from '@nestjs/common';

import { ServerConfig } from '../../../config/server.config';
import {
  AiProviderService,
  AiProviders,
} from '../../global/ai-provider/ai-provider.service';
import { PrismaService } from '../../global/prisma/prisma.service';

@Injectable()
export class DiscoveryService {
  constructor(
    private prismaService: PrismaService,
    private aiProvider: AiProviderService,
  ) {
    //This is to use the Knowledge feature of the platform.
    //Includes embedding text, uploading embeddings to Pinecone, and uploading files to S3.
    const KNOWLEDGE =
      ServerConfig.S3_ACCESS_KEY_ID != null &&
      ServerConfig.S3_SECRET_ACCESS_KEY != null &&
      ServerConfig.S3_REGION != null &&
      ServerConfig.S3_BUCKET_ID != null &&
      ServerConfig.PINECONE_API_KEY != null &&
      ServerConfig.OPENAI_API_KEY != null;

    //This is for the Email feature of the platform.
    const EMAILS =
      ServerConfig.MAIL_OPTIONS != null &&
      ServerConfig.MAIL_OPTIONS.MAIL_CLIENT_ID != null &&
      ServerConfig.MAIL_OPTIONS.MAIL_CLIENT_SECRET != null &&
      ServerConfig.MAIL_OPTIONS.MAIL_REFRESH_TOKEN != null &&
      ServerConfig.MAIL_OPTIONS.MAIL_FROM_EMAIL_ADDRESS != null &&
      ServerConfig.MAIL_OPTIONS.MAIL_FROM_NAME != null;

    //This is for the Google Search feature of the platform. We use SerperAPI.
    const WEB_SEARCH = ServerConfig.SERPER_API_KEY != null;

    //This is for the Web Extraction feature of the platform. We use Apify.
    const WEB_EXTRACTION_DYNAMIC =
      ServerConfig.APIFY_API_KEY != null &&
      ServerConfig.APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID != null;

    const WEB_EXTRACTION_STATIC =
      ServerConfig.APIFY_API_KEY != null &&
      ServerConfig.APIFY_EXTRACT_STATIC_CONTENT_TASK_ID != null;

    //This is for the Calling feature of the platform. We use VAPI.
    const CALLING = ServerConfig.VAPI_API_KEY != null;

    //This is for the Billing feature of the platform. We use Stripe.
    const BILLING =
      ServerConfig.STRIPE_SECRET_KEY != null &&
      ServerConfig.STRIPE_WEBHOOK_SECRET != null;

    //This is for the Workflows feature of the platform.
    const WORKFLOWS = true;

    //This is for the Agents feature of the platform.
    const AGENTS = Object.keys(aiProvider.providers).length > 0;

    //This is for the Variables feature of the platform.
    const VARIABLES = true;

    //This is for the Connections feature of the platform.
    const CONNECTIONS = true;

    //This is to enable the teams page.
    const TEAMS = !!ServerConfig.COMMERCIAL_KEY;

    this.#defaultFeatures = {
      WORKFLOWS,
      AGENTS,
      VARIABLES,
      CONNECTIONS,
      KNOWLEDGE,
      EMAILS,
      CALLING,
      WEB_SEARCH,
      WEB_EXTRACTION_DYNAMIC,
      WEB_EXTRACTION_STATIC,
      BILLING,
      TEAMS,
      AI: this.aiProvider.providers,
    };

    this.#logDisabledFeatures();
  }

  #defaultFeatures: Features;

  async getEnabledWorkspaceFeatures({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<Features> {
    const workspaceWithDisabledFeatures =
      await this.prismaService.workspacePreferences.findUnique({
        where: {
          FK_workspaceId: workspaceId,
        },
        select: {
          disabledFeatures: true,
        },
      });

    const disabledFeatures =
      (workspaceWithDisabledFeatures.disabledFeatures as DisableableFeatures[]) ??
      [];

    const features: Features = {
      ...this.#defaultFeatures,
      VARIABLES:
        this.#defaultFeatures.VARIABLES &&
        !disabledFeatures.includes('variable'),
      CONNECTIONS:
        this.#defaultFeatures.CONNECTIONS &&
        !disabledFeatures.includes('connection'),
      KNOWLEDGE:
        this.#defaultFeatures.KNOWLEDGE &&
        !disabledFeatures.includes('knowledge'),
      WORKFLOWS:
        this.#defaultFeatures.WORKFLOWS &&
        !disabledFeatures.includes('workflow'),
      AGENTS:
        this.#defaultFeatures.AGENTS && !disabledFeatures.includes('agent'),
    };

    return features;
  }

  #logDisabledFeatures() {
    Object.entries(this.#defaultFeatures).forEach(([feature, enabled]) => {
      const skipLog = feature === 'BILLING';

      if (!skipLog) {
        if (enabled) {
          console.info(`Enabled feature: ${feature}`);
        } else {
          let reason = '';
          switch (feature as keyof Features) {
            case 'AGENTS':
              reason = 'OPENAI_API_Key or ANTHROPIC_API_KEY must be set';
              break;
            case 'KNOWLEDGE':
              reason =
                'Missing S3 or Pinecone configuration or OPENAI_API_KEY not set';
              break;
            case 'BILLING': {
              break;
            }
            case 'CALLING':
              reason = 'VAPI_API_KEY not set';
              break;
            case 'EMAILS':
              reason = 'Missing MAIL configuration';
              break;
            case 'CONNECTIONS':
              reason = 'Always enabled';
              break;
            case 'VARIABLES':
              reason = 'Always enabled';
              break;
            case 'WEB_EXTRACTION_DYNAMIC':
              reason = 'APIFY_API_KEY not set';
              break;
            case 'WEB_EXTRACTION_STATIC':
              reason = 'APIFY_API_KEY not set';
              break;
            case 'WEB_SEARCH':
              reason = 'SERPER_API_KEY not set';
              break;
            case 'WORKFLOWS':
              reason = 'Always enabled';
              break;
            case 'TEAMS':
              reason = 'Commercial Key required';
              break;
            default:
              reason =
                'Unknown feature. Need to update #logDisabledFeatures in discovery.service.ts';
          }
          console.warn(`Disabled feature: ${feature} - ${reason}`);
        }
      }
    });
  }
}

type DisableableFeatures =
  | 'workflow'
  | 'agent'
  | 'connection'
  | 'knowledge'
  | 'variable';

type Features = {
  WORKFLOWS: boolean;
  AGENTS: boolean;
  CONNECTIONS: boolean;
  VARIABLES: boolean;
  KNOWLEDGE: boolean;
  EMAILS: boolean;
  WEB_SEARCH: boolean;
  WEB_EXTRACTION_DYNAMIC: boolean;
  WEB_EXTRACTION_STATIC: boolean;
  CALLING: boolean;
  BILLING: boolean;
  TEAMS: boolean;
  AI: AiProviders;
};
