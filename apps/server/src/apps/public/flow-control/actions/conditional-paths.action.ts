import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import {
  ConditionalPathFilter,
  filterPathsByConditions,
} from '@/apps/utils/filter-data-by-conditions';
import { ServerConfig } from '@/config/server.config';

import { FlowControl } from '../flow-control.app';

export class ConditionalPaths extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: FlowControl;
  id() {
    return 'flow-control_action_conditional-paths';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Conditional Paths';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id()}.svg`;
  }
  description() {
    return 'Create conditions to determine the path(s) to take.';
  }
  availableForAgent(): boolean {
    return false;
  }

  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'conditionalPathsLeccaFilters',
        label: 'Configure Paths',
        description:
          'Connect actions to this node to configure your conditional paths.',
        inputType: 'conditional-paths',
      },
    ];
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (!configValue.conditionalPathsLeccaFilters) {
      throw new Error('No conditional paths found');
    }

    const pathsToTake = filterPathsByConditions({
      conditionalPathFilters: configValue.conditionalPathsLeccaFilters,
    });

    return { pathsToTake: pathsToTake };
  }

  async mockRun(): Promise<Response> {
    return {
      pathsToTake: ['path-1', 'path-3'],
    };
  }
}

type ConfigValue = z.infer<ReturnType<ConditionalPaths['aiSchema']>> & {
  conditionalPathsLeccaFilters: ConditionalPathFilter[];
};

type Response = {
  /**
   * workflow-runner.service will use this to determine which edge's to add to the execution
   * paths to take is an array of edge ids
   */
  pathsToTake: string[];
};
