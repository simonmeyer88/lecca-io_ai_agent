import { useState } from 'react';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { CreateProjectForm } from '../../components/forms/create-project-form';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { ListView } from '../../components/ui/list-view';
import { useToast } from '../../hooks/useToast';
import { ProjectInvitation } from '../../models/project/project-invitation-model';

import ProjectsTable from './components/table/projects-table';

export default function ProjectsPage() {
  const { data: projectInvitations } = useApiQuery({
    service: 'projectInvitations',
    method: 'getMe',
    apiLibraryArgs: {},
  });

  return (
    <PageLayout
      title="Projects"
      subtitle="Manage your agents and workflows within your projects"
      actions={[
        ...(projectInvitations?.length
          ? [<ProjectInvitationsDialog invitations={projectInvitations} />]
          : []),
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.plus}
              iconPlacement="right"
            >
              New Project
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreateProjectForm />
          </Dialog.Content>
        </Dialog>,
      ]}
    >
      <ProjectsTable />
    </PageLayout>
  );
}

function ProjectInvitationsDialog({
  invitations,
}: {
  invitations: ProjectInvitation[];
}) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const deleteMutation = useApiMutation({
    service: 'projectInvitations',
    method: 'delete',
  });

  const acceptMutation = useApiMutation({
    service: 'projectInvitations',
    method: 'accept',
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
            <ListView.Title>Project Invitations</ListView.Title>
            <ListView.Description>
              Manage your project invitations.
            </ListView.Description>
          </ListView.Header>
          <ListView.Body>
            {invitations.map((invitation) => (
              <ListView.Row
                key={invitation.id}
                className="flex justify-between items-center"
              >
                <ListView.Title>{invitation.project.name}</ListView.Title>
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
                              title: 'Project invitation accepted',
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
