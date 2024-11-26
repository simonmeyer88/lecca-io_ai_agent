import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Linkedin } from '../linkedin.app';

export class CreateOrganizationTextPost extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Linkedin;

  id() {
    return 'linkedin_action_create-organization-text-post';
  }

  name() {
    return 'Create an Organization Text Post';
  }

  description() {
    return 'Create a text post on behalf of an organization.';
  }

  aiSchema() {
    return z.object({
      organizationId: z
        .string()
        .min(1)
        .describe('The organization ID to post on behalf of.'),
      commentary: z
        .string()
        .min(1)
        .describe('The text content of the LinkedIn post'),
      visibility: z
        .enum(['PUBLIC', 'CONNECTIONS', 'LOGGED_IN'])
        .describe(
          'Post visibility (Public, Only My Connections, Viewable by logged-in members only)',
        ),
      feedDistribution: z
        .enum(['MAIN_FEED', 'NONE'])
        .nullable()
        .optional()
        .describe('Ignored if visibility is public'),
      lifecycleState: z
        .enum(['PUBLISHED', 'DRAFT'])
        .nullable()
        .optional()
        .describe('Whether to create post as draft or published'),
      canReshare: z.enum(['true', 'false']).describe('Allow others to reshare'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectOrganization(),
      {
        label: 'Text Content',
        id: 'commentary',
        inputType: 'text',
        placeholder: 'Add content',
        description: '',
        required: {
          missingMessage: 'Content is required',
          missingStatus: 'warning',
        },
      },
      {
        label: 'Visibility',
        id: 'visibility',
        inputType: 'select',
        selectOptions: [
          { label: 'Public', value: 'PUBLIC' },
          { label: 'Only My Connections', value: 'CONNECTIONS' },
          { label: 'Logged in members only', value: 'LOGGED_IN' },
        ],
        placeholder: 'Select visibility',
        description: 'Who can see this post',
        required: {
          missingMessage: 'Visibility is required',
          missingStatus: 'warning',
        },
        defaultValue: 'PUBLIC',
      },
      {
        label: 'Feed Distribution',
        id: 'feedDistribution',
        inputType: 'select',
        selectOptions: [
          {
            label: 'Main Feed',
            value: 'MAIN_FEED',
          },
          {
            label: 'Not Distributed via Feed',
            value: 'NONE',
          },
        ],
        defaultValue: 'MAIN_FEED',
        description:
          'Whether to share post on main feed or to post but not distribute. Will always be Main Feed if visibility is Public',
      },
      {
        label: 'Create as Draft',
        id: 'lifecycleState',
        inputType: 'switch',
        switchOptions: {
          checked: 'DRAFT',
          unchecked: 'PUBLISHED',
          defaultChecked: false,
        },
        description:
          'Whether to create the post as a draft or publish it immediately',
      },
      {
        label: 'Can Reshare',
        id: 'canReshare',
        inputType: 'switch',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: true,
        },
        description:
          'Whether the author allows others to reshare the post or not',
      },
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const url = 'https://api.linkedin.com/rest/posts';

    const {
      organizationId,
      canReshare,
      commentary,
      lifecycleState,
      feedDistribution,
      visibility,
    } = configValue;

    const postBody = {
      author: `urn:li:organization:${organizationId}`,
      commentary,
      lifecycleState,
      isReshareDisabledByAuthor: canReshare === 'false',
      visibility,
      distribution: {
        feedDistribution, //MAIN_FEED | NONE
      },
    };

    if (visibility === 'PUBLIC') {
      postBody.distribution.feedDistribution = 'MAIN_FEED';
    }

    await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: postBody,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Linkedin-Version': 202408,
      },
      workspaceId,
    });

    return {
      postCreated: true,
    };
  }

  async mockRun(): Promise<any> {
    return {
      postCreated: true,
    };
  }
}

type ConfigValue = z.infer<ReturnType<CreateOrganizationTextPost['aiSchema']>>;
