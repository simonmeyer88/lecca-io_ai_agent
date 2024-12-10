import { zodResolver } from '@hookform/resolvers/zod';
import { isValid } from 'date-fns';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import {
  UpdateVariableType,
  Variable,
  updateVariableSchema,
} from '../../models/variable-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { DateTimePicker } from '../ui/date-time-picker';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

export function UpdateVariableForm({ variableId }: { variableId: string }) {
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const { data: variable } = useApiQuery({
    service: 'variables',
    method: 'getById',
    apiLibraryArgs: {
      id: variableId,
    },
  });

  const form = useForm<UpdateVariableType>({
    resolver: zodResolver(updateVariableSchema),
    defaultValues: {
      name: '',
      description: '',
      value: '',
    },
  });

  const mutation = useApiMutation({
    service: 'variables',
    method: 'update',
    apiLibraryArgs: {
      id: variableId,
    },
  });

  useEffect(() => {
    if (variable) {
      form.reset({
        name: variable.name,
        description: variable.description ?? '',
        value: variable.value,
      });
    }
  }, [variable, form]);

  const onSubmit = async (values: UpdateVariableType) => {
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
              <Form.Title>Update Variable</Form.Title>
            </Form.Header>
            <Form.Content className="space-y-6">
              <SharedFields form={form} />
              {variable && (
                <DataField form={form} dataType={variable.dataType} />
              )}
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

function DataField({
  form,
  dataType,
}: {
  form: UseFormReturn & any;
  dataType: Variable['dataType'];
}) {
  //HACK TO GET THE FORM TO RERENDER
  form.getValues();

  switch (dataType) {
    case 'string':
      return (
        <Form.Field
          control={form.control}
          name="value"
          render={({ field }) => (
            <Form.Item className="flex flex-col space-y-3">
              <Form.Label>Text Value</Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  value={field.value as string}
                  placeholder="Add a value"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      );
    case 'number':
      return (
        <Form.Field
          control={form.control}
          name="value"
          render={({ field }) => (
            <Form.Item className="flex flex-col space-y-3">
              <Form.Label>Number Value</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  value={field.value as number}
                  placeholder="Add a value"
                  type="number"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      );
    case 'boolean':
      return (
        <Form.Field
          control={form.control}
          name="value"
          render={({ field }) => (
            <Form.Item className="flex flex-col space-y-3">
              <Form.Label>True/False Value</Form.Label>
              <Form.Control>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <Select.Trigger>
                    <Select.Value
                      placeholder={
                        field.value ? (field.value as string) : 'Select a value'
                      }
                    />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value={'true'}>True</Select.Item>
                    <Select.Item value={'false'}>False</Select.Item>
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
      );
    case 'date':
      return (
        <Form.Field
          control={form.control}
          name="value"
          render={({ field }) => {
            return (
              <Form.Item className="flex flex-col space-y-3">
                <Form.Label>Date Value</Form.Label>
                <Form.Control>
                  <DateTimePicker
                    value={
                      isValid(new Date(field.value))
                        ? new Date(field.value)
                        : undefined
                    }
                    hourCycle={12}
                    granularity="minute"
                    placeholder={'Pick a date'}
                    onChange={(date) => field.onChange(date)}
                  />
                </Form.Control>
              </Form.Item>
            );
          }}
        />
      );
  }
}

function SharedFields({ form }: { form: UseFormReturn & any }) {
  return (
    <>
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Variable Name</Form.Label>
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
                placeholder="Describe your variable"
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
            You have successfully updated the variable.
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
          <Form.Title>Variable update failed</Form.Title>
          <Form.Description className="text-center">
            Could not update a variable. Please try again.
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
