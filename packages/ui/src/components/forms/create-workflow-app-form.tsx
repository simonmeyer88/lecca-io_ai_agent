import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import {
  CreateWorkflowAppType,
  createWorkflowAppSchema,
} from '../../models/workflow/workflow-app-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export function CreateWorkflowAppForm() {
  const navigate = useNavigate();
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const form = useForm<CreateWorkflowAppType>({
    resolver: zodResolver(createWorkflowAppSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
    },
  });

  const createWorkflowAppMutation = useApiMutation({
    service: 'workflowApps',
    method: 'create',
  });

  const onSubmit = async (values: CreateWorkflowAppType) => {
    setCreateStatus('loading');
    await createWorkflowAppMutation.mutateAsync(
      {
        data: {
          ...values,
        },
      },
      {
        onSuccess: (data) => {
          navigate(`/apps/${data.id}`);
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
              <Form.Title>New App</Form.Title>
              <Form.Subtitle>
                Build a custom app to automate your workflows.
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>App Name</Form.Label>
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
                        placeholder="Describe your app"
                        maxLength={255}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="logoUrl"
                render={() => (
                  //     {
                  //     field
                  // }
                  <Form.Item>
                    <Form.Label>Logo</Form.Label>
                    <Form.Control></Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  variant="default"
                  loading={createStatus === 'loading'}
                  disabled={!form.formState.isValid}
                >
                  Create
                </Button>
              </Dialog.Close>
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
          <Form.Title>App created</Form.Title>
          <Form.Description>
            Add some actions and triggers to your app.
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
          <Form.Title>App creation failed</Form.Title>
          <Form.Description className="text-center">
            Could not create app. Please try again.
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
