import {
  createAction,
  createNumberInputField,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/anchor-browser.shared';

export const screenshotWebpage = createAction({
  id: 'anchor-browser_action_screenshot-webpage',
  name: 'Screenshot Webpage',
  description: 'Take a screenshot of a webpage',
  inputConfig: [
    createTextInputField({
      id: 'url',
      label: 'URL',
      description: 'URL of the webpage to screenshot',
      placeholder: 'https://example.com',
      required: {
        missingMessage: 'URL is required',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'image_quality',
      label: 'Image Quality',
      description: 'Quality of the image between 0 and 100',
      placeholder: 'Defaults to 100',
    }),
    createNumberInputField({
      id: 'wait',
      label: 'Wait',
      description:
        'Time to wait after the page has loaded before taking the screenshot in milliseconds',
      placeholder: 'Defaults to 0',
    }),
    createNumberInputField({
      id: 'height',
      label: 'Height',
      description: 'Height of the browser viewport in pixels',
      placeholder: 'Defaults to 720',
    }),
    createNumberInputField({
      id: 'width',
      label: 'Width',
      description: 'Width of the browser viewport in pixels',
      placeholder: 'Defaults to 1280',
    }),
    createSelectInputField({
      id: 'capture_full_height',
      label: 'Capture Full Height',
      description: 'If true, captures the full height of the webpage',
      selectOptions: [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
      ],
      placeholder: 'Defaults to false',
    }),
    createSelectInputField({
      id: 'scroll_all_content',
      label: 'Scroll All Content',
      description: 'If true, scrolls the page and captures all visible content',
      selectOptions: [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
      ],
      placeholder: 'Defaults to false',
    }),
    shared.fields.sessionId,
  ],
  aiSchema: z.object({
    url: z.string().describe('URL of the webpage to screenshot'),
    image_quality: z
      .number()
      .describe('Quality of the image between 0 and 100')
      .optional()
      .nullable(),
    wait: z
      .number()
      .describe(
        'Time to wait after the page has loaded before taking the screenshot in milliseconds',
      )
      .optional()
      .nullable(),
    height: z
      .number()
      .describe('Height of the browser viewport in pixels')
      .optional()
      .nullable(),
    width: z
      .number()
      .describe('Width of the browser viewport in pixels')
      .optional()
      .nullable(),
    capture_full_height: z
      .enum(['true', 'false'])
      .describe('If true, captures the full height of the webpage')
      .optional()
      .nullable(),
    scroll_all_content: z
      .enum(['true', 'false'])
      .describe('If true, scrolls the page and captures all visible content')
      .optional()
      .nullable(),
    sessionId: z
      .string()
      .describe('Optional session to reference when performing this action')
      .optional()
      .nullable(),
  }),
  run: async ({ connection, http, workspaceId, s3, configValue }) => {
    const {
      url,
      image_quality,
      wait,
      height,
      width,
      capture_full_height,
      scroll_all_content,
      sessionId,
    } = configValue;

    const data = {
      url,
      image_quality: image_quality ?? undefined,
      wait: wait ?? undefined,
      height: height ?? undefined,
      width: width ?? undefined,
      capture_full_height: capture_full_height === 'true' ? true : false,
      scroll_all_content: scroll_all_content === 'true' ? true : false,
      sessionId: sessionId || undefined,
    };

    const httpUrl = `https://connect.anchorbrowser.io/tools/screenshot?apiKey=${connection?.apiKey}`;

    const response = await http.request({
      method: 'POST',
      url: httpUrl,
      data,
      workspaceId,
    });

    const filePath = `temp/workspaces/${workspaceId}/created-at/${Date.now()}/screenshot.png`;

    let buffer: Buffer;
    if (typeof response.data === 'string') {
      buffer = Buffer.from(response.data, 'base64');
    } else {
      buffer = Buffer.from(response.data);
    }

    await s3.uploadBufferFile({
      buffer: buffer,
      fileName: 'screenshot.png',
      filePath,
    });

    const retrievalUrl = await s3.getSignedRetrievalUrl(filePath, {
      expiresInMinutes: 1440, //24 hours
    });

    return {
      fileUrl: retrievalUrl,
    };
  },
  mockRun: async () => {
    return {
      fileUrl: 'https://example.com/mock-file-url',
    };
  },
});
