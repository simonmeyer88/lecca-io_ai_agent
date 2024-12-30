import {
  InjectedServices,
  createDynamicSelectInputField,
} from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectAiProvider: createDynamicSelectInputField({
      label: 'AI Provider',
      id: 'provider',
      placeholder: 'Select provider',
      hideCustomTab: true,
      _getDynamicValues: async ({ aiProviders }) => {
        return Object.keys(aiProviders.providers).map((provider) => ({
          value: provider,
          label: provider,
        }));
      },
      description: 'The AI provider to use for generating responses.',
      required: {
        missingMessage: 'Provider is required',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectLlmModel: createDynamicSelectInputField({
      label: 'Model',
      id: 'model',
      placeholder: 'Select model',
      hideCustomTab: true,
      loadOptions: {
        forceRefresh: true,
        dependsOn: ['provider'],
      },
      description: 'The model to use for generating responses.',
      _getDynamicValues: async ({ extraOptions, aiProviders }) => {
        const { provider } = extraOptions;
        if (!provider) {
          throw new Error('Provider is required before selecting a model');
        }

        const models = aiProviders.providers[provider].languageModels ?? {};

        return Object.keys(models).map((model) => ({
          value: model,
          label: model,
        }));
      },
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectLlmConnection: createDynamicSelectInputField({
      label: 'API Key',
      id: '__internal__llmConnectionId',
      placeholder: 'Select connection',
      loadOptions: {
        forceRefresh: true,
        dependsOn: ['provider'],
      },
      hideCustomTab: true,
      description:
        'Use your own connection credentials for this AI Provider. Select "Use Platform" to use the platform credits.',
      selectOptions: [
        {
          value: 'credits',
          label: 'Use Platform Credits',
        },
      ],
      _getDynamicValues: async ({
        projectId,
        workspaceId,
        extraOptions,
        prisma,
        aiProviders,
      }) => {
        const { provider } = extraOptions;
        const appConnectionId =
          aiProviders.providers[provider]?.appConnectionId;

        const connections = await prisma.connection.findMany({
          where: {
            AND: [
              {
                FK_workspaceId: workspaceId,
              },
              {
                connectionId: appConnectionId,
              },
              {
                OR: [
                  {
                    FK_projectId: projectId,
                  },
                  {
                    FK_projectId: null,
                  },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
          },
        });

        return connections.map((c) => ({
          label: c.name,
          value: c.id,
        }));
      },
      required: {
        missingMessage: 'Agent is required',
        missingStatus: 'warning',
      },
    }),
  },
  getAiProviderClient: async ({
    workspaceId,
    projectId,
    provider,
    model,
    connectionId,
    prisma,
    aiProviders,
  }: {
    workspaceId: string;
    projectId: string;
    provider: string;
    model: string;
    connectionId: string | undefined;
    prisma: InjectedServices['prisma'];
    aiProviders: InjectedServices['aiProviders'];
  }): Promise<{
    aiProviderClient: any;
    isUsingWorkspaceLlmConnection: boolean;
  }> => {
    let llmConnection:
      | { id: string; apiKey: string; connectionId: string }
      | undefined;

    if (connectionId && connectionId !== 'credits') {
      const projectHasAccessToConnection = await prisma.connection.findFirst({
        where: {
          AND: [
            {
              FK_workspaceId: workspaceId,
            },
            {
              id: connectionId,
            },
            {
              OR: [
                {
                  FK_projectId: projectId,
                },
                {
                  FK_projectId: null,
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          connectionId: true,
        },
      });

      if (!projectHasAccessToConnection) {
        throw new Error('Project does not have access to the connection');
      }

      const appConnectionId = aiProviders.providers[provider]?.appConnectionId;

      if (projectHasAccessToConnection.connectionId !== appConnectionId) {
        throw new Error('Connection is not the correct AI Provider type');
      }

      llmConnection = await prisma.connection.findUnique({
        where: {
          id: connectionId,
        },
        select: {
          id: true,
          apiKey: true,
          connectionId: true,
        },
      });
    }

    const aiProviderClient = aiProviders.getAiLlmProviderClient({
      aiProvider: provider,
      llmConnection,
      llmModel: model,
      workspaceId,
    });

    return {
      aiProviderClient: aiProviderClient,
      isUsingWorkspaceLlmConnection: !!llmConnection,
    };
  },
  languages: [
    { value: 'Albanian', label: 'Albanian' },
    { value: 'Amharic', label: 'Amharic' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Armenian', label: 'Armenian' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Bosnian', label: 'Bosnian' },
    { value: 'Bulgarian', label: 'Bulgarian' },
    { value: 'Burmese', label: 'Burmese' },
    { value: 'Catalan', label: 'Catalan' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Croatian', label: 'Croatian' },
    { value: 'Czech', label: 'Czech' },
    { value: 'Danish', label: 'Danish' },
    { value: 'Dutch', label: 'Dutch' },
    { value: 'Estonian', label: 'Estonian' },
    { value: 'Finnish', label: 'Finnish' },
    { value: 'French', label: 'French' },
    { value: 'Georgian', label: 'Georgian' },
    { value: 'German', label: 'German' },
    { value: 'Greek', label: 'Greek' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Hungarian', label: 'Hungarian' },
    { value: 'Icelandic', label: 'Icelandic' },
    { value: 'Indonesian', label: 'Indonesian' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Kazakh', label: 'Kazakh' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Latvian', label: 'Latvian' },
    { value: 'Lithuanian', label: 'Lithuanian' },
    { value: 'Macedonian', label: 'Macedonian' },
    { value: 'Malay', label: 'Malay' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Mongolian', label: 'Mongolian' },
    { value: 'Norwegian', label: 'Norwegian' },
    { value: 'Persian', label: 'Persian' },
    { value: 'Polish', label: 'Polish' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Romanian', label: 'Romanian' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Serbian', label: 'Serbian' },
    { value: 'Slovak', label: 'Slovak' },
    { value: 'Slovenian', label: 'Slovenian' },
    { value: 'Somali', label: 'Somali' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Swahili', label: 'Swahili' },
    { value: 'Swedish', label: 'Swedish' },
    { value: 'Tagalog', label: 'Tagalog' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Thai', label: 'Thai' },
    { value: 'Turkish', label: 'Turkish' },
    { value: 'Ukrainian', label: 'Ukrainian' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Vietnamese', label: 'Vietnamese' },
  ],
};
