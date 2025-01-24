import {
  createAction,
  createJsonInputField,
  createMultiSelectInputField,
  createNumberInputField,
  createSelectInputField,
  createTextInputField,
  jsonParse,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const scrape = createAction({
  id: 'firecrawl_action_scrape',
  name: 'Scrape',
  description: 'Scrape a URL and get its contents',
  inputConfig: [
    createTextInputField({
      id: 'url',
      label: 'URL',
      description: 'URL to scrape',
      placeholder: 'https://example.com',
      required: {
        missingMessage: 'URL is required',
        missingStatus: 'warning',
      },
    }),
    createMultiSelectInputField({
      id: 'formats',
      label: 'Output Formats',
      description: 'Cannot have both screenshot and screenshot@fullPage',
      selectOptions: [
        {
          label: 'Markdown',
          value: 'markdown',
        },
        {
          label: 'HTML',
          value: 'html',
        },
        {
          label: 'Raw HTML',
          value: 'rawHtml',
        },
        {
          label: 'Links',
          value: 'links',
        },
        {
          label: 'Screenshot',
          value: 'screenshot',
        },
        {
          label: 'Fullpage Screenshot',
          value: 'screenshot@fullPage',
        },
        {
          label: 'JSON',
          value: 'json',
        },
      ],
      required: {
        missingMessage: 'Output formats are required',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'waitFor',
      label: 'Wait For',
      description: 'Number of milliseconds to wait before scraping the page',
      placeholder: 'Wait milliseconds (optional)',
    }),
    createSelectInputField({
      id: 'onlyMainContent',
      label: 'Only Main Content',
      description:
        'Only return the main content of the page (no headers, footers, etc.)',
      selectOptions: [
        {
          label: 'Yes',
          value: 'true',
        },
        {
          label: 'No',
          value: 'false',
        },
      ],
      defaultValue: 'false',
    }),
    createTextInputField({
      id: 'excludeTags',
      occurenceType: 'multiple',
      label: 'Exclude Tags',
      description: 'Tags to exclude from the output',
      placeholder: 'Add tags to exclude (optional)',
    }),
    createJsonInputField({
      id: 'headers',
      label: 'Headers',
      description: 'Headers to send with the request',
      placeholder: 'Add headers (optional)',
    }),
    createSelectInputField({
      id: 'removeBase64Images',
      label: 'Remove Base64 Images',
      description:
        'Removes all base 64 images from the output, which may be overwhelmingly long.',
      selectOptions: [
        {
          label: 'Yes',
          value: 'true',
        },
        {
          label: 'No',
          value: 'false',
        },
      ],
      defaultValue: 'true',
    }),
  ],
  aiSchema: z.object({
    url: z.string().describe('URL to scrape'),
    formats: z
      .array(
        z.enum([
          'markdown',
          'html',
          'rawHtml',
          'links',
          'screenshot',
          'screenshot@fullPage',
          'json',
        ]),
      )
      .describe(
        'Output formats. Cannot have both screenshot and screenshot@fullPage',
      ),
    waitFor: z
      .number()
      .optional()
      .nullable()
      .describe('Number of milliseconds to wait before scraping the page'),
    onlyMainContent: z
      .enum(['true', 'false'])
      .optional()
      .nullable()
      .default('false')
      .describe(
        'Only return the main content of the page (no headers, footers, etc.)',
      ),
    excludeTags: z
      .array(z.string())
      .optional()
      .nullable()
      .describe('Tags to exclude from the output'),
    headers: z
      .record(z.string())
      .optional()
      .nullable()
      .describe('Headers to send with the request'),
    removeBase64Images: z
      .enum(['true', 'false'])
      .optional()
      .nullable()
      .default('true')
      .describe(
        'Remove base64 images. Try to always set to true to prevent too much context.',
      ),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const {
      url,
      formats,
      waitFor,
      onlyMainContent,
      excludeTags,
      headers: rawHeaders,
      removeBase64Images,
    } = configValue;

    let headers = rawHeaders;
    if (typeof rawHeaders === 'string') {
      headers = jsonParse(rawHeaders);
    }

    const data = {
      url,
      formats,
      waitFor: waitFor ? Number(waitFor) : undefined,
      onlyMainContent: onlyMainContent === 'true',
      excludeTags,
      headers,
      removeBase64Images: removeBase64Images !== 'false',
    };

    const response = await http.request({
      url: 'https://api.firecrawl.dev/v1/scrape',
      method: 'POST',
      workspaceId,
      headers: {
        Authorization: `Bearer ${connection.apiKey}`,
      },
      data,
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      success: true,
      data: {
        markdown:
          'Markdown content of the website. This is a sample markdown content.',
        html: '<h1>HTML content of the website</h1>',
        metadata: {
          title: 'Website Title',
          description:
            'Website description. This is a sample website description.',
          language: 'en',
          keywords: 'Firecrawl,Markdown,Data,Mendable,Langchain',
          robots: 'follow, index',
          ogTitle: 'Firecrawl',
          ogDescription: 'Turn any website into LLM-ready data.',
          ogUrl: 'https://www.firecrawl.dev/',
          ogImage: 'https://www.firecrawl.dev/og.png?123',
          ogLocaleAlternate: [],
          ogSiteName: 'Firecrawl',
          sourceURL: 'https://firecrawl.dev',
          statusCode: 200,
        },
      },
    };
  },
});
