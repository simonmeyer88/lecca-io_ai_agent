import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { Loader } from '@/components/loaders/loader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import {
  UpdateProjectType,
  updateProjectSchema,
} from '@/models/project/project-model';

export default function ProjectGeneralSettingsPage() {
  const { workspaceUser } = useUser();
  const { projectId } = useParams();
  const { data: project, isLoading: isLoadingProject } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: {
      id: projectId!,
    },
  });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);

  const form = useForm<UpdateProjectType>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      description: '',
      name: '',
    },
  });

  const updateMutation = useApiMutation({
    service: 'projects',
    method: 'update',
  });

  const deleteMutation = useApiMutation({
    service: 'projects',
    method: 'delete',
    apiLibraryArgs: {
      id: projectId,
    },
  });

  const leaveProjectMutation = useApiMutation({
    service: 'projects',
    method: 'leaveProject',
    apiLibraryArgs: {
      projectId: projectId,
    },
  });

  const onSubmit = async (data: UpdateProjectType) => {
    setIsSubmitting(true);

    await updateMutation.mutateAsync(
      {
        id: projectId,
        data,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Settings saved',
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  useEffect(() => {
    if (project) {
      form.reset({
        description: project.description,
        name: project.name,
      });
    }
  }, [form, project]);

  if (isLoadingProject) {
    return <Loader />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Update your project settings.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
                <Form.Control>
                  <Input placeholder="Add a project name" {...field} />
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
                    placeholder="Add a project description"
                    {...field}
                  />
                </Form.Control>
                <Form.Description>
                  An optional short description of this project.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </Form>
      {project.createdByWorkspaceUser?.id !== workspaceUser?.id && (
        <>
          <Separator />
          <div className="space-y-4">
            <Card className="flex justify-between items-center">
              <Card.Header>
                <Card.Title>Leave project</Card.Title>
                <Card.Description>
                  You will need to be re-invited to join this project.
                </Card.Description>
              </Card.Header>
              <Card.Content className="flex items-center p-6">
                <AlertDialog>
                  <AlertDialog.Trigger className="w-full" asChild>
                    <Button variant={'outline'}>Leave</Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content>
                    <AlertDialog.Header>
                      <AlertDialog.Title>Leave Project</AlertDialog.Title>
                      <AlertDialog.Description>
                        You will no longer have access to this project's
                        workflows, connections, and variables. Are you sure you
                        want to leave{' '}
                        <span className="font-bold">{project.name}</span>?
                      </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                      <AlertDialog.Action
                        loading={isLeaving}
                        onClick={async () => {
                          setIsLeaving(true);
                          await leaveProjectMutation.mutateAsync(
                            {},
                            {
                              onSuccess: () => {
                                toast({ title: 'Left project' });
                                navigate('/projects');
                              },
                              onSettled: () => {
                                setIsLeaving(false);
                              },
                            },
                          );
                        }}
                      >
                        Leave
                      </AlertDialog.Action>
                    </AlertDialog.Footer>
                  </AlertDialog.Content>
                </AlertDialog>
              </Card.Content>
            </Card>
          </div>
        </>
      )}
      {project.createdByWorkspaceUser?.id === workspaceUser?.id && (
        <>
          <Separator />
          <div className="space-y-4">
            <Card.Title>Danger Zone</Card.Title>
            <Card className="border-destructive flex justify-between items-center">
              <Card.Header>
                <Card.Title>Delete project</Card.Title>
                <Card.Description>
                  This will delete all workflows, connections, knowledge, and
                  variables that belong to this project.
                </Card.Description>
              </Card.Header>
              <Card.Content className="flex items-center p-6">
                <AlertDialog>
                  <AlertDialog.Trigger className="w-full" asChild>
                    <Button variant={'destructive'}>Delete</Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content>
                    <AlertDialog.Header>
                      <AlertDialog.Title>Delete Project</AlertDialog.Title>
                      <AlertDialog.Description>
                        Deleting this project will delete all workflows,
                        connections, and variables that belong to this project.
                        Are you sure you want to delete{' '}
                        <span className="font-bold">{project.name}</span>?
                      </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                      <AlertDialog.Action
                        loading={isDeleting}
                        className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                        onClick={async () => {
                          setIsDeleting(true);
                          await deleteMutation.mutateAsync(
                            {},
                            {
                              onSuccess: () => {
                                toast({ title: 'Project deleted' });
                                navigate('/projects');
                              },
                              onSettled: () => {
                                setIsDeleting(false);
                              },
                            },
                          );
                        }}
                      >
                        Delete
                      </AlertDialog.Action>
                    </AlertDialog.Footer>
                  </AlertDialog.Content>
                </AlertDialog>
              </Card.Content>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
