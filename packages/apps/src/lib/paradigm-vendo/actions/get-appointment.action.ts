import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getAppointment = createAction({
  id: 'paradigm-vendo_action_get-appointment',
  name: 'Get Appointment',
  description: 'Retrieves an appointment by ID',
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    id: z.string().describe('The ID of the appointment to retrieve'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'id',
      label: 'Appointment ID',
      description: 'Numeric ID or Integration ID fo the appointment.',
      required: {
        missingMessage: 'ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = `https://api.paradigmvendo.com/v2/appointment/${configValue.id}`;

    const response = await http.request({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${connection.publicKey}:${connection.privateKey}`,
        ).toString('base64')}`,
      },
      workspaceId,
    });

    return {
      data: response.data,
    };
  },
  mockRun: async () => ({
    data: {
      appointmentIntegrationId: 0,
      appointmentStartedAt: 'string',
      sellerId: 0,
      sellerName: 'string',
      customerId: 0,
      customerIntegrationId: 0,
      customerName: 'string',
      createdAt: 'string',
      createdFrom: 'string',
      crm: 'string',
      crmId: 0,
      crmOpportunityResults: [
        {
          id: 'string',
          name: 'string',
          catalog: 'string',
          reason_id: 'string',
          reason_name: 'string',
        },
      ],
      crmResult: 'string',
      crmResultId: 0,
      crmResultReason: 'string',
      crmType: 'string',
      customTax: 'string',
      deletedAt: 'string',
      deletedBy: 'string',
      deletionReason: 'string',
      documentOfDocumentsUrl: 'string',
      finalNotes: 'string',
      id: 0,
      inspectionReportUrl: 'string',
      installationNotesUrl: 'string',
      integrationId: 0,
      isMultiOmni: true,
      lockType: 'string',
      measureNotes: 'string',
      needsAssessment: [
        {
          question: 'string',
          answer: 'string',
        },
      ],
      notes: 'string',
      officeExternalId: 0,
      officeId: 0,
      photosGlossary: {},
      projectDescription: 'string',
      projectPhoto: 'string',
      projectPhotos: ['string'],
      quotePrice: 'string',
      quotes: [
        {
          id: 0,
          package_name: 'string',
          status: 'string',
          parent: {},
          quote_ids: ['string'],
          quote_numbers: ['string'],
          pricing: {},
          line_items: [
            {
              id: 0,
              item_id: 'string',
              quote_id: 'string',
              child_item_ids: ['string'],
              name: 'string',
              description: 'string',
              quantity: 0,
              pricing: {},
              drawings: [{}],
              answers: {},
              measure_custom_answers: {},
              adders: [{}],
            },
          ],
          project_adders: [{}],
        },
      ],
      resultType: 'string',
      resultedAt: 'string',
      scheduleTime: 'string',
      scheduleTo: 'string',
      sellerEmail: 'string',
      sketchPhoto: 'string',
      startedAt: 'string',
      status: 'string',
      type: 'string',
      customer: {},
      secondCustomer: {},
      house: {},
      secondHouse: {},
    },
  }),
});
