import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import useApiMutation from '../../../api/use-api-mutation';
import useApiQuery from '../../../api/use-api-query';
import { Icons } from '../../../components/icons';
import { Loader } from '../../../components/loaders/loader';
import { AlertDialog } from '../../../components/ui/alert-dialog';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Form } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Separator } from '../../../components/ui/separator';
import { Textarea } from '../../../components/ui/textarea';
import { ToastAction } from '../../../components/ui/toast';
import { toast } from '../../../hooks/useToast';
import { useUser } from '../../../hooks/useUser';
import {
  UpdateWorkflowType,
  updateWorkflowSchema,
} from '../../../models/workflow/workflow-model';

export default function WorkflowGeneralSettingsPage() {
  const { workflowId, projectId } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const { workspaceUser } = useUser();
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const navigate = useNavigate();
  const { data: workflow, isLoading: isLoadingWorkflow } = useApiQuery({
    service: 'workflows',
    method: 'getById',
    apiLibraryArgs: {
      id: workflowId!,
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UpdateWorkflowType>({
    resolver: zodResolver(updateWorkflowSchema),
    defaultValues: {
      description: '',
      name: '',
      workflowOrientation: 'HORIZONTAL',
    },
  });

  const updateMutation = useApiMutation({
    service: 'workflows',
    method: 'update',
  });

  const deleteMutation = useApiMutation({
    service: 'workflows',
    method: 'delete',
    apiLibraryArgs: {
      id: workflowId!,
    },
  });
  const createWorkflowTemplate = useApiMutation({
    service: 'workflowTemplates',
    method: 'create',
  });

  const handleSaveAsTemplate = useCallback(async () => {
    setIsCreatingTemplate(true);
    return await createWorkflowTemplate.mutateAsync(
      {
        data: {
          workflowId: workflowId as string,
          projectId,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Template created',
            action: (
              <ToastAction
                altText="View Template"
                onClick={() => navigate(`/workflow-templates`)}
                className="space-x-2"
              >
                <span>View Templates</span>
                <Icons.arrowRight />
              </ToastAction>
            ),
          });
        },
        onSettled: () => {
          setIsCreatingTemplate(false);
        },
      },
    );
  }, [createWorkflowTemplate, navigate, projectId, workflowId]);

  const onSubmit = async (data: UpdateWorkflowType) => {
    setIsSubmitting(true);

    await updateMutation.mutateAsync(
      {
        id: workflowId,
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
    if (workflow) {
      form.reset({
        description: workflow.description ?? '',
        name: workflow.name,
        workflowOrientation: workflow.workflowOrientation,
      });
    }
  }, [form, workflow]);

  if (isLoadingWorkflow) {
    return <Loader />;
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Workflow Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your workflow's settings.
        </p>
      </div>
      <Separator />
      <div className="h-[calc(100dvh-170px)] space-y-6 overflow-y-auto pb-10 px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input placeholder="Add a workflow name" {...field} />
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
                      placeholder="Add a workflow description"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            {/* <Form.Field
              control={form.control}
              name="workflowOrientation"
              render={({ field }) => (
                <Form.Item className="space-y-1">
                  <Form.Label>Workflow Orientation</Form.Label>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <Select.Trigger className="w-72">
                      <Select.Value
                        placeholder={
                          field.value
                            ? WORKFLOW_ORIENTATIONS?.find(
                                (orientation) => orientation === field.value,
                              )?.charAt(0) + field.value.slice(1).toLowerCase()
                            : 'Select an orientation'
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {WORKFLOW_ORIENTATIONS?.map((orientation) => (
                        <Select.Item key={orientation} value={orientation}>
                          {orientation.charAt(0) +
                            orientation.slice(1).toLowerCase()}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <Form.Description className="pt-1 ml-1">
                    Whether this workflow should be displayed horizontally or
                    vertically.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            /> */}
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </form>
        </Form>
        {workspaceUser?.user?.email?.includes('admin@lecca.io') && (
          <>
            <Separator />
            <div className="space-y-4">
              <Card.Title>Template</Card.Title>
              <div className="space-y-2">
                <Card className="flex justify-between items-center">
                  <Card.Header>
                    <Card.Title>Create Template</Card.Title>
                  </Card.Header>
                  <Card.Content className="flex items-center p-6">
                    <Button
                      variant="outline"
                      onClick={handleSaveAsTemplate}
                      loading={isCreatingTemplate}
                    >
                      Create
                    </Button>
                  </Card.Content>
                </Card>
                <Card.Description>
                  Save this workflow as a template for future use.
                </Card.Description>
              </div>
            </div>
          </>
        )}
        <Separator />
        <div className="space-y-4">
          <Card.Title>Danger Zone</Card.Title>
          <Card className="flex justify-between items-center">
            <Card.Header>
              <Card.Title>Delete workflow</Card.Title>
            </Card.Header>
            <Card.Content className="flex items-center p-6">
              <AlertDialog>
                <AlertDialog.Trigger className="w-full" asChild>
                  <Button variant={'destructive'}>Delete</Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                  <AlertDialog.Header>
                    <AlertDialog.Title>Delete Workflow</AlertDialog.Title>
                    <AlertDialog.Description>
                      This action cannot be undone. Are you sure you want to
                      delete <span className="font-bold">{workflow.name}</span>?
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
                              toast({ title: 'Workflow deleted' });
                              navigate(`/projects/${workflow.project?.id}`);
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
      </div>
    </div>
  );
}
