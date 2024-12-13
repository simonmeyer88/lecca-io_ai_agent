import { createAction, filterPathsByConditions } from '@lecca-io/toolkit';
import { z } from 'zod';

export const conditionalPaths = createAction({
  id: 'flow-control_action_conditional-paths',
  name: 'Conditional Paths',
  description: 'Create conditions to determine the path(s) to take.',
  availableForAgent: false,
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/actions/flow-control_action_conditional-paths.svg`,
  inputConfig: [
    {
      id: 'conditionalPathsLeccaFilters',
      label: 'Configure Paths',
      description:
        'Connect actions to this node to configure your conditional paths.',
      inputType: 'conditional-paths',
    },
  ],
  aiSchema: z.object({}),
  run: async ({ configValue }) => {
    //AI can't run this action, so we must define the configValue type
    const { conditionalPathsLeccaFilters } = configValue as {
      conditionalPathsLeccaFilters: any;
    };

    if (!conditionalPathsLeccaFilters) {
      throw new Error('No conditional paths found');
    }

    const pathsToTake = filterPathsByConditions({
      conditionalPathFilters: conditionalPathsLeccaFilters,
    });

    return { pathsToTake };
  },

  mockRun: async () => {
    return {
      pathsToTake: ['path-1', 'path-3'],
    };
  },
});
