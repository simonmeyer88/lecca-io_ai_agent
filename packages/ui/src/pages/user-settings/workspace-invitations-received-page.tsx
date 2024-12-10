import useApiQuery from '../../api/use-api-query';
import { EmptyPlaceholder } from '../../components/empty-placeholder';
import { JoinWorkspaceForm } from '../../components/forms/join-workspace-form';
import { ListViewLoader } from '../../components/loaders/list-view-loader';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { ListView } from '../../components/ui/list-view';
import { Separator } from '../../components/ui/separator';

export function WorkspaceInvitationsReceivedPage() {
  const { data: invitations, isLoading: isLoadingInvitations } = useApiQuery({
    service: 'workspaceInvitations',
    method: 'getMe',
    apiLibraryArgs: {},
  });

  return (
    <div className="space-y-6 w-full h-full">
      <div>
        <h3 className="text-lg font-medium">Invitations to Workspaces</h3>
        <p className="text-sm text-muted-foreground">
          Manage your invitations.
        </p>
      </div>
      <Separator />
      <ListView className="w-full auto h-[calc(100dvh-275px)]">
        {isLoadingInvitations || !invitations ? (
          <ListViewLoader />
        ) : (
          <ListView.Body>
            {invitations.length === 0 ? (
              <EmptyPlaceholder
                title="No invitations"
                description="If you have any invitations, they will appear here."
              />
            ) : (
              invitations.map((invitation) => (
                <ListView.Row
                  key={invitation.id}
                  className="flex justify-between"
                >
                  <div className="flex items-center">
                    <ListView.Title>
                      {invitation.workspace?.name}
                    </ListView.Title>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <Dialog>
                      <Dialog.Trigger asChild>
                        <Button variant={'outline'}>View</Button>
                      </Dialog.Trigger>
                      <Dialog.Content>
                        <JoinWorkspaceForm invitation={invitation} />
                      </Dialog.Content>
                    </Dialog>
                  </div>
                </ListView.Row>
              ))
            )}
          </ListView.Body>
        )}
      </ListView>
    </div>
  );
}
