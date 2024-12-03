import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { ConditionalPaths } from './actions/conditional-paths.action';
import { GetCustomInput } from './actions/get-input.data.action';
import { ManuallyDecidePaths } from './actions/manually-decide-path.action';
import { OutputWorkflowData } from './actions/output-workflow-data.action';
import { Pause } from './actions/pause.action';
import { RunWorkflow } from './actions/run-workflow.action';
import { Schedule } from './actions/schedule.action';
import { Wait } from './actions/wait.action';
import { ListenForWebhook } from './triggers/listen-for-webhook.trigger';
import { ManualTrigger } from './triggers/manual.trigger';
import { RecurringSchedule } from './triggers/recurring-schedule.trigger';

export class FlowControl extends App {
  id = 'flow-control';
  name = 'Flow Control';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'Actions to control the flow of your workflow.';
  isPublished = true;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      //Flow Control
      new GetCustomInput({ app: this }),
      new ManuallyDecidePaths({ app: this }),
      new ConditionalPaths({ app: this }),
      new RunWorkflow({ app: this }),
      new OutputWorkflowData({ app: this }),
      new Schedule({ app: this }),
      new Pause({ app: this }),
      new Wait({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [
      new ManualTrigger({ app: this }),
      new RecurringSchedule({ app: this }),
      new ListenForWebhook({ app: this }),
    ];
  }

  dynamicInputNeededNotificationConfig(): InputConfig[] {
    return [
      {
        id: 'instructions',
        label: 'Optional Instructions',
        description: 'Used to provide additional context.',
        inputType: 'text',
        placeholder: 'Add instructions',
      },
      {
        id: 'sendNotification',
        inputType: 'switch',
        label: 'Send Notification?',
        description: '',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: false,
        },
      },
      {
        id: 'assignee',
        inputType: 'dynamic-select',
        label: 'Assignee',
        description: 'Who to send the notification to.',
        hideCustomTab: true,
        loadOptions: {
          dependsOn: [
            {
              id: 'sendNotification',
              value: 'true',
            },
          ],
        },
        _getDynamicValues: async ({ workspaceId, projectId }) => {
          //Get access to all users in the workspace with access to the project.
          const workspaceUsers = await this.prisma.workspaceUser.findMany({
            where: {
              AND: [
                {
                  FK_workspaceId: workspaceId,
                },
                {
                  deletedAt: null,
                },
                {
                  //1. Is maintainer
                  //2. Has access to project
                  OR: [
                    {
                      roles: {
                        has: 'MAINTAINER',
                      },
                    },
                    {
                      projects: {
                        some: {
                          id: projectId,
                        },
                      },
                    },
                  ],
                },
              ],
            },
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });

          return workspaceUsers.map((workspaceUser) => {
            return {
              value: workspaceUser.id,
              label: workspaceUser.user?.name,
            };
          });
        },
      },
    ];
  }

  verifyAssigneeHasAccessToProject = async ({
    workspaceUserId,
    projectId,
  }: {
    workspaceUserId: string;
    projectId: string;
  }): Promise<boolean> => {
    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        AND: [
          {
            id: workspaceUserId,
          },
          {
            deletedAt: null,
          },
          {
            OR: [
              {
                roles: {
                  has: 'MAINTAINER',
                },
              },
              {
                projects: {
                  some: {
                    id: projectId,
                  },
                },
              },
            ],
          },
        ],
      },
    });

    if (!workspaceUser) {
      throw new Error('Assignee does not have access to the project');
    }

    return true;
  };
}
