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
  /**
   * The unique id of the app in kebab-case.
   */
  id: string;

  /**
   * The name of the app.
   */
  name: string;

  /**
   * A short description of the app.
   */
  description: string;

  /**
   * The logo URL of the app.
   */
  logoUrl: string;

  /**
   * If true, the app will be available for users to use.
   *
   * default: `true`
   */
  isPublished?: boolean;

  /**
   * If the app is available for agents to use.
   *
   * default: `true`
   */
  availableForAgent?: boolean;

  /**
   * The actions that the app supports.
   */
  actions: ReturnType<typeof createAction>[];

  /**
   * The triggers that the app supports.
   */
  triggers: any;

  /**
   * The authentication methods that the app supports.
   */
  connections: (
    | ReturnType<typeof createApiKeyConnection>
    | ReturnType<typeof createBasicAuthConnection>
    | ReturnType<typeof createOAuth2Connection>
    | ReturnType<typeof createKeyPairConnection>
  )[];

  /**
   * Verify the webhook request to ensure it is coming from the correct source.
   *
   * To learn more go to https://www.lecca.io/docs/development/tools/triggers/webhook-strategy/create-webhook-trigger
   */
  verifyWebhookRequest?: (
    args: VerifyWebhookRequestArgs,
  ) => VerifyWebhookRequestResponse;

  /**
   * Parse the webhook event type from the webhook body.
   * This is only used if the app has a trigger that listens for webhooks.
   *
   * To learn more go to https://www.lecca.io/docs/development/tools/triggers/webhook-strategy/create-webhook-trigger
   */
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
