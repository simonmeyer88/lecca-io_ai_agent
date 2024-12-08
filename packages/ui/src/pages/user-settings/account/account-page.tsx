import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { api } from '@/api/api-library';
import useApiMutation from '@/api/use-api-mutation';
import { AvatarUploader } from '@/components/avatar-uploader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { UpdateUserType, updateUserSchema } from '@/models/user-model';

export default function UserAccountPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workspace, workspaceUser, setUser, setWorkspaceUser } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const profileImageUrlRef = useRef<string>();
  const form = useForm<UpdateUserType>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: workspaceUser?.user?.name,
    },
  });

  const updateUserMutation = useApiMutation({
    service: 'users',
    method: 'updateMe',
  });

  const updateWorkspaceUserMutation = useApiMutation({
    service: 'workspaceUsers',
    method: 'updateMe',
  });

  const onSubmit = async (data: UpdateUserType) => {
    setIsSubmitting(true);
    await updateUserMutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: (data) => {
          setUser(data);
          toast({
            title: 'Setttings saved',
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex sm:flex-row sm:space-x-8 sm:space-y-0 flex-col space-y-8 space-x-0">
            <AvatarUploader
              src={workspaceUser?.profileImageUrl}
              fallback={workspaceUser?.user?.name}
              getUploadUrl={async (fileName: string) => {
                const presignedUploadUrl =
                  await api.workspaceUsers.getPresignedPostUrlForProfileImage({
                    id: workspaceUser!.id!,
                    fileName: fileName,
                  });

                if (presignedUploadUrl) {
                  profileImageUrlRef.current =
                    presignedUploadUrl.data!.presignedPostData.url +
                    presignedUploadUrl.data!.presignedPostData.fields.key;
                }

                return presignedUploadUrl.data?.presignedPostData;
              }}
              uploadCallback={(status) => {
                if (status) {
                  toast({
                    title: 'Profile image saved',
                  });
                  setWorkspaceUser({
                    ...workspaceUser!,
                    profileImageUrl:
                      profileImageUrlRef.current + '?' + new Date().getTime(),
                  });

                  updateWorkspaceUserMutation.mutate({
                    data: {
                      profileImageUrl: profileImageUrlRef.current,
                    },
                  });
                } else {
                  toast({
                    title: 'Profile image failed to save',
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
                    <Input placeholder="Your name" {...field} />
                  </Form.Control>
                  <Form.Description>
                    This is the name that will be displayed on your profile
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <div className="space-y-4">
        <Card.Title>Danger Zone</Card.Title>
        {workspace?.createdByWorkspaceUser?.id !== workspaceUser?.id && (
          <Card className="flex justify-between items-center">
            <Card.Header>
              <Card.Title>Leave current workspace</Card.Title>
              <Card.Description>{workspace!.name}</Card.Description>
            </Card.Header>
            <Card.Content className="flex items-center p-6">
              <AlertDialog>
                <AlertDialog.Trigger className="w-full" asChild>
                  <Button variant={'destructive'}>Leave</Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                  <AlertDialog.Header>
                    <AlertDialog.Title>Leave Workspace</AlertDialog.Title>
                    <AlertDialog.Description>
                      You will lose access to this workspace. Are you sure you
                      want want to leave{' '}
                      <span className="font-bold">{workspace!.name}</span>?
                    </AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Footer>
                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                    <AlertDialog.Action
                      loading={isLeaving}
                      className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                      onClick={async () => {
                        setIsLeaving(true);
                        const { data, isError, error } =
                          await api.workspaces.leaveWorkspace({
                            workspaceId: workspace!.id,
                          });

                        setIsLeaving(false);

                        if (isError) {
                          toast({ title: error });
                          return;
                        } else if (data) {
                          toast({ title: 'Left workspace' });
                          navigate(`/logout`);
                        }
                      }}
                    >
                      Leave
                    </AlertDialog.Action>
                  </AlertDialog.Footer>
                </AlertDialog.Content>
              </AlertDialog>
            </Card.Content>
          </Card>
        )}
        <Card className="flex justify-between items-center">
          <Card.Header>
            <Card.Title>Delete account</Card.Title>
            <Card.Description>
              Delete{' '}
              <span className="font-bold">{workspaceUser!.user!.email}</span>
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center p-6">
            <AlertDialog>
              <AlertDialog.Trigger className="w-full" asChild>
                <Button variant={'destructive'}>Delete</Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>Delete Account</AlertDialog.Title>
                  <AlertDialog.Description>
                    Your account will be deleted. If you are the only user in
                    your workspace, you will not be able to rejoin it. Are you
                    sure you want to delete your account? This cannot be undone.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                  <AlertDialog.Action
                    loading={isDeleting}
                    className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                    onClick={async () => {
                      setIsDeleting(true);
                      const { data, isError, error } = await api.users.delete({
                        id: workspaceUser!.user!.id!,
                      });

                      setIsDeleting(false);

                      if (isError) {
                        toast({ title: error });
                        return;
                      } else if (data) {
                        toast({ title: 'Account deleted' });
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
        </Card>
      </div>
    </div>
  );
}
