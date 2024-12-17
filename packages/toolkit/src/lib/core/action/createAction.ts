import { z } from 'zod';

import { RunActionArgs } from '../../types/action.types';
import { InputConfig } from '../../types/input-config.types';
import { ViewOptions } from '../../types/view-options.types';

export function createAction<T extends z.ZodObject<any, any>>(
  args: CreateActionArgs<T>,
) {
  return args;
}

export type CreateActionArgs<T extends z.ZodObject<any, any>> = {
  /**
   * The unique id of the action.
   *
   * Must follow the format of `<app-id>_action_<action-name>`.
   */
  id: string;

  /**
   * The name of the action.
   */
  name: string;

  /**
   * A short description of the action.
   */
  description: string;

  /**
   * The inputConfig object is used to define the input fields for the action.
   * This is used by the user in the UI to configure the action.
   *
   * For more information on how to build the input fields,
   * go to https://www.lecca.io/docs/development/tools/configs/input-config
   */
  inputConfig: InputConfig;

  /**
   * A zod schema that represents the output of the action.
   * This zod schema MUST match the inputConfig of this action.
   *
   * This means if there is an inputConfig field with an id of "name",
   * then the aiSchema object must have a field with an id of "name" as well.
   *
   * Look at examples of other actions to understand how to create this schema.
   */
  aiSchema: T;

  /**
   * If the app has connections, then the app requires connections. If for some reason
   * this specific action in the app doesn't require a connection, set this to false.
   */
  needsConnection?: boolean;

  /**
   * Options to change the UI for the save buttons.
   */
  viewOptions?: ViewOptions;

  /**
   * The data returned from the run function will be the output of the
   * action node in the workflow execution or the output of the tool
   * if used by an AI agent.
   *
   * The most common arguments used are the `configValue` and `connection`.
   */
  run: (args: RunActionArgs<z.infer<T>>) => Promise<any>;

  /**
   * Mock run is used for generating a mock output that can be used
   * to map the output to the input of another action. Make sure the mocked
   * data matches the output of the `run` function as closely as possible.
   *
   * If the output of the `run` function is always different, disable the mock
   * run by setting the `viewOptions.hideSaveAndTestButton` to `true`.
   */
  mockRun: (args: RunActionArgs<z.infer<T>>) => Promise<any>;

  /**
   * If the action has an icon, set the URL here.
   * Otherwise, the action will use its app's icon (logoUrl).
   */
  iconUrl?: string;

  /**
   * Set to false to not show the action in the agent's action list
   *
   * default: `true`
   */
  availableForAgent?: boolean;

  /**
   * Used for human in the loop or other that pause the workflow execution.
   */
  handleInterruptingResponse?: (args: {
    runResponse: unknown;
  }) => ActionResponse<unknown>;
};

export type ActionResponse<T> = {
  success?: T;
  failure?: unknown;
  needsInput?: unknown;
  scheduled?: unknown;
};
