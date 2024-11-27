import { Assistant } from '@vapi-ai/web/dist/api';

import { Action } from '@/apps/lib/action';
import { App, AppContructorArgs } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { GetPhoneCall } from './actions/get-phone-call.action';
import { ListAssistants } from './actions/list-assistants.action';
import { ListPhoneNumbers } from './actions/list-phone-numbers.action';
import { MakePhoneCall } from './actions/make-phone-call.action';
import { VapiApiKey } from './connections/vapi.api-key';

export class Vapi extends App {
  constructor(args: AppContructorArgs) {
    super(args);
  }

  id = 'vapi';
  name = 'Vapi';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'Vapi is the platform to build, test and deploy voice agents';
  isPublished = true;

  connections(): Connection[] {
    return [new VapiApiKey({ app: this })];
  }

  actions(): Action[] {
    return [
      new MakePhoneCall({ app: this }),
      new GetPhoneCall({ app: this }),
      new ListAssistants({ app: this }),
      new ListPhoneNumbers({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicSelectVapiAssistants(): InputConfig {
    return {
      label: 'Assistant',
      id: 'vapiAssistantId',
      inputType: 'dynamic-select',
      placeholder: 'Select Assistant',
      description: 'The Assistant ID to use',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = 'https://api.vapi.ai/assistant';

        const result = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        // Assuming result.data is the list of assistants
        return (
          result?.data?.map((assistant: Assistant) => ({
            value: assistant.id,
            label: assistant.name,
          })) ?? []
        );
      },
      required: {
        missingMessage: 'VAPI Assistant is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectVapiPhoneNumbers(): InputConfig {
    return {
      label: 'Phone Number to Use',
      id: 'vapiPhoneNumberId',
      inputType: 'dynamic-select',
      placeholder: 'Select Phone Number',
      description: 'The Phone Number ID to use',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = 'https://api.vapi.ai/phone-number';

        const result = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        return (
          result?.data?.map((phone: { id: string; number: string }) => ({
            value: phone.id,
            label: phone.number,
          })) ?? []
        );
      },
      required: {
        missingMessage: 'VAPI Phone Number is required',
        missingStatus: 'warning',
      },
    };
  }
}
