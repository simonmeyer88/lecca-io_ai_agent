import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { InviteUsertoWorkspaceForm } from '../../components/forms/invite-user-to-workspace-form';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { GridLoader } from '../../components/loaders/grid-loader';
import { AlertDialog } from '../../components/ui/alert-dialog';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { DropdownMenu } from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { ListView } from '../../components/ui/list-view';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../hooks/useToast';
import { useUser } from '../../hooks/useUser';
import { WorkspaceInvitation } from '../../models/workspace-invitation-model';

export function TeamMembersPage() {
  const { workspaceUser: currentWorkspaceUser, enabledFeatures } = useUser();
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    data: workspaceInvitations,
    isLoading: isLoadingWorkspaceInvitations,
  } = useApiQuery({
    service: 'workspaceInvitations',
    method: 'getMe',
    apiLibraryArgs: {},
  });

  const removeMutation = useApiMutation({
    service: 'workspaces',
    method: 'removeUserFromWorkspace',
  });
  const { data: workspaceUsers, isLoading: isLoadingUsers } = useApiQuery({
    service: 'workspaceUsers',
    method: 'getList',
    apiLibraryArgs: {},
  });

  return (
    <PageLayout
      title="Team Members"
      subtitle="Collaborate on projects as a team."
      actions={
        (!isLoadingWorkspaceInvitations &&
          enabledFeatures?.TEAMS &&
          workspaceInvitations?.length !== 0 && (
            <WorkspaceInvitationsDialog invitations={workspaceInvitations!} />
          ),
        currentWorkspaceUser?.roles.includes('MAINTAINER')
          ? [
              <Dialog>
                <Dialog.Trigger asChild>
                  <Button className="space-x-2">
                    <Icons.plusUser className="w-4 h-4" />
                    <span>Invite</span>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <InviteUsertoWorkspaceForm />
                </Dialog.Content>
              </Dialog>,
            ]
          : [])
      }
      className="space-y-6"
    >
      {isLoadingUsers || !workspaceUsers ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-[200px] lg:w-[250px]" />
          <GridLoader itemClassName="h-20" />
        </div>
      ) : (
        <>
          <Input
            type="search"
            placeholder="Search team..."
            className="py-2 w-[200px] lg:w-[250px] ml-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {workspaceUsers
              .filter(
                ({ user }) =>
                  user?.email
                    .toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase()) ||
                  user?.name
                    .toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase()),
              )
              .map((workspaceUser) => (
                <Card key={workspaceUser?.user?.id} className="overflow-clip">
                  <Card.Header className="relative flex flex-row justify-between">
                    <Card.Title className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10 rounded-full border">
                        <Avatar.Image
                          src={workspaceUser?.profileImageUrl ?? undefined}
                        />
                        <Avatar.Fallback>
                          {workspaceUser?.user?.name.charAt(0).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div>{workspaceUser?.user?.name}</div>
                        <Card.Description>
                          {workspaceUser?.user?.email}
                        </Card.Description>
                      </div>
                    </Card.Title>
                    {currentWorkspaceUser?.roles.includes('MAINTAINER') && (
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                          >
                            <DotsHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                          <AlertDialog>
                            <AlertDialog.Trigger asChild>
                              <DropdownMenu.Item
                                disabled={
                                  workspaceUser.id === currentWorkspaceUser.id
                                }
                                onSelect={(e) => e.preventDefault()}
                              >
                                Remove
                              </DropdownMenu.Item>
                            </AlertDialog.Trigger>
                            <AlertDialog.Content>
                              <AlertDialog.Header>
                                <AlertDialog.Title>
                                  Remove User
                                </AlertDialog.Title>
                                <AlertDialog.Description>
                                  Are you sure you want to remove this user from
                                  this workspace?
                                </AlertDialog.Description>
                              </AlertDialog.Header>
                              <AlertDialog.Footer>
                                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                <AlertDialog.Action
                                  loading={isRemoving}
                                  onClick={async () => {
                                    setIsRemoving(true);
                                    await removeMutation.mutateAsync(
                                      {
                                        workspaceUserId: workspaceUser?.id,
                                      },
                                      {
                                        onSuccess: () => {
                                          toast({
                                            title:
                                              'User removed from workspace',
                                          });
                                        },
                                        onSettled: () => {
                                          setIsRemoving(false);
                                        },
                                      },
                                    );
                                  }}
                                >
                                  Remove
                                </AlertDialog.Action>
                              </AlertDialog.Footer>
                            </AlertDialog.Content>
                          </AlertDialog>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    )}
                  </Card.Header>
                </Card>
              ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}

function WorkspaceInvitationsDialog({
  invitations,
}: {
  invitations: WorkspaceInvitation[];
}) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const deleteMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'delete',
  });

  const acceptMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'acceptInvitation',
  });

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button
          variant={'expandIconOutline'}
          Icon={Icons.eyeOpen}
          iconPlacement="right"
        >
          Invitations
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <ListView className="p-6 max-h-[500px] h-full">
          <ListView.Header>
            <ListView.Title>Workspace Invitations</ListView.Title>
            <ListView.Description>
              Manage your workspace invitations.
            </ListView.Description>
          </ListView.Header>
          <ListView.Body>
            {invitations.map((invitation) => (
              <ListView.Row
                key={invitation.id}
                className="flex justify-between items-center"
              >
                <ListView.Title>{invitation.workspace.name}</ListView.Title>
                <div className="flex space-x-2 items-center">
                  <Button
                    variant="ghost"
                    size={'sm'}
                    loading={isDeleting}
                    disabled={isDeleting || isAccepting}
                    onClick={async () => {
                      setIsDeleting(true);
                      await deleteMutation.mutateAsync(
                        { id: invitation.id },
                        {
                          onSuccess: () => {
                            toast({
                              title: 'Workspace invitation deleted',
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
                  </Button>
                  <Button
                    size={'sm'}
                    loading={isAccepting}
                    disabled={isAccepting || isDeleting}
                    onClick={async () => {
                      setIsAccepting(true);
                      await acceptMutation.mutateAsync(
                        { id: invitation.id },
                        {
                          onSuccess: () => {
                            toast({
                              title: 'Workspace invitation accepted',
                            });
                          },
                          onSettled: () => {
                            setIsAccepting(false);
                          },
                        },
                      );
                    }}
                  >
                    Accept
                  </Button>
                </div>
              </ListView.Row>
            ))}
          </ListView.Body>
        </ListView>
      </Dialog.Content>
    </Dialog>
  );
}
