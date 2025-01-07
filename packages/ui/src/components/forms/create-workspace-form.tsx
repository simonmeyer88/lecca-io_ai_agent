import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import { useUser } from '../../hooks/useUser';
import {
  CreateWorkspaceType,
  createWorkspaceSchema,
} from '../../models/workspace-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

type CreateWorkspaceFormProps = {
  closeDialog?: () => void;
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const navigate = useNavigate();
  const { initializeUserContextData } = useUser();
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const form = useForm<CreateWorkspaceType>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const CreateWorkspaceMutation = useApiMutation({
    service: 'workspaces',
    method: 'create',
  });

  const onSubmit = async (values: CreateWorkspaceType) => {
    setCreateStatus('loading');
    await CreateWorkspaceMutation.mutateAsync(
      {
        data: {
          ...values,
        },
      },
      {
        onSuccess: async () => {
          //Initialize the user context data with the new workspace
          props.closeDialog?.();
          await initializeUserContextData();
          navigate('/', { replace: true });
          setCreateStatus('success');
        },
        onError: () => {
          setCreateStatus('error');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {createStatus === 'success' ? (
          <SuccessFormContent />
        ) : createStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>New Workspace</Form.Title>
              <Form.Subtitle>
                Create a new workspace to collaborate with your team.
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Workspace Name</Form.Label>
                    <Form.Control>
                      <Input
                        {...form.register('name', {
                          required: true,
                        })}
                        {...field}
                        placeholder="Add a name"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...form.register('description', {
                          required: true,
                        })}
                        {...field}
                        placeholder="Describe your workspace"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Form.Content>
            <Form.Footer className="space-x-4 flex justify-end w-full">
              <Form.Description className="text-xs text-muted-foreground">
                Only your original workspace will receive credits on the free
                tier.
              </Form.Description>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                variant="default"
                loading={createStatus === 'loading'}
                disabled={!form.formState.isValid}
              >
                Create
              </Button>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
  );
}

function SuccessFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Workspace created</Form.Title>
          <Form.Description>
            Invite your team members to start collaborating.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
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
          <Form.Title>Workspace creation failed</Form.Title>
          <Form.Description className="text-center">
            Could not create a workspace. Please try again.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}
