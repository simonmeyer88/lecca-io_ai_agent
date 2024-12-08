import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Icons } from '@/components/icons';
import { Loader } from '@/components/loaders/loader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/useUser';

import { CreateEditAppTriggerForm } from './components/forms/create-edit-app-trigger-form';

export function AppDetailsTriggers() {
  const { workspaceUser: user } = useUser();
  const { appId } = useParams();
  const { data: app, isLoading: appIsLoading } = useApiQuery({
    service: 'workflowApps',
    method: 'getById',
    apiLibraryArgs: {
      id: appId!,
    },
  });

  const canEdit = useMemo(() => {
    //If the app is not published, only the owner and maintainer can edit it
    if (app?.isPublished === false) {
      if (user!.roles.includes('OWNER') || user!.roles.includes('MAINTAINER')) {
        return true;
      }
    }

    return false;
  }, [user, app]);

  if (appIsLoading || !app) {
    <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium">Triggers</h3>
          <p className="text-sm text-muted-foreground">
            Triggers are how workflows are executed.
          </p>
        </div>
        {canEdit && app?.triggers.length !== 0 && (
          <Dialog>
            <Dialog.Trigger asChild>
              <Button size="sm" variant={'outline'}>
                Add Trigger
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <CreateEditAppTriggerForm app={app!} />
            </Dialog.Content>
          </Dialog>
        )}
      </div>
      <Separator />
      {app?.triggers.length === 0 ? (
        <Dialog>
          <EmptyPlaceholder
            title="No Triggers"
            description="Add triggers to your app to use in your workflows"
            buttonLabel="Add trigger"
            isDialogTrigger
          />
          <Dialog.Content>
            <CreateEditAppTriggerForm app={app} />
          </Dialog.Content>
        </Dialog>
      ) : (
        app?.triggers.map((trigger) => (
          <Card key={trigger.id}>
            <Card.Header className="flex flex-row justify-between">
              <div className="flex flex-col space-y-2">
                <Card.Title>{trigger.name}</Card.Title>
                <Card.Description>{trigger.description}</Card.Description>
              </div>
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button size="icon" variant={'outline'}>
                      <Icons.dotsHorizontal />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <Dialog>
                      <Dialog.Trigger className="w-full">
                        <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenu.Item>
                      </Dialog.Trigger>
                      <Dialog.Content>
                        <CreateEditAppTriggerForm app={app} />
                      </Dialog.Content>
                    </Dialog>
                    <DropdownMenu.Separator />
                    <AlertDialog>
                      <AlertDialog.Trigger className="w-full">
                        <DropdownMenu.Item
                          className="text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                        </DropdownMenu.Item>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content>
                        <AlertDialog.Header>
                          <AlertDialog.Title>Delete trigger</AlertDialog.Title>
                          <AlertDialog.Description>
                            Deleting this trigger will cause all workflows using
                            this trigger to behave unexpectedly. Are you sure
                            you want to delete{' '}
                            <span className="font-bold">{trigger.name}</span>?
                          </AlertDialog.Description>
                        </AlertDialog.Header>
                        <AlertDialog.Footer>
                          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                          <AlertDialog.Action className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialog.Action>
                        </AlertDialog.Footer>
                      </AlertDialog.Content>
                    </AlertDialog>
                  </DropdownMenu.Content>
                </DropdownMenu>
              )}
            </Card.Header>
          </Card>
        ))
      )}
    </div>
  );
}
