import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';

import { appQueryClient } from '../../api/api-library';
import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import {
  CreateConnectionType,
  createConnectionSchema,
} from '../../models/connections-model';
import { WorkflowApp } from '../../models/workflow/workflow-app-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { ComboBox } from '../ui/combo-box';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Tabs } from '../ui/tabs';

import { SelectProjectField } from './select-project-form-field';

export function CreateConnectionForm({
  workflowApp,
}: {
  workflowApp?: WorkflowApp;
}) {
  const [selectedWorkflowApp, setSelectedWorkflowApp] = useState<WorkflowApp>();
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const { data: workflowApps, isLoading: workflowAppsLoading } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
    reactQueryArgs: {
      queries: {
        staleTime: 1000 * 60 * 60, //60 minutes
      },
    },
  });

  const form = useForm<CreateConnectionType>({
    resolver: zodResolver(createConnectionSchema),
    defaultValues: {
      name: '',
      workflowAppId: workflowApp?.id ?? '',
    },
  });
  const selectedWorkflowAppId = form.watch('workflowAppId');

  const mutation = useApiMutation({
    service: 'workflowApps',
    method: 'connectApp',
    apiLibraryArgs: {},
  });

  useEffect(() => {
    if (selectedWorkflowAppId) {
      const selectedId = selectedWorkflowAppId;
      setSelectedWorkflowApp(
        workflowApps?.find((app) => app.id === selectedId),
      );
      form.setValue('connectionId', selectedWorkflowApp?.connections[0]?.id);
    }
  }, [
    form,
    selectedWorkflowApp?.connections,
    selectedWorkflowAppId,
    workflowApp,
    workflowApps,
  ]);

  useEffect(() => {
    //The server is going to send a postMessage with the data 'authSuccess' when the connection is created
    //This is used for oauth that has a callback
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_SERVER_URL) {
        return; // Ignore messages from unknown sources
      }

      if (event.data === 'authSuccess') {
        appQueryClient
          .invalidateQueries({
            queryKey: ['connections', 'getList'],
          })
          .then(() => {
            setCreateStatus('success');
          });
      }
    };

    window.addEventListener('message', messageListener, false);

    return () => {
      window.removeEventListener('message', messageListener, false);
    };
  }, []);

  const onSubmit = async (values: CreateConnectionType) => {
    setCreateStatus('loading');
    await mutation.mutateAsync(
      {
        appId: values.workflowAppId,
        connectionId: values.connectionId,
        data: {
          ...values,
        },
      },
      {
        onSuccess: (data) => {
          if (data.authorizeUrl) {
            window.open(data.authorizeUrl);
          } else {
            setCreateStatus('success');
          }
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
              <Form.Title>Create Connection</Form.Title>
              {!workflowApp && !form.getValues().workflowAppId && (
                <Form.Subtitle>Select an app first.</Form.Subtitle>
              )}
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="workflowAppId"
                render={({ field }) => (
                  <Form.Item className="flex flex-col">
                    <Form.Label>Workflow App</Form.Label>
                    <Form.Control>
                      {workflowAppsLoading ? (
                        <Skeleton className="w-full h-10" />
                      ) : (
                        <ComboBox
                          dropdownWidthMatchesButton
                          onChange={field.onChange}
                          defaultSelectedItem={
                            workflowApp && {
                              label: workflowApp.name,
                              value: workflowApp.id,
                            }
                          }
                          items={workflowApps!
                            .filter((app) => app.isPublished)
                            .map((app) => ({
                              label: app.name,
                              value: app.id,
                              prefix: (
                                <img
                                  src={app?.logoUrl}
                                  alt={app?.name}
                                  className="size-5 bg-white rounded p-0.5"
                                />
                              ),
                            }))}
                        />
                      )}
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {selectedWorkflowApp && (
                <>
                  <SharedFields form={form} />
                  <Tabs
                    defaultValue={selectedWorkflowApp.connections[0]?.id}
                    onValueChange={(connectionId) =>
                      form.setValue('connectionId', connectionId)
                    }
                  >
                    <Tabs.List className="mb-2">
                      {selectedWorkflowApp?.connections.map((connection) => {
                        return (
                          <Tabs.Trigger
                            key={connection.id}
                            value={connection.id}
                          >
                            {connection.name}
                          </Tabs.Trigger>
                        );
                      })}
                    </Tabs.List>
                    {selectedWorkflowApp?.connections.map((connection) => {
                      switch (connection.connectionType) {
                        case 'oauth2':
                          return (
                            <Tabs.Content
                              key={connection.id}
                              value={connection.id}
                              className="space-y-4"
                            >
                              <OAuth2Content />
                            </Tabs.Content>
                          );
                        case 'apiKey':
                          return (
                            <Tabs.Content
                              key={connection.id}
                              value={connection.id}
                              className="space-y-4"
                            >
                              <ApiKeyContent form={form} />
                            </Tabs.Content>
                          );
                        case 'basic':
                          return (
                            <Tabs.Content
                              key={connection.id}
                              value={connection.id}
                              className="space-y-4"
                            >
                              <BasicAuthContent form={form} />
                            </Tabs.Content>
                          );
                        case 'keyPair':
                          return (
                            <Tabs.Content
                              key={connection.id}
                              value={connection.id}
                              className="space-y-4"
                            >
                              <KeyPairContent form={form} />
                            </Tabs.Content>
                          );
                        default:
                          return null;
                      }
                    })}
                  </Tabs>
                  <SelectProjectField form={form} />
                </>
              )}
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                variant="default"
                loading={createStatus === 'loading'}
                disabled={!form.formState.isValid || createStatus === 'loading'}
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

function OAuth2Content() {
  return (
    <Form.Description>
      Clicking <strong>Create</strong> will open a new window where you can
      authorize the connection to the selected app.
    </Form.Description>
  );
}

function ApiKeyContent({ form }: { form: UseFormReturn & any }) {
  return (
    <Form.Field
      control={form.control}
      name="apiKey"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>API Key</Form.Label>
          <Form.Control>
            <Input
              value={field.value ?? ''}
              placeholder="Add your API Key"
              {...form.register('apiKey', {
                required: true,
              })}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

function BasicAuthContent({ form }: { form: UseFormReturn & any }) {
  return (
    <>
      <Form.Field
        control={form.control}
        name="username"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Username</Form.Label>
            <Form.Message />
            <Form.Control>
              <Input
                value={field.value ?? ''}
                placeholder="Username for authenticating"
                {...form.register('username', {
                  required: true,
                })}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="password"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Password</Form.Label>
            <Form.Message />
            <Form.Control>
              <Input
                value={field.value ?? ''}
                placeholder="Password for authenticating"
                {...form.register('password', {
                  required: true,
                })}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </>
  );
}

function KeyPairContent({ form }: { form: UseFormReturn & any }) {
  return (
    <>
      <Form.Field
        control={form.control}
        name="publicKey"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Public Key</Form.Label>
            <Form.Message />
            <Form.Control>
              <Input
                value={field.value ?? ''}
                placeholder="Add key"
                {...form.register('publicKey', {
                  required: true,
                })}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="privateKey"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Private/Secret Key</Form.Label>
            <Form.Message />
            <Form.Control>
              <Input
                value={field.value ?? ''}
                placeholder="Add key"
                {...form.register('privateKey', {
                  required: true,
                })}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </>
  );
}

function SharedFields({ form }: { form: UseFormReturn & any }) {
  return (
    <>
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Connection Name</Form.Label>
            <Form.Control>
              <Input
                value={field.value ?? ''}
                placeholder="Add a name"
                {...form.register('name', {
                  required: true,
                })}
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
              <Input
                placeholder="Describe your connection"
                {...field}
                value={field.value ?? ''}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
}

function SuccessFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Connection created</Form.Title>
          <Form.Description>
            You can now use this connection in your workflows and agents.
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
          <Form.Title>Connection creation failed</Form.Title>
          <Form.Description className="text-center">
            Could not create a connection. Please try again.
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
