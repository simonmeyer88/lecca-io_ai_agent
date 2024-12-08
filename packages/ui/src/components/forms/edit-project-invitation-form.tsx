import { useState } from 'react';

import useApiMutation from '@/api/use-api-mutation';
import { useToast } from '@/hooks/useToast';
import { ProjectInvitation } from '@/models/project/project-invitation-model';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';

type EditProjectInvitationFormProps = {
  projectInvitation: ProjectInvitation;
};

export function EditProjectInvitationForm(
  props: EditProjectInvitationFormProps,
) {
  const { toast } = useToast();
  const [status, setStatus] = useState<
    | 'idle'
    | 'loadingEdit'
    | 'loadingDelete'
    | 'successfulEdit'
    | 'succesfulDelete'
    | 'error'
  >('idle');
  const deleteProjectInvitationMutation = useApiMutation({
    service: 'projectInvitations',
    method: 'delete',
    apiLibraryArgs: {
      id: props.projectInvitation.id,
    },
  });

  const onDelete = async () => {
    setStatus('loadingDelete');
    await deleteProjectInvitationMutation.mutateAsync(
      {},
      {
        onSuccess: () => {
          toast({ title: 'Project invitation deleted' });
          setStatus('succesfulDelete');
        },
        onError: () => {
          setStatus('error');
        },
      },
    );
  };

  return (
    <div className="w-full">
      {status === 'successfulEdit' ? (
        <SuccessfulEditFormContent />
      ) : status === 'succesfulDelete' ? (
        <SuccessfulDeleteFormContent />
      ) : status === 'error' ? (
        <ErrorFormContent />
      ) : (
        <>
          <Card.Header className="pb-5">
            <Card.Title>Edit invitation</Card.Title>
            <Card.Description className="flex flex-col">
              <span>{props.projectInvitation.workspaceUser.user.name}</span>
              <span>{props.projectInvitation.workspaceUser.user.email}</span>
            </Card.Description>
          </Card.Header>
          <Card.Content></Card.Content>
          <Card.Footer className="space-x-2 flex justify-end">
            <Dialog.Close asChild>
              <Button
                type="button"
                onClick={onDelete}
                variant="destructive"
                loading={status === 'loadingDelete'}
              >
                Delete
              </Button>
            </Dialog.Close>
          </Card.Footer>
        </>
      )}
    </div>
  );
}

function SuccessfulEditFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Invitation updated</Form.Title>
          <Form.Description>
            We've updated the invitation to this project.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline" type="button">
            Done
          </Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}

function SuccessfulDeleteFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Invitation deleted</Form.Title>
          <Form.Description>
            We've deleted the invitation to this project.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline" type="button">
            Done
          </Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}

function ErrorFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.x className="w-12 h-12 text-error" />
          <Form.Title>Something went wrong</Form.Title>
          <Form.Description className="text-center">
            Could not modify this invitation.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline" type="button">
            Done
          </Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}
