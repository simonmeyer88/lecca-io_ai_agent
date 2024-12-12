import {
  createAction,
  createFileInputField,
  createSelectInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/linkedin.shared';

export const createImagePost = createAction({
  id: 'linkedin_action_create-image-post',
  name: 'Create Image Post',
  description: 'Create an image post on LinkedIn.',
  inputConfig: [
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
    createFileInputField({
      id: 'imageUrl',
      label: 'Image',
      description: 'Add an image to the post',
      required: {
        missingMessage: 'Image is required',
        missingStatus: 'warning',
      },
    }),
    createSelectInputField({
      id: 'visibility',
      label: 'Visibility',
      description: 'Who can see this post',
      selectOptions: [
        { label: 'Public', value: 'PUBLIC' },
        { label: 'Only My Connections', value: 'CONNECTIONS' },
        { label: 'Logged in members only', value: 'LOGGED_IN' },
      ],
      placeholder: 'Select visibility',
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
      description:
        'Whether to create the post as a draft or publish it immediately',
      switchOptions: {
        checked: 'DRAFT',
        unchecked: 'PUBLISHED',
        defaultChecked: false,
      },
    }),
    createSwitchInputField({
      id: 'canReshare',
      label: 'Can Reshare',
      description:
        'Whether the author allows others to reshare the post or not',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: true,
      },
    }),
  ],
  aiSchema: z.object({
    commentary: z
      .string()
      .min(1)
      .describe('The text content of the LinkedIn post'),
    imageUrl: z.string().min(1).describe('The URL of the image to post'),
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
  run: async ({ configValue, connection, workspaceId, http, fileHandler }) => {
    const url = 'https://api.linkedin.com/rest/posts';

    const personId = await shared.getPersonId({
      accessToken: connection.accessToken,
      workspaceId,
      http,
    });

    const {
      canReshare,
      commentary,
      imageUrl,
      lifecycleState,
      feedDistribution,
      visibility,
    } = configValue;

    const urn = `person:${personId}`;

    if (!imageUrl) {
      throw new Error('Image is required');
    }

    const imageId = await shared.uploadMediaImage({
      accessToken: connection.accessToken,
      mediaUrl: imageUrl,
      urn,
      workspaceId,
      http,
      fileHandler,
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
