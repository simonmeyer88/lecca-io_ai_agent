import { zodResolver } from '@hookform/resolvers/zod';
import { isValid } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '../../api/use-api-mutation';
import {
  CreateVariableType,
  Variable,
  createVariableSchema,
} from '../../models/variable-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { DateTimePicker } from '../ui/date-time-picker';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Tabs } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

import { SelectProjectField } from './select-project-form-field';

export function CreateVariableForm() {
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const form = useForm<CreateVariableType>({
    resolver: zodResolver(createVariableSchema),
    defaultValues: {
      name: '',
      description: '',
      value: '',
      type: 'workspace',
      dataType: 'string',
    },
  });

  const createVariableMutation = useApiMutation({
    service: 'variables',
    method: 'create',
  });

  const onSubmit = async (data: CreateVariableType) => {
    setCreateStatus('loading');
    await createVariableMutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: () => {
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
              <Form.Title>New Variable</Form.Title>
              <Form.Subtitle>
                Setup variables to quickly reuse in your workflows.
              </Form.Subtitle>
            </Form.Header>

            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Variable Name</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Add a name" />
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
                        {...field}
                        placeholder="Describe your variable"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Tabs
                defaultValue="string"
                onValueChange={(value) => {
                  form.setValue('dataType', value as Variable['dataType']);
                  form.setValue('value', '');
                }}
              >
                <Tabs.List>
                  <Tabs.Trigger value="string">Text</Tabs.Trigger>
                  <Tabs.Trigger value="number">Number</Tabs.Trigger>
                  <Tabs.Trigger value="boolean">True/False</Tabs.Trigger>
                  <Tabs.Trigger value="date">Date</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="string">
                  <Form.Field
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <Form.Item>
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
                </Tabs.Content>
                <Tabs.Content value="number">
                  <Form.Field
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <Form.Item>
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
                </Tabs.Content>
                <Tabs.Content value="boolean">
                  <Form.Field
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Control>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                          >
                            <Select.Trigger>
                              <Select.Value
                                placeholder={
                                  field.value
                                    ? (field.value as string)
                                    : 'Select a value'
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
                </Tabs.Content>
                <Tabs.Content value="date">
                  <Form.Field
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Control>
                          <DateTimePicker
                            value={
                              isValid(new Date(field.value as string))
                                ? new Date(field.value as string)
                                : undefined
                            }
                            hourCycle={12}
                            granularity="minute"
                            placeholder={'Pick a date'}
                            onChange={(date) => field.onChange(date)}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </Tabs.Content>
              </Tabs>
              <SelectProjectField form={form} />
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
          <Form.Title>Variable created</Form.Title>
          <Form.Description>
            You can now start using this variable within your workflows.
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
          <Form.Title>Variable creation failed</Form.Title>
          <Form.Description className="text-center">
            Could not create variable. Please try again.
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
