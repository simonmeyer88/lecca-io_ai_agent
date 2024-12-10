import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { useToast } from '../../hooks/useToast';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { ComboBox } from '../ui/combo-box';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';

import { CreateProjectForm } from './create-project-form';

const selectProjectForAgentSchema = z.object({
  projectId: z.string(),
  agentName: z.string(),
});

type SelectProjectType = z.infer<typeof selectProjectForAgentSchema>;

export function SelectProjectForAgentForm() {
  const { projectId } = useParams();
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const form = useForm<SelectProjectType>({
    resolver: zodResolver(selectProjectForAgentSchema),
    defaultValues: {
      agentName: '',
      projectId: projectId,
    },
  });

  //Only getting agents to get the count of agents. Agents should be cached already.
  //Don't have to include 'all' argument since this limit only exists on starter accounts.
  const { data: agents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: projects, isLoading: isLoadingProjects } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const createAgentMutation = useApiMutation({
    service: 'agents',
    method: 'create',
  });

  const onSubmit = async (values: SelectProjectType) => {
    setStatus('loading');

    const data = await createAgentMutation.mutateAsync(
      {
        projectId: values.projectId,
        data: {
          name: values.agentName,
        },
      },
      {
        onError: (error) => {
          toast({
            title: 'Error creating agent',
            description: error.message,
            variant: 'destructive',
          });
          setStatus('error');
        },
        onSuccess: () => {
          toast({
            title: 'Agent created',
          });
        },
      },
    );

    if (data?.id) {
      navigate(`/projects/${values.projectId}/agents/${data?.id}`);
    }
  };

  if (!agents) {
    return (
      <div>
        <Form.Header className="relative flex items-center justify-center">
          <Icons.spinner className="animate-spin" />
        </Form.Header>
      </div>
    );
  }

  return showCreateProjectForm ? (
    <CreateProjectForm />
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {status === 'success' ? (
          <SuccessFormContent />
        ) : status === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Select a Project</Form.Title>
              <Form.Description>
                Agents are created within a project.
              </Form.Description>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <div className="flex flex-col space-y-2">
                        {isLoadingProjects ? (
                          <>
                            <Form.Label>Project</Form.Label>
                            <Skeleton className="w-full h-10" />
                          </>
                        ) : projects?.length ? (
                          <>
                            <Form.Label>Project</Form.Label>
                            <div className="flex space-x-1 items-center">
                              <ComboBox
                                dropdownWidthMatchesButton
                                className="w-full flex justify-between"
                                fallbackLabel="Select a project"
                                searchable={true}
                                items={projects?.map((project) => ({
                                  label: project.name,
                                  value: project.id,
                                }))}
                                defaultSelectedItem={{
                                  label: field.value
                                    ? (projects?.find(
                                        (project) => project.id === field.value,
                                      )?.name ?? 'Unknown project')
                                    : '',
                                  value: field.value,
                                }}
                                searchLabel="Search projects"
                                onChange={field.onChange}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Form.Description>
                              No projects available.
                            </Form.Description>
                            <Button
                              onClick={() => setShowCreateProjectForm(true)}
                              variant={'outline'}
                            >
                              Create New Project
                            </Button>
                          </div>
                        )}
                      </div>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {projects == null ||
                (projects.length !== 0 && (
                  // We want to hide this field if there are no projects
                  <Form.Field
                    control={form.control}
                    name="agentName"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Agent Name</Form.Label>
                        <Form.Control>
                          <Input
                            {...form.register('agentName', {
                              required: true,
                            })}
                            {...field}
                            autoFocus
                            placeholder="Give your agent a name"
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ))}
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              {projects == null ||
                (projects.length !== 0 && (
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      variant={'expandIcon'}
                      Icon={Icons.chevronRight}
                      iconPlacement="right"
                      loading={status === 'loading'}
                      disabled={!form.formState.isValid}
                      className="space-x-1"
                    >
                      Create
                    </Button>
                  </Dialog.Close>
                ))}
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
          <Form.Title>Agent created</Form.Title>
          <Form.Description>
            Configure your agent's connections.
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
          <Form.Title>Something went wrong</Form.Title>
          <Form.Description className="text-center">
            Could not create agent. Please try again.
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
