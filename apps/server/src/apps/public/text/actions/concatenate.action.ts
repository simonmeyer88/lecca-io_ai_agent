import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { Text } from '../text.app';

export class Concatenate extends Action {
  app: Text;

  id = 'text_action_concatenate';
  name = 'Concatenate Text';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description = 'Concatenates two more texts together';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    texts: z.array(z.string()).min(1).describe('texts to join'),
    separator: z
      .string()
      .nullable()
      .optional()
      .describe('The character used to join the texts'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'texts',
      label: 'Text',
      description: '',
      inputType: 'text',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'separator',
      label: 'Separator',
      description:
        'The text character that is used between each text. For example, if you enter ",", all the texts will be joined together with a "," between them.',
      inputType: 'text',
      placeholder: 'Add optional text',
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { texts, separator } = configValue;

    return { result: texts?.join(separator ?? '') ?? '' };
  }

  async mockRun(): Promise<unknown> {
    return { result: 'text1,test2,text3' };
  }
}

type ConfigValue = z.infer<Concatenate['aiSchema']>;

type Response = {
  result: string;
};
