import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import useApiQuery from '../../api/use-api-query';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ComboBox } from '../ui/combo-box';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Skeleton } from '../ui/skeleton';

import { CreateProjectForm } from './create-project-form';

const selectProjectForWorkflowTemplateSchema = z.object({
  projectId: z.string(),
});

type SelectProjectType = z.infer<typeof selectProjectForWorkflowTemplateSchema>;

export function SelectProjectForWorkflowTemplateForm({
  templateId,
}: {
  templateId: string;
}) {
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);

  const navigate = useNavigate();
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const form = useForm<SelectProjectType>({
    resolver: zodResolver(selectProjectForWorkflowTemplateSchema),
    defaultValues: {},
  });

  const { data: projects, isLoading: isLoadingProjects } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: template, isLoading: isLoadingTemplate } = useApiQuery({
    service: 'workflowTemplates',
    method: 'getById',
    apiLibraryArgs: {
      id: templateId,
    },
  });

  const onSubmit = async (values: SelectProjectType) => {
    setStatus('loading');
    setTimeout(() => {
      navigate(
        `/projects/${values.projectId}/workflow-templates/${templateId}`,
      );
      setStatus('success');
    }, 400);
  };

  return showCreateProjectForm ? (
    <CreateProjectForm
      redirectRelativeToProjectIdPath={`/workflow-templates/${templateId}`}
    />
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
                Copy this template into a project.
              </Form.Description>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Card className="bg-muted">
                {isLoadingTemplate ? (
                  <div className="p-6 flex items-center justify-center">
                    <Icons.spinner className="animate-spin w-6 h-6" />
                  </div>
                ) : (
                  <>
                    <Card.Header className="mb-0 pb-2">
                      <Card.Title>{template?.name}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <Card.Description>
                        {template?.description}
                      </Card.Description>
                    </Card.Content>
                  </>
                )}
              </Card>
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
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              {projects == null ||
                (projects.length !== 0 && (
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      variant="default"
                      loading={status === 'loading'}
                      disabled={!form.formState.isValid}
                    >
                      Use Template
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
          <Form.Title>Template copied</Form.Title>
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
            Could not copy template. Please try again.
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
