import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import {
  UpdateConnectionType,
  updateConnectionSchema,
} from '@/models/connections-model';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';

export function UpdateConnectionForm({
  connectionId,
}: {
  connectionId: string;
}) {
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const { data: connection } = useApiQuery({
    service: 'connections',
    method: 'getById',
    apiLibraryArgs: {
      id: connectionId,
    },
  });

  const form = useForm<UpdateConnectionType>({
    resolver: zodResolver(updateConnectionSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const mutation = useApiMutation({
    service: 'connections',
    method: 'update',
    apiLibraryArgs: {
      id: connectionId,
    },
  });

  useEffect(() => {
    if (connection) {
      form.reset({
        name: connection.name,
        description: connection.description ?? '',
      });
    }
  }, [connection, form]);

  const onSubmit = async (values: UpdateConnectionType) => {
    setUpdateStatus('loading');
    await mutation.mutateAsync(
      {
        data: {
          ...values,
        },
      },
      {
        onSuccess: () => {
          setUpdateStatus('success');
        },
        onError: () => {
          setUpdateStatus('error');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {updateStatus === 'success' ? (
          <SuccessFormContent />
        ) : updateStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Update Connection</Form.Title>
            </Form.Header>
            <Form.Content className="space-y-6">
              <SharedFields form={form} />
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                variant="default"
                loading={updateStatus === 'loading'}
                disabled={!form.formState.isValid || updateStatus === 'loading'}
              >
                Save
              </Button>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
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
          <Form.Title>Success</Form.Title>
          <Form.Description>
            You have successfully updated the connection.
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
          <Form.Title>Connection update failed</Form.Title>
          <Form.Description className="text-center">
            Could not update a connection. Please try again.
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
