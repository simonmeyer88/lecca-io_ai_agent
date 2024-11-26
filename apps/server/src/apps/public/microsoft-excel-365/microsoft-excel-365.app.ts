import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { GetWorksheets } from './actions/get-worksheets.action';
import { MicrosoftExcel365OAuth2 } from './connections/microsoft-excel-365.oauth2';

export class MicrosoftExcel365 extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'microsoft-excel-365';
  name = 'Microsoft Excel 365';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Microsoft Excel is the industry leading spreadsheet software program, a powerful data visualization and analysis tool.';
  isPublished = true;

  connections(): Connection[] {
    return [new MicrosoftExcel365OAuth2({ app: this })];
  }

  actions(): Action[] {
    return [new GetWorksheets({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicSelectWorkbooks(): InputConfig {
    return {
      id: 'workbookId',
      label: 'Workbook',
      description: 'Select a workbook',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url =
          "https://graph.microsoft.com/v1.0/me/drive/root/search(q='.xlsx')?select=id,name";

        const response = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return response?.data?.value.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
      },
      required: {
        missingStatus: 'warning',
        missingMessage: 'Workbook is required',
      },
    };
  }
}
