import { useState } from 'react';
import { useParams } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { InviteUserToProjectForm } from '@/components/forms/invite-user-to-project-form';
import { Icons } from '@/components/icons';
import { ListViewLoader } from '@/components/loaders/list-view-loader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ListView } from '@/components/ui/list-view';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';

export function ProjectInvitationsPage() {
  const { projectId } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { data: invitations, isLoading: isLoadingInvitations } = useApiQuery({
    service: 'projectInvitations',
    method: 'getProjectInvitationsByProjectId',
    apiLibraryArgs: {
      projectId: projectId!,
    },
  });

  const deleteMutation = useApiMutation({
    service: 'projectInvitations',
    method: 'delete',
  });

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">Project Invitations</h3>
          <p className="text-sm text-muted-foreground">
            Manage your project invitations.
          </p>
        </div>
      </div>
      <Separator />
      <ListView className="w-full overflow-y-auto h-[calc(100dvh-275px)]">
        {isLoadingInvitations || !invitations ? (
          <ListViewLoader />
        ) : (
          <ListView.Body>
            {invitations.length === 0 ? (
              <Dialog>
                <EmptyPlaceholder
                  title="No invitations"
                  description="Click below to invite a user to this project."
                  isDialogTrigger
                  buttonLabel="Invite"
                  icon={<Icons.plusUser />}
                />
                <Dialog.Content>
                  <InviteUserToProjectForm projectId={projectId!} />
                </Dialog.Content>
              </Dialog>
            ) : (
              invitations.map((invitation) => (
                <ListView.Row
                  key={invitation.id}
                  className="flex justify-between"
                >
                  <div>
                    <ListView.Title>
                      {invitation.workspaceUser.user.name}
                    </ListView.Title>
                    <ListView.Description>
                      {invitation.workspaceUser.user.email}
                    </ListView.Description>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <AlertDialog>
                      <AlertDialog.Trigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content>
                        <AlertDialog.Header>
                          <AlertDialog.Title>
                            Delete invitation
                          </AlertDialog.Title>
                          <AlertDialog.Description>
                            Are you sure you want to delete this invitation?
                          </AlertDialog.Description>
                        </AlertDialog.Header>
                        <AlertDialog.Footer>
                          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                          <AlertDialog.Action
                            loading={isDeleting}
                            onClick={async () => {
                              setIsDeleting(true);
                              await deleteMutation.mutateAsync(
                                {
                                  id: invitation.id,
                                },
                                {
                                  onSuccess: () => {
                                    toast({
                                      title: 'Project invitation deleted',
                                    });
                                  },
                                  onSettled: () => {
                                    setIsDeleting(false);
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
