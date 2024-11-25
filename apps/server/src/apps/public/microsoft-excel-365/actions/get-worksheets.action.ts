import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { MicrosoftExcel365 } from '../microsoft-excel-365.app';
import { z } from 'zod';

export class GetWorksheets extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: MicrosoftExcel365;
  id() {
    return 'microsoft-excel-365_action_get-worksheets';
  }
  name() {
    return 'Get Worksheets';
  }
  description() {
    return 'Get a list of worksheets from a workbook';
  }
  aiSchema() {
    return z.object({
      workbookId: z
        .string()
        .min(1)
        .describe('The ID of the workbook to get worksheets from'),
    });
  }
  inputConfig(): InputConfig[] {
    return [this.app.dynamicSelectWorkbooks()];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>) {
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${configValue.workbookId}/workbook/worksheets`;

    const response = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return response.data.value.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  }

  async mockRun(): Promise<(typeof mock)[]> {
    return [mock] as any;
  }
}

const mock = {
  id: '{00000000-0000-0000-0000-000000000000}',
  name: 'Sheet1',
  position: 0,
  visibility: 'Visible',
};

type ConfigValue = z.infer<ReturnType<GetWorksheets['aiSchema']>>;
