import { createAction } from '../action';
import {
  createApiKeyConnection,
  createBasicAuthConnection,
  createKeyPairConnection,
  createOAuth2Connection,
} from '../connection';

export function createApp(args: CreateAppArgs) {
  return args;
}

export type CreateAppArgs = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  isPublished?: boolean;
  availableForAgent?: boolean;
  actions: ReturnType<typeof createAction>[];
  triggers: any;
  connections: (
    | ReturnType<typeof createApiKeyConnection>
    | ReturnType<typeof createBasicAuthConnection>
    | ReturnType<typeof createOAuth2Connection>
    | ReturnType<typeof createKeyPairConnection>
  )[];
  verifyWebhookRequest?: (
    args: VerifyWebhookRequestArgs,
  ) => VerifyWebhookRequestResponse;
  parseWebhookEventType?: (
    args: ParseWebhookEventTypeArgs,
  ) => ParseWebhookEventTypeResponse;
};

export type VerifyWebhookRequestArgs = {
  webhookBody: unknown;
  webhookHeaders: Record<string, string>;
};
export type VerifyWebhookRequestResponse = boolean;

export type ParseWebhookEventTypeArgs = {
  webhookBody: unknown;
};
export type ParseWebhookEventTypeResponse = {
  event: unknown;
};
