import { useState } from 'react';
import { Link } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { CreateProjectForm } from '../../components/forms/create-project-form';
import { InviteUsertoWorkspaceForm } from '../../components/forms/invite-user-to-workspace-form';
import { SelectProjectForAgentForm } from '../../components/forms/select-project-for-agent-form';
import { SelectProjectForWorkflowForm } from '../../components/forms/select-project-for-workflow-form';
import { Icons } from '../../components/icons';
import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { ListView } from '../../components/ui/list-view';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useToast } from '../../hooks/useToast';
import { useUser } from '../../hooks/useUser';
import { WorkspaceInvitation } from '../../models/workspace-invitation-model';
import { Workspace } from '../../models/workspace-model';

import { HomeSection } from './components/home-section';
import { HomeSectionRecentWorkflows } from './components/home-sections/home-section-recent-workflows';
import { LearningContentCarousel } from './components/learning-content-carousel';
import { TemplateCarousel } from './components/template-carousel';

export default function HomePage() {
  const { workspace, workspaceUser, enabledFeatures } = useUser();

  const {
    data: workspaceInvitations,
    isLoading: isLoadingWorkspaceInvitations,
  } = useApiQuery({
    service: 'workspaceInvitations',
    method: 'getMe',
    apiLibraryArgs: {},
  });

  const { data: templates } = useApiQuery({
    service: 'workflowTemplates',
    method: 'getSharedList',
    apiLibraryArgs: {
      config: {
        sharedToType: 'global',
      },
    },
  });

  return (
    <ScrollArea>
      <main className="w-full max-w-full flex flex-col items-center justify-start mb-20 overflow-x-auto">
        <HomeSection className="mb-8 mt-8">
          <div className="flex items-center justify-between w-full">
            <WorkspaceHeader
              workspace={workspace as Workspace}
              link={!!workspaceUser?.roles.includes('MAINTAINER')}
            />
            <div className="hidden items-center space-x-4 lg:flex sm:ml-5">
              {!isLoadingWorkspaceInvitations &&
                workspaceInvitations?.length !== 0 && (
                  <WorkspaceInvitationsDialog
                    invitations={workspaceInvitations!}
                  />
                )}
              {workspaceUser?.roles?.includes('MAINTAINER') && (
                <Dialog>
                  <Dialog.Trigger asChild>
                    <Button variant={'outline'} className="space-x-2">
                      <Icons.plusUser className="w-4 h-4" />
                      <span>Invite</span>
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <InviteUsertoWorkspaceForm />
                  </Dialog.Content>
                </Dialog>
              )}
              {enabledFeatures.AGENTS && (
                <Dialog>
                  <Dialog.Trigger asChild>
                    <Button
                      variant={'expandIconOutline'}
                      Icon={Icons.plus}
                      iconPlacement="right"
                    >
                      Agent
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <SelectProjectForAgentForm />
                  </Dialog.Content>
                </Dialog>
              )}

              {enabledFeatures.WORKFLOWS && (
                <Dialog>
                  <Dialog.Trigger asChild>
                    <Button
                      variant={'expandIconOutline'}
                      Icon={Icons.plus}
                      iconPlacement="right"
                    >
                      Workflow
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <SelectProjectForWorkflowForm />
                  </Dialog.Content>
                </Dialog>
              )}
              <Dialog>
                <Dialog.Trigger asChild>
                  <Button
                    variant={'expandIcon'}
                    Icon={Icons.plus}
                    iconPlacement="right"
                  >
                    Project
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <CreateProjectForm />
                </Dialog.Content>
              </Dialog>
            </div>
          </div>
        </HomeSection>

        <HomeSection>
          <HomeSectionRecentWorkflows />
        </HomeSection>

        {templates && templates.length > 0 && (
          <HomeSection className="flex flex-col items-center my-8">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-bold space-x-2 mb-4">
                Popular Templates
              </h2>
              <Button variant={'link'} size="sm" className="p-0 h-2">
                <Link to="/workflow-templates">View all</Link>
              </Button>
            </div>
            <TemplateCarousel />
          </HomeSection>
        )}

        <HomeSection className="flex flex-col items-center my-8">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-2xl font-bold space-x-2 mb-4">Tutorials</h2>
          </div>
          <LearningContentCarousel />
        </HomeSection>
      </main>
    </ScrollArea>
  );
}

function WorkspaceHeader({
  workspace,
  link,
}: {
  workspace: Workspace;
  link: boolean;
}) {
  return link ? (
    <Link to="/workspace-settings">
      <div className="flex items-center space-x-6">
        <Avatar className="size-20 rounded-full border relative">
          <Avatar.Image src={workspace?.logoUrl} />
          <Avatar.Fallback className="text-3xl cursor-pointer">
            {workspace.name?.[0]}
          </Avatar.Fallback>
        </Avatar>
        <h2 className="text-xl sm:text-3xl font-bold hover:underline">
          {workspace!.name}
        </h2>
      </div>
    </Link>
  ) : (
    <div className="flex items-center space-x-6">
      {workspace?.logoUrl && (
        <Avatar className="size-20 rounded-full border relative">
          <Avatar.Image src={workspace?.logoUrl} />
          <Avatar.Fallback className="text-3xl">
            {workspace.name?.[0]}
          </Avatar.Fallback>
        </Avatar>
      )}
      <h2 className="text-xl sm:text-3xl font-bold">{workspace!.name}</h2>
    </div>
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
