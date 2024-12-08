import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import {
  CreateProjectType,
  createProjectSchema,
} from '@/models/project/project-model';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

type CreateProjectFormProps = {
  /**
   * Start your relative path with a `/` to make it relative to the project ID.
   */
  redirectRelativeToProjectIdPath?: `/${string}`;
};

export function CreateProjectForm(props: CreateProjectFormProps) {
  const navigate = useNavigate();

  //Only getting projects to get the count of projects. Projects should be cached already.
  //If this is a new workspace, then the request will be quick since there will be no data.
  //Don't have to include 'all' argument since this limit only exists on starter accounts.
  const { data: projects } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const form = useForm<CreateProjectType>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createProjectMutation = useApiMutation({
    service: 'projects',
    method: 'create',
  });

  const onSubmit = async (values: CreateProjectType) => {
    setCreateStatus('loading');
    await createProjectMutation.mutateAsync(
      {
        data: {
          ...values,
        },
      },
      {
        onSuccess: (data) => {
          if (props.redirectRelativeToProjectIdPath) {
            navigate(
              `/projects/${data.id}${props.redirectRelativeToProjectIdPath}`,
            );
          } else {
            navigate(`/projects/${data.id}`);
          }
          setCreateStatus('success');
        },
        onError: () => {
          setCreateStatus('error');
        },
      },
    );
  };

  if (!projects) {
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
              <Form.Title>New Project</Form.Title>
              <Form.Subtitle>
                Build your automation and AI tools within your projects.
              </Form.Subtitle>
              <Form.Subtitle>
                Resources assigned to a project, are only available within that
                project.
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Project Name</Form.Label>
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
                        placeholder="Describe your project"
                      />
                    </Form.Control>
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
          <Form.Title>Project created</Form.Title>
          <Form.Description>
            You can now start building workflows within this project.
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
          <Form.Title>Project creation failed</Form.Title>
          <Form.Description className="text-center">
            Could not create a project. Please try again.
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
