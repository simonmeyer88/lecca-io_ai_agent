import { BellIcon } from '@radix-ui/react-icons';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { appQueryClient } from '../../api/api-library';
import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { useApplicationSideNav } from '../../hooks/useApplicationSideNav';
import { useUser } from '../../hooks/useUser';
import { Notification } from '../../models/notifications-model';
import { Theme } from '../../models/workspace-user-preferences-model';
import { cn } from '../../utils/cn';
import { timeAgo } from '../../utils/dates';
import { Icons } from '../icons';
import { Loader } from '../loaders/loader';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { DropdownMenu } from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { Select } from '../ui/select';
import { Separator } from '../ui/separator';
import { Sheet } from '../ui/sheet';

export default function UserNav() {
  const {
    workspaceUser,
    workspaceUserPreferences,
    setWorkspaceUserPreferences,
  } = useUser();

  const { rightRailIsCollapsed, setRightRailIsCollapsed } =
    useApplicationSideNav();

  const mutation = useApiMutation({
    service: 'workspaceUserPreferences',
    method: 'updateMe',
  });

  const { data: notifications, isLoading: isLoadingNotifications } =
    useApiQuery({
      service: 'notifications',
      method: 'getList',
      apiLibraryArgs: {},
    });

  useEffect(() => {
    const interval = setInterval(
      () => {
        appQueryClient.invalidateQueries({
          queryKey: ['notifications', 'getList'],
        });
      },
      //Load notifications every 3 minutes
      3 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 sm:space-x-2">
      <Sheet>
        <Sheet.Trigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            {(notifications ?? []).filter((n) => !n.isRead).length > 0 && (
              <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            )}
            <BellIcon className="shrink-0" />
          </Button>
        </Sheet.Trigger>
        <Sheet.Content className="px-0">
          <NotificationsContent
            notifications={notifications}
            isLoadingNotifications={isLoadingNotifications}
          />
        </Sheet.Content>
      </Sheet>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="size-6 border">
              <Avatar.Image
                src={workspaceUser?.profileImageUrl ?? undefined}
                alt="User Profile Image"
              />
              <Avatar.Fallback>
                {workspaceUser?.user?.name![0].toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-56" align="end" forceMount>
          <DropdownMenu.Label className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {workspaceUser?.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {workspaceUser?.user?.email}
              </p>
            </div>
          </DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Group>
            <Link to="/workspace-user-account">
              <DropdownMenu.Item>Account</DropdownMenu.Item>
            </Link>
            {workspaceUser?.roles?.includes('MAINTAINER') && (
              <Link to="/workspace-settings">
                <DropdownMenu.Item>Workspace</DropdownMenu.Item>
              </Link>
            )}
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Group className="p-1">
            <Select
              value={workspaceUserPreferences?.theme ?? 'SYSTEM'}
              onValueChange={(value) => {
                setWorkspaceUserPreferences({
                  theme: value as Theme,
                  workflowOrientation:
                    workspaceUserPreferences?.workflowOrientation ??
                    'HORIZONTAL',
                });

                mutation.mutate({
                  data: {
                    theme: value as Theme,
                  },
                });
              }}
            >
              <Select.Trigger>
                <div className="flex space-x-2 items-center">
                  {
                    {
                      LIGHT: <Icons.lightMode className="size-4" />,
                      DARK: <Icons.darkMode className="size-4" />,
                      SYSTEM: <Icons.systemMode className="size-4" />,
                    }[workspaceUserPreferences?.theme ?? 'SYSTEM']
                  }
                  <Select.Value placeholder="Theme" />
                </div>
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="LIGHT">Light</Select.Item>
                <Select.Item value="DARK">Dark</Select.Item>
                <Select.Item value="SYSTEM">System</Select.Item>
              </Select.Content>
            </Select>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <Link to="/logout">
            <DropdownMenu.Item>
              Logout
              <DropdownMenu.Shortcut>{<Icons.exit />}</DropdownMenu.Shortcut>
            </DropdownMenu.Item>
          </Link>
        </DropdownMenu.Content>
      </DropdownMenu>
      {rightRailIsCollapsed && (
        <Button
          variant={'ghost'}
          size="icon"
          onClick={() => setRightRailIsCollapsed(false)}
          className="p-2 text-muted-foreground hover:text-primary"
        >
          <Icons.panelRightOpen className="size-5" />
        </Button>
      )}
    </div>
  );
}

const NotificationsContent = ({
  notifications,
  isLoadingNotifications,
}: {
  notifications: Notification[] | undefined;
  isLoadingNotifications: boolean;
}) => {
  const navigate = useNavigate();

  const markAllAsRead = useApiMutation({
    service: 'notifications',
    method: 'markAllAsRead',
  });

  const markAsRead = useApiMutation({
    service: 'notifications',
    method: 'markAsRead',
  });

  return (
    <div className="flex flex-col space-y-4 h-full">
      <Sheet.Title className="pl-4">Notifications</Sheet.Title>
      <ScrollArea className="h-full">
        <div className="relative space-y-0">
          {isLoadingNotifications || !notifications ? (
            <div className="h-40 text-sm">
              <Loader />
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-40 text-sm flex items-center justify-center">
              No notifications
            </div>
          ) : (
            notifications.map((notification, index) => (
              <Sheet.Close className="text-left" key={notification.id}>
                <div className="flex flex-col">
                  <div
                    className={cn('flex items-center space-x-2 p-4', {
                      'hover:bg-muted': notification.link,
                      'cursor-pointer': notification.link,
                    })}
                    tabIndex={notification.link ? 1 : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (notification.link) {
                        markAsRead.mutateAsync({ id: notification.id });
                        navigate(notification.link);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (notification.link && e.key === 'Enter') {
                        markAsRead.mutateAsync({ id: notification.id });
                        navigate(notification.link);
                      }
                    }}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn('relative leading-none', {
                            'pb-1.5': notification.isRead, //Because the mark as read button gives the non-read notification a little more height
                          })}
                        >
                          {!notification.isRead && (
                            <span className="absolute top-1/2 -translate-y-1/2 -right-4 h-2 w-2 bg-red-500 rounded-full" />
                          )}
                          <span className={cn('text-sm font-semibold')}>
                            {notification.title}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm line-clamp-3">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-xs leading-none text-muted-foreground">
                          {timeAgo(notification.createdAt!)}
                        </p>
                        {!notification.isRead && (
                          <Button
                            variant="link"
                            size={'sm'}
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              await markAsRead.mutateAsync({
                                id: notification.id,
                              });
                            }}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {index === notifications.length - 1 ? null : <Separator />}
                </div>
              </Sheet.Close>
            ))
          )}
        </div>
      </ScrollArea>
      <Sheet.Footer className="flex flex-row justify-end mr-2">
        <Sheet.Close asChild>
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              markAllAsRead.mutateAsync({});
            }}
            disabled={notifications?.length === 0}
          >
            Mark all as read
          </Button>
        </Sheet.Close>
        <Sheet.Close asChild>
          <Button size="icon" variant="ghost" asChild>
            <Link to="/workspace-user-notification-preferences">
              <Icons.gear />
            </Link>
          </Button>
        </Sheet.Close>
      </Sheet.Footer>
    </div>
  );
};
