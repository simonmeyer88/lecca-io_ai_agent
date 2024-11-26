import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { GoogleForms } from '../google-forms.app';

export class NewFormResponse extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleForms;
  id() {
    return 'google-forms_trigger_new-form-response';
  }
  name() {
    return 'New Form Response';
  }
  description() {
    return 'Triggers when a form is filled out';
  }
  inputConfig(): InputConfig[] {
    return [this.app.dynamicSelectForm()];
  }

  async run({
    connection,
    configValue,
  }: RunTriggerArgs<ConfigValue>): Promise<ResponseType[]> {
    const googleForm = await this.app.googleForm({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { form } = configValue;
    const formResponses = await googleForm.forms.responses.list({
      formId: form,
    });

    return (
      formResponses.data.responses?.map((response) => {
        return {
          responseId: response.responseId,
          formId: response.formId,
          answers: response.answers,
          createTime: response.createTime,
          respondentEmail: response.respondentEmail,
          lastSubmittedTime: response.lastSubmittedTime,
          totalScore: response.totalScore,
        };
      }) ?? []
    );
  }

  async mockRun(): Promise<ResponseType[]> {
    return [
      {
        responseId: '1',
        formId: '1',
        answers: 'answers',
        createTime: '2021-01-01T00:00:00Z',
        respondentEmail: 'example@test.com',
        lastSubmittedTime: '2021-01-01T00:00:00Z',
        totalScore: 0,
      },
    ];
  }

  extractTimestampFromResponse({ response }: { response: ResponseType }) {
    if (response.createTime) {
      return DateStringToMilliOrNull(response.createTime);
    } else {
      return null;
    }
  }
}

type ConfigValue = {
  form: string;
};

type ResponseType = {
  responseId: string;
  formId: string;
  answers: unknown;
  createTime: string;
  respondentEmail: string;
  lastSubmittedTime: string;
  totalScore: number;
};
