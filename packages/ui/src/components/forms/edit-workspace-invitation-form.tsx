import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '../../api/use-api-mutation';
import { useToast } from '../../hooks/useToast';
import {
  UpdateWorkspaceInvitationType,
  WorkspaceInvitation,
  updateWorkspaceInvitationSchema,
} from '../../models/workspace-invitation-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Select } from '../ui/select';

type EditWorkspaceInvitationFormProps = {
  workspaceInvitation: WorkspaceInvitation;
};

export function EditWorkspaceInvitationForm(
  props: EditWorkspaceInvitationFormProps,
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
  const updateWorkspaceInvitationMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'update',
    apiLibraryArgs: {
      id: props.workspaceInvitation.id,
    },
  });
  const deleteWorkspaceInvitationMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'delete',
    apiLibraryArgs: {
      id: props.workspaceInvitation.id,
    },
  });

  const form = useForm<UpdateWorkspaceInvitationType>({
    resolver: zodResolver(updateWorkspaceInvitationSchema),
    defaultValues: {
      roles: props.workspaceInvitation.roles,
    },
  });

  const onEdit = async (data: UpdateWorkspaceInvitationType) => {
    setStatus('loadingEdit');
    await updateWorkspaceInvitationMutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: () => {
          toast({ title: 'Workspace invitation updated' });
          setStatus('successfulEdit');
        },
        onError: () => {
          setStatus('error');
        },
      },
    );
  };

  const onDelete = async () => {
    setStatus('loadingDelete');
    await deleteWorkspaceInvitationMutation.mutateAsync(
      {},
      {
        onSuccess: () => {
          toast({ title: 'Workspace invitation deleted' });
          setStatus('succesfulDelete');
        },
        onError: () => {
          setStatus('error');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onEdit)} className="w-full">
        {status === 'successfulEdit' ? (
          <SuccessfulEditFormContent />
        ) : status === 'succesfulDelete' ? (
          <SuccessfulDeleteFormContent />
        ) : status === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Edit invitation</Form.Title>
              <Form.Description className="flex flex-col">
                <span>{props.workspaceInvitation.email}</span>
              </Form.Description>
            </Form.Header>
            <Form.Content>
              <Form.Field
                control={form.control}
                name="roles"
                render={({ field }) => {
                  //
                  return (
                    <Form.Item>
                      <Form.Label>Role</Form.Label>
                      <Form.Control>
                        <Select
                          onValueChange={(value) => {
                            field.onChange([value]);
                          }}
                        >
                          <Select.Trigger>
                            <Select.Value
                              placeholder={
                                field.value.length
                                  ? field.value[0].charAt(0).toUpperCase() +
                                    field.value[0].slice(1).toLocaleLowerCase()
                                  : 'Select a role'
                              }
                            />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="MAINTAINER">
                              Maintainer
                            </Select.Item>
                            <Select.Item value="MEMBER">Member</Select.Item>
                          </Select.Content>
                        </Select>
                      </Form.Control>
                    </Form.Item>
                  );
                }}
              />
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onDelete)}
                  variant="destructive"
                  loading={status === 'loadingDelete'}
                >
                  Delete
                </Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onEdit)}
                  variant="default"
                  loading={status === 'loadingEdit'}
                  disabled={!form.formState.isValid}
                >
                  Save
                </Button>
              </Dialog.Close>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
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
            We've updated the invitation to this workspace.
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
            We've deleted the invitation to this workspace.
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
