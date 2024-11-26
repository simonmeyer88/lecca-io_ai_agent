import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { Text } from '../text.app';

export class Split extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Text;

  id() {
    return 'text_action_split';
  }

  name() {
    return 'Split';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Splits text be a delimiter';
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
      text: z.string().describe('String to split'),
      delimiter: z.string(),
    });
  }

  inputConfig(): InputConfig[] {
    return [
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
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { text, delimiter } = configValue;

    return { result: text.split(delimiter) };
  }

  async mockRun(): Promise<unknown> {
    return { result: ['text1', 'test2', 'text3'] };
  }
}

type ConfigValue = z.infer<ReturnType<Split['aiSchema']>>;

type Response = {
  result: string[];
};
