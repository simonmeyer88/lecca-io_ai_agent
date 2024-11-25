import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import {
  CreateKnowledgeType,
  createKnowledgeSchema,
} from '@/models/knowledge-model';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

import { SelectProjectField } from './select-project-form-field';

export function CreateKnowledgeForm() {
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  //Only getting projects to get the count of projects. Projects should be cached already.
  //If this is a new workspace, then the request will be quick since there will be no data.
  const { data: knowledge } = useApiQuery({
    service: 'knowledge',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const form = useForm<CreateKnowledgeType>({
    resolver: zodResolver(createKnowledgeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createKnowledgeMutation = useApiMutation({
    service: 'knowledge',
    method: 'create',
  });

  const onSubmit = async (data: CreateKnowledgeType) => {
    setCreateStatus('loading');
    await createKnowledgeMutation.mutateAsync(
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

  if (!knowledge) {
    return (
      <div>
        <Form.Header className="relative flex items-center justify-center">
          <Icons.spinner className="animate-spin" />
        </Form.Header>
      </div>
    );
  }

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
              <Form.Title>New Knowledge</Form.Title>
              <Form.Subtitle>
                Create knowledge notebooks that can be accessed by your AI
                Agents
              </Form.Subtitle>
            </Form.Header>

            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Knowledge Notebook Name</Form.Label>
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
                        placeholder="Add optional description"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
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
          <Form.Title>Knowledge created</Form.Title>
          <Form.Description>
            You can now enable this knowledge for your AI Agents
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
          <Form.Title>Knowledge creation failed</Form.Title>
          <Form.Description className="text-center">
            Could not create knowledge. Please try again.
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
