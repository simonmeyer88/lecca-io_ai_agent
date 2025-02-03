import { createAction } from '@lecca-io/toolkit';
import {
  createFileInputField,
  createSelectInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/linkedin.shared';

export const createOrganizationImagePost = createAction({
  id: 'linkedin_action_create-organization-image-post',
  name: 'Create an Organization Image Post',
  description: 'Create an image post on behalf of an organization.',
  aiSchema: z.object({
    organizationId: z
      .string()
      .describe('The organization ID to post on behalf of.'),
    commentary: z.string().describe('The text content of the LinkedIn post'),
    imageUrl: z.string().describe('The URL of the image to post'),
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
      label: 'Text Content',
      id: 'commentary',
      placeholder: 'Add content',
      description: '',
    }),
    createFileInputField({
      label: 'Image',
      id: 'imageUrl',
      description: 'Add an image to the post',
      required: {
        missingMessage: 'Image is required',
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
  run: async ({ configValue, connection, workspaceId, http, fileHandler }) => {
    const url = 'https://api.linkedin.com/rest/posts';

    const {
      organizationId,
      canReshare,
      commentary,
      imageUrl,
      lifecycleState,
      feedDistribution,
      visibility,
    } = configValue;

    if (!imageUrl) {
      throw new Error('Image is required');
    }

    const urn = `organization:${organizationId}`;

    const imageId = await shared.uploadMediaImage({
      accessToken: connection.accessToken,
      mediaUrl: imageUrl,
      urn,
      workspaceId,
      fileHandler,
      http,
    });

    const postBody = {
      author: `urn:li:${urn}`,
      commentary,
      lifecycleState,
      isReshareDisabledByAuthor: canReshare === 'false',
      visibility,
      distribution: {
        feedDistribution,
      },
      content: {
        media: {
          id: imageId,
        },
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
