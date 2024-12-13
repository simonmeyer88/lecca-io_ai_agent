import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-forms.shared';

export const newFormResponse = createTimeBasedPollTrigger({
  id: 'google-forms_trigger_new-form-response',
  name: 'New Form Response',
  description: 'Triggers when a form is filled out',
  inputConfig: [shared.fields.dynamicSelectForm],
  run: async ({ connection, configValue }) => {
    const googleForm = shared.googleForm({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { form } = configValue;
    const formResponses = await googleForm.forms.responses.list({
      formId: form,
    });

    return formResponses.data.responses
      ? formResponses.data.responses.map((response) => {
          return {
            responseId: response.responseId,
            formId: response.formId,
            answers: response.answers,
            createTime: response.createTime,
            respondentEmail: response.respondentEmail,
            lastSubmittedTime: response.lastSubmittedTime,
            totalScore: response.totalScore,
          };
        })
      : ([] as any);
  },
  mockRun: async () => {
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
  },
  extractTimestampFromResponse({ response }) {
    if (response.createTime) {
      return dateStringToMilliOrNull(response.createTime);
    } else {
      return null;
    }
  },
});
