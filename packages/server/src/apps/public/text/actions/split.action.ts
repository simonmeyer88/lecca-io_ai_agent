import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { Text } from '../text.app';

export class Split extends Action {
  app: Text;
  id = 'text_action_split';
  name = 'Split';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description = 'Splits text be a delimiter';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    text: z.string().describe('String to split'),
    delimiter: z.string(),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'text',
      label: 'Text',
      description: '',
      inputType: 'text',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'delimiter',
      label: 'Delimiter',
      description: 'This is the sequence of characters to split the text by.',
      inputType: 'text',
      placeholder: 'Add delimiter',
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { text, delimiter } = configValue;

    return { result: text.split(delimiter) };
  }

  async mockRun(): Promise<unknown> {
    return { result: ['text1', 'test2', 'text3'] };
  }
}

type ConfigValue = z.infer<Split['aiSchema']>;

type Response = {
  result: string[];
};
