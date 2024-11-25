import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { api } from '@/api/api-library';
import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { AvatarUploader } from '@/components/avatar-uploader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { toast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import {
  UpdateWorkspaceType,
  updateWorkspaceSchema,
} from '@/models/workspace-model';

export default function WorkspaceSettingsPage() {
  const { workspaceUser, workspace, setWorkspace } = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const profileImageUrlRef = React.useRef<string>();
  const { data: workspaces } = useApiQuery({
    service: 'workspaces',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const form = useForm<UpdateWorkspaceType>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      description: workspace?.description ?? '',
      name: workspace?.name,
    },
  });

  const updateMutation = useApiMutation({
    service: 'workspaces',
    method: 'updateMe',
  });

  const onSubmit = async (data: UpdateWorkspaceType) => {
    setIsSubmitting(true);

    await updateMutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: (data) => {
          setWorkspace(data);
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

  return (
    <div className="space-y-6 h-[calc(100dvh-80px)] overflow-y-auto">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your workspace settings.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex sm:flex-row sm:space-x-8 sm:space-y-0 flex-col space-y-8 space-x-0">
            <AvatarUploader
              src={workspace?.logoUrl}
              fallback={workspace?.name}
              getUploadUrl={async (fileName: string) => {
                const presignedUploadUrl =
                  await api.workspaces.getPresignedPostUrlForLogo({
                    id: workspace!.id!,
                    fileName: fileName,
                  });

                if (presignedUploadUrl) {
                  profileImageUrlRef.current =
                    presignedUploadUrl.data!.presignedPostData.url +
                    '/' +
                    presignedUploadUrl.data!.presignedPostData.fields.key;
                }

                return presignedUploadUrl.data?.presignedPostData;
              }}
              uploadCallback={(status) => {
                if (status) {
                  toast({
                    title: 'Logo saved',
                  });
                  setWorkspace({
                    ...workspace!,
                    logoUrl:
                      profileImageUrlRef.current + '?' + new Date().getTime(),
                  });

                  updateMutation.mutate({
                    data: {
                      logoUrl: profileImageUrlRef.current,
                    },
                  });
                } else {
                  toast({
                    title: 'Logo failed to save',
                    variant: 'destructive',
                  });
                }
              }}
            />
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input placeholder="Workspace name" {...field} />
                  </Form.Control>
                  <Form.Description>
                    This is the name that all workspace users will see.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Description</Form.Label>
                <Form.Control>
                  <Textarea placeholder="Workspace description" {...field} />
                </Form.Control>
                <Form.Description>
                  An optional short description of this workspace.
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
      {workspaceUser?.roles.includes('OWNER') &&
        workspaces &&
        workspaces.length > 1 && (
          <>
            <Separator />
            <div className="space-y-4 ">
              <Card.Title>Danger Zone</Card.Title>
              <Card className="flex justify-between items-center relative overflow-hidden">
                <Card.Header>
                  <Card.Title>Delete workspace</Card.Title>
                  <Card.Description>
                    This will completely delete the workspace and all its
                    projects, workflows, connections, variables, and other data.
                  </Card.Description>
                </Card.Header>
                <Card.Content className="flex items-center p-6">
                  <AlertDialog>
                    <AlertDialog.Trigger className="w-full" asChild>
                      <Button variant={'destructive'}>Delete</Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                      <AlertDialog.Header>
                        <AlertDialog.Title>Delete Workspace</AlertDialog.Title>
                        <AlertDialog.Description>
                          <strong>
                            If you're not on the starter plan, make sure to
                            cancel your subscription before deleting.
                          </strong>
                          <br />
                          <br />
                          All your projects, workflows, connections, variables,
                          .etc will be deleted. This cannot be undone. Are you
                          sure you want to delete{' '}
                          <span className="font-bold">{workspace!.name}</span>?
                        </AlertDialog.Description>
                      </AlertDialog.Header>
                      <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action
                          loading={isDeleting}
                          className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                          onClick={async () => {
                            setIsDeleting(true);
                            const { data, isError, error } =
                              await api.workspaces.delete({
                                id: workspace!.id!,
                              });

                            setIsDeleting(false);

                            if (isError) {
                              toast({ title: error, variant: 'destructive' });
                              return;
                            } else if (data) {
                              toast({ title: 'Workspace deleted' });
                              navigate(`/logout`);
                            }
                          }}
                        >
                          Delete
                        </AlertDialog.Action>
                      </AlertDialog.Footer>
                    </AlertDialog.Content>
                  </AlertDialog>
                </Card.Content>

                {workspace?.defaultCreatedWorkspace && (
                  <Tooltip>
                    <Tooltip.Trigger className="absolute w-full h-full bg-muted/25 top-0 left-0 right-0 bottom-0 cursor-not-allowed"></Tooltip.Trigger>
                    <Tooltip.Content className="max-w-2xl">
                      You can't delete the default created workspace. This is
                      the workspace that was created when you signed up. It is
                      your only workspace that get's monthly credits.
                    </Tooltip.Content>
                  </Tooltip>
                )}
              </Card>
            </div>
          </>
        )}
    </div>
  );
}
