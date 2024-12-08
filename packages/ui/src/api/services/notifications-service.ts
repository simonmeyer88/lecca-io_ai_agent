import { Notification, notificationSchema } from '@/models/notifications-model';

import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class NotificationsService extends ApiLibraryHelper {
  protected schema = notificationSchema;
  protected path = '/notifications';
  protected serviceName = 'notifications' as keyof ApiLibrary;

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Notification[]>({ config: args?.config });
  }

  markAllAsRead(args?: { config?: ApiLibraryConfig }) {
    return super.apiFetch<Notification>({
      httpMethod: 'post',
      path: `${this.path}`,
      config: args?.config,
      mockConfig: {
        schema: notificationSchema,
        isArray: true,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
        ]);
      },
    });
  }

  markAsRead({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<Notification>({
      httpMethod: 'post',
      path: `${this.path}/${id}`,
      config,
      mockConfig: {
        schema: notificationSchema,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
        ]);
      },
    });
  }

  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({ id, config });
  }
}
