import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import { useUser } from '../../hooks/useUser';
import { WorkspaceInvitation } from '../../models/workspace-invitation-model';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function JoinWorkspaceForm({
  invitation,
}: {
  invitation: WorkspaceInvitation;
}) {
  const navigate = useNavigate();
  const { initializeUserContextData } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const joinWorkspaceMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'acceptInvitation',
    apiLibraryArgs: {
      id: invitation.id,
    },
  });

  const deleteWorkspaceInvitationMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'declineInvitation',
    apiLibraryArgs: {
      id: invitation.id,
    },
  });

  return (
    <Card>
      <Card.Header>
        <Card.Title>Join {invitation.workspace.name}</Card.Title>
        <Card.Description>
          You've been invited to join this workspace. Join to collaborate on
          projects and access shared resources.
        </Card.Description>
      </Card.Header>
      <Card.Footer className="space-x-2 flex justify-end">
        <Button
          variant={'outline'}
          onClick={async () => {
            setIsDeleting(true);
            await deleteWorkspaceInvitationMutation.mutateAsync(
              {},
              {
                onSettled: async () => {
                  setIsDeleting(false);
                },
              },
            );
          }}
          disabled={isJoining}
          loading={isDeleting}
        >
          Decline
        </Button>
        <Button
          onClick={async () => {
            setIsJoining(true);
            await joinWorkspaceMutation.mutateAsync(
              {},
              {
                onSuccess: async () => {
                  await initializeUserContextData();
                  navigate('/', { replace: true });
                },
              },
            );
          }}
          disabled={isDeleting}
          loading={isJoining}
        >
          Accept
        </Button>
      </Card.Footer>
    </Card>
  );
}
