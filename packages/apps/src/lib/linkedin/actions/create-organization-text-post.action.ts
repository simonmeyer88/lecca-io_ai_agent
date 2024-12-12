import {
  createAction,
  createSelectInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/linkedin.shared';

export const createOrganizationTextPost = createAction({
  id: 'linkedin_action_create-organization-text-post',
  name: 'Create an Organization Text Post',
  description: 'Create a text post on behalf of an organization.',
  aiSchema: z.object({
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
  }),

  inputConfig: [
    shared.fields.dynamicSelectOrganization,
    createTextInputField({
      id: 'commentary',
      label: 'Text Content',
      description: 'The text content of the LinkedIn post',
      placeholder: 'Add content',
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    }),
    createSelectInputField({
      id: 'visibility',
      label: 'Visibility',
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
    }),
    createSelectInputField({
      id: 'feedDistribution',
      label: 'Feed Distribution',
      selectOptions: [
        { label: 'Main Feed', value: 'MAIN_FEED' },
        { label: 'Not Distributed via Feed', value: 'NONE' },
      ],
      defaultValue: 'MAIN_FEED',
      description:
        'Whether to share post on main feed or to post but not distribute. Will always be Main Feed if visibility is Public',
    }),
    createSwitchInputField({
      id: 'lifecycleState',
      label: 'Create as Draft',
      switchOptions: {
        checked: 'DRAFT',
        unchecked: 'PUBLISHED',
        defaultChecked: false,
      },
      description:
        'Whether to create the post as a draft or publish it immediately',
    }),
    createSwitchInputField({
      id: 'canReshare',
      label: 'Can Reshare',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: true,
      },
      description:
        'Whether the author allows others to reshare the post or not',
    }),
  ],

  run: async ({ configValue, connection, workspaceId, http }) => {
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
        feedDistribution,
      },
    };

    if (visibility === 'PUBLIC') {
      postBody.distribution.feedDistribution = 'MAIN_FEED';
    }

    await http.request({
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
  },

  mockRun: async () => {
    return {
      postCreated: true,
    };
  },
});
