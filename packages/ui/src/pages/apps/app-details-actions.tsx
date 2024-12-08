import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
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
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';

import { CreateEditAppActionForm } from './components/forms/create-edit-app-action-form';

export function AppDetailsActions() {
  const { toast } = useToast();
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

  const deleteMutation = useApiMutation({
    service: 'workflowApps',
    method: 'deleteAction',
  });

  if (appIsLoading || !app) {
    <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium">Actions</h3>
          <p className="text-sm text-muted-foreground">
            Actions are actions or processes used as an automation step.
          </p>
        </div>
        {canEdit && app?.actions.length !== 0 && (
          <Dialog>
            <Dialog.Trigger asChild>
              <Button size="sm" variant={'outline'}>
                Add Action
              </Button>
            </Dialog.Trigger>
            <Dialog.Content className="lg:max-w-[900px]">
              <CreateEditAppActionForm app={app!} />
            </Dialog.Content>
          </Dialog>
        )}
      </div>
      <Separator />
      {app?.actions.length === 0 ? (
        <Dialog>
          <EmptyPlaceholder
            title="No Actions"
            description="Add actions to your app to use in your workflows"
            buttonLabel="Add action"
            isDialogTrigger
          />
          <Dialog.Content className="lg:max-w-[900px]">
            <CreateEditAppActionForm app={app} />
          </Dialog.Content>
        </Dialog>
      ) : (
        app?.actions.map((action) => (
          <Card key={action.id}>
            <Card.Header className="flex flex-row justify-between">
              <div className="flex flex-col space-y-2">
                <Card.Title>{action.name}</Card.Title>
                <Card.Description>{action.description}</Card.Description>
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
                      <Dialog.Content className="lg:max-w-[900px]">
                        {/* <CreateEditAppActionForm app={app} action={action} /> */}
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
                          <AlertDialog.Title>Delete action</AlertDialog.Title>
                          <AlertDialog.Description>
                            Deleting this action will cause all workflows using
                            this action to behave unexpectedly. Are you sure you
                            want to delete{' '}
                            <span className="font-bold">{action.name}</span>?
                          </AlertDialog.Description>
                        </AlertDialog.Header>
                        <AlertDialog.Footer>
                          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                          <AlertDialog.Action
                            className="bg-destructive text-destructive-foreground"
                            onClick={async () => {
                              await deleteMutation.mutateAsync(
                                {
                                  actionId: action?.id,
                                },
                                {
                                  onSuccess: () => {
                                    toast({ title: 'Action deleted' });
                                  },
                                },
                              );
                            }}
                          >
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
