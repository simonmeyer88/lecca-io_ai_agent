import useApiQuery from '@/api/use-api-query';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { EditWorkspaceInvitationForm } from '@/components/forms/edit-workspace-invitation-form';
import { InviteUsertoWorkspaceForm } from '@/components/forms/invite-user-to-workspace-form';
import { Icons } from '@/components/icons';
import { ListViewLoader } from '@/components/loaders/list-view-loader';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ListView } from '@/components/ui/list-view';
import { Separator } from '@/components/ui/separator';

export function WorkspaceInvitationsPage() {
  const { data: invitations, isLoading: isLoadingInvitations } = useApiQuery({
    service: 'workspaceInvitations',
    method: 'getList',
    apiLibraryArgs: {},
  });

  return (
    <div className="space-y-6 w-full h-full">
      <div>
        <h3 className="text-lg font-medium">Workspace Invitations</h3>
        <p className="text-sm text-muted-foreground">
          Manage your workspace invitations.
        </p>
      </div>
      <Separator />
      <ListView className="w-full auto h-[calc(100dvh-275px)]">
        {isLoadingInvitations || !invitations ? (
          <ListViewLoader />
        ) : (
          <ListView.Body>
            {invitations.length === 0 ? (
              <Dialog>
                <EmptyPlaceholder
                  title="No invitations"
                  description="Click below to invite a someone to this workspace."
                  isDialogTrigger
                  buttonLabel="Invite"
                  icon={<Icons.plusUser />}
                />
                <Dialog.Content>
                  <InviteUsertoWorkspaceForm />
                </Dialog.Content>
              </Dialog>
            ) : (
              invitations.map((invitation) => (
                <ListView.Row
                  key={invitation.id}
                  className="flex justify-between"
                >
                  <div className="flex items-center">
                    <ListView.Title>{invitation.email}</ListView.Title>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <Dialog>
                      <Dialog.Trigger asChild>
                        <Button variant={'outline'}>Edit</Button>
                      </Dialog.Trigger>
                      <Dialog.Content>
                        <EditWorkspaceInvitationForm
                          workspaceInvitation={invitation}
                        />
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
