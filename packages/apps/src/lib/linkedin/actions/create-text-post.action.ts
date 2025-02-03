import { createAction } from '@lecca-io/toolkit';
import {
  createSelectInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/linkedin.shared';

export const createTextPost = createAction({
  id: 'linkedin_action_create-text-post',
  name: 'Create Text Post',
  description: 'Create a text post on LinkedIn.',
  aiSchema: z.object({
    commentary: z.string().describe('The text content of the LinkedIn post'),
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
    createTextInputField({
      label: 'Text Content',
      id: 'commentary',
      placeholder: 'Add content',
      description: '',
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    }),

    createSelectInputField({
      label: 'Visibility',
      id: 'visibility',
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
      label: 'Feed Distribution',
      id: 'feedDistribution',
      selectOptions: [
        { label: 'Main Feed', value: 'MAIN_FEED' },
        { label: 'Not Distributed via Feed', value: 'NONE' },
      ],
      defaultValue: 'MAIN_FEED',
      description:
        'Whether to share post on main feed or to post but not distribute. Will always be Main Feed if visibility is Public',
    }),

    createSwitchInputField({
      label: 'Create as Draft',
      id: 'lifecycleState',
      switchOptions: {
        checked: 'DRAFT',
        unchecked: 'PUBLISHED',
        defaultChecked: false,
      },
      description:
        'Whether to create the post as a draft or publish it immediately',
    }),

    createSwitchInputField({
      label: 'Can Reshare',
      id: 'canReshare',
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

    const personId = await shared.getPersonId({
      accessToken: connection.accessToken,
      workspaceId,
      http,
    });

    const {
      canReshare,
      commentary,
      lifecycleState,
      feedDistribution,
      visibility,
    } = configValue;

    const postBody = {
      author: `urn:li:person:${personId}`,
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
