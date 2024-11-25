import { z } from 'zod';

import { AiProviders } from './ai-provider-model';

export const featuresSchema = z.object({
  KNOWLEDGE: z.boolean(),
  EMAILS: z.boolean(),
  WEB_SEARCH: z.boolean(),
  WEB_EXTRACTION_DYNAMIC: z.boolean(),
  WEB_EXTRACTION_STATIC: z.boolean(),
  CALLING: z.boolean(),
  BILLING: z.boolean(),
  WORKFLOWS: z.boolean(),
  AGENTS: z.boolean(),
  VARIABLES: z.boolean(),
  CONNECTIONS: z.boolean(),
  TEAMS: z.boolean(),
});

export type Features = z.infer<typeof featuresSchema> & {
  AI: AiProviders;
};

export const defaultEnabledFeatures: Features = {
  KNOWLEDGE: false,
  EMAILS: false,
  WEB_SEARCH: false,
  WEB_EXTRACTION_DYNAMIC: false,
  WEB_EXTRACTION_STATIC: false,
  CALLING: false,
  BILLING: false,
  WORKFLOWS: false,
  AGENTS: false,
  VARIABLES: false,
  CONNECTIONS: false,
  TEAMS: false,
  AI: {},
};
