import { InjectedServices, InputConfig } from '@lecca-io/toolkit';
import { DateTime } from 'luxon';

export const shared = {
  generateRecurrenceOptions: (selectedDate: string) => {
    const dt = DateTime.fromJSDate(new Date(selectedDate), { zone: 'utc' });
    const hour = dt.hour;
    const minute = dt.minute;
    const occurrence = Math.ceil(dt.day / 7);
    const weekday = dt.toFormat('EEE').toUpperCase().substring(0, 2);
    const isLastOccurrence = shared.isLastOccurrenceOfWeekdayInMonth(dt);

    return {
      doesNotRepeat: `DTSTART:${shared.formatDate(dt)}\nDTEND:${shared.formatDate(dt.plus({ hours: 1 }))}`,
      daily: `RRULE:FREQ=DAILY;BYHOUR=${hour};BYMINUTE=${minute}`,
      weekly: `RRULE:FREQ=WEEKLY;BYDAY=${weekday};BYHOUR=${hour};BYMINUTE=${minute}`,
      monthly: `RRULE:FREQ=MONTHLY;BYDAY=${isLastOccurrence ? '-1' : occurrence}${weekday};BYHOUR=${hour};BYMINUTE=${minute}`,
      yearly: `RRULE:FREQ=YEARLY;BYMONTH=${dt.month};BYMONTHDAY=${dt.day};BYHOUR=${hour};BYMINUTE=${minute}`,
      everyWeekday: `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=${hour};BYMINUTE=${minute}`,
      custom: 'custom',
    };
  },
  isLastOccurrenceOfWeekdayInMonth: (date: DateTime) => {
    const lastDayOfMonth = date.endOf('month');
    let currentDay = lastDayOfMonth;

    while (currentDay.weekday !== date.weekday) {
      currentDay = currentDay.minus({ days: 1 });
    }

    return currentDay.day === date.day;
  },
  createDropdownOptions: (selectedDate: string) => {
    const recurrenceOptions = shared.generateRecurrenceOptions(selectedDate);
    const dt = DateTime.fromJSDate(new Date(selectedDate), { zone: 'utc' });

    return [
      { label: 'Daily', value: recurrenceOptions.daily },
      {
        label:
          'Weekly on ' +
          DateTime.fromJSDate(new Date(selectedDate)).toFormat('cccc'),
        value: recurrenceOptions.weekly,
      },
      {
        label: `Monthly on the ${shared.getOccurrence(dt)} ${dt.toFormat('cccc')}`,
        value: recurrenceOptions.monthly,
      },
      {
        label:
          'Annually on ' +
          DateTime.fromJSDate(new Date(selectedDate)).toFormat('MMMM d'),
        value: recurrenceOptions.yearly,
      },
      {
        label: 'Every weekday (Monday to Friday)',
        value: recurrenceOptions.everyWeekday,
      },
      { label: 'Custom...', value: recurrenceOptions.custom },
    ];
  },
  getOrdinalSuffix: (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },
  getOccurrence: (date: DateTime) => {
    const firstDayOfMonth = date.startOf('month');
    let count = 1;
    let currentDay = firstDayOfMonth;

    while (currentDay < date) {
      if (currentDay.weekday === date.weekday && currentDay.day !== date.day) {
        count++;
      }
      currentDay = currentDay.plus({ days: 1 });
    }

    currentDay = date;
    let nextSameWeekday = date.plus({ weeks: 1 });

    while (nextSameWeekday.month === date.month) {
      currentDay = nextSameWeekday;
      nextSameWeekday = nextSameWeekday.plus({ weeks: 1 });
    }

    if (currentDay.toFormat('yyyy-MM-dd') === date.toFormat('yyyy-MM-dd')) {
      return 'last';
    } else {
      return shared.getOrdinalSuffix(count);
    }
  },
  formatDate: (date: DateTime) => {
    return date.toFormat("yyyyMMdd'T'HHmmss'Z'");
  },
  verifyAssigneeHasAccessToProject: async ({
    workspaceUserId,
    projectId,
    prisma,
  }: {
    workspaceUserId: string;
    projectId: string;
    prisma: InjectedServices['prisma'];
  }): Promise<boolean> => {
    const workspaceUser = await prisma.workspaceUser.findFirst({
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
  },
  dynamicInputNeededNotificationConfig: [
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
      _getDynamicValues: async ({ workspaceId, projectId, prisma }) => {
        //Get access to all users in the workspace with access to the project.
        const workspaceUsers = await prisma.workspaceUser.findMany({
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
  ] as InputConfig,
};
