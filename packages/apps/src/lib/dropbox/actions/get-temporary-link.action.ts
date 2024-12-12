import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getTemporaryLink = createAction({
  id: 'dropbox_action_get-temporary-link',
  name: 'Get Temporary Link',
  description: 'Retrieves a temporary link to a Dropbox file',
  inputConfig: [
    createTextInputField({
      id: 'path',
      label: 'File Path',
      description: 'The path to the file in your Dropbox',
      placeholder: '/path/to/file',
      required: {
        missingMessage: 'File path is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    path: z.string().min(1).describe('The path of the file in Dropbox'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://api.dropboxapi.com/2/files/get_temporary_link';

    const body = {
      path: configValue.path,
    };

    const result = await http.request({
      method: 'POST',
      url,
      data: body,
      headers: {
        Authorization: `Bearer ${connection?.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data?.link) {
      return result.data;
    } else {
      throw new Error(
        `Failed to get temporary link: ${result.data?.error_summary}`,
      );
    }
  },
  mockRun: async () => {
    return {
      link: 'https://www.dropbox.com/s/abc123/temporary-link?dl=0',
      metadata: {
        name: 'file_name.txt',
        path_lower: '/path/to/file_name.txt',
        path_display: '/path/to/file_name.txt',
        id: 'id:abc123',
      },
    };
  },
});
