import {
  Action,
  RunActionArgs,
  ActionConstructorArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { Text } from '../text.app';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

export class Concatenate extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Text;

  id() {
    return 'text_action_concatenate';
  }

  name() {
    return 'Concatenate Text';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Concatenates two more texts together';
  }

  viewOptions(): null | NodeViewOptions {
    return {
      saveButtonOptions: {
        replaceSaveAndTestButton: {
          label: 'Save & Test',
          type: 'real',
        },
      },
    };
  }

  aiSchema() {
    return z.object({
      texts: z.array(z.string()).min(1).describe('texts to join'),
      separator: z
        .string()
        .nullable()
        .optional()
        .describe('The character used to join the texts'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
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
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { texts, separator } = configValue;

    return { result: texts?.join(separator ?? '') ?? '' };
  }

  async mockRun(): Promise<unknown> {
    return { result: 'text1,test2,text3' };
  }
}

type ConfigValue = z.infer<ReturnType<Concatenate['aiSchema']>>;

type Response = {
  result: string;
};
