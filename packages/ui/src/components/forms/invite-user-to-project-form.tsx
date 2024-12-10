import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { useToast } from '../../hooks/useToast';
import {
  CreateProjectInvitationType,
  createProjectInvitationSchema,
} from '../../models/project/project-invitation-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { ComboBox } from '../ui/combo-box';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
// import { Select } from '../ui/select';
import { Skeleton } from '../ui/skeleton';

type InviteUserToProjectFormProps = {
  projectId: string;
};

export function InviteUserToProjectForm(props: InviteUserToProjectFormProps) {
  const { toast } = useToast();
  const [inviteStatus, setInviteStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const { data: workspaceUsers, isLoading: isLoadingUsers } = useApiQuery({
    service: 'workspaceUsers',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const {
    data: projectWorkspaceUsers,
    isLoading: isLoadingProjectWorkspaceUsers,
  } = useApiQuery({
    service: 'workspaceUsers',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${props.projectId}`],
        },
      },
    },
  });

  const inviteUserMutation = useApiMutation({
    service: 'projectInvitations',
    method: 'create',
    apiLibraryArgs: {
      projectId: props.projectId,
    },
  });

  const form = useForm<CreateProjectInvitationType>({
    resolver: zodResolver(createProjectInvitationSchema),
    defaultValues: {
      projectId: props.projectId,
    },
  });

  const onSubmit = async (data: CreateProjectInvitationType) => {
    setInviteStatus('loading');
    await inviteUserMutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: () => {
          toast({ title: 'User invited to project' });
          setInviteStatus('success');
        },
        onError: () => {
          setInviteStatus('error');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {inviteStatus === 'success' ? (
          <SuccessFormContent
            onInviteAgain={() => {
              setInviteStatus('idle');
              form.reset();
            }}
          />
        ) : inviteStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Invite</Form.Title>
              <Form.Subtitle>
                Invite team members to join this project.
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="workspaceUserId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <div className="flex flex-col space-y-2">
                        {isLoadingUsers && isLoadingProjectWorkspaceUsers ? (
                          <>
                            <Form.Label>Project</Form.Label>
                            <Skeleton className="w-full h-10" />
                          </>
                        ) : workspaceUsers?.length ? (
                          <div className="flex space-x-1 items-center">
                            <ComboBox
                              dropdownWidthMatchesButton
                              className="w-full flex justify-between"
                              fallbackLabel="Select a user"
                              searchable={true}
                              items={workspaceUsers
                                ?.filter((workspaceUser) => {
                                  return !projectWorkspaceUsers?.find(
                                    (projectWorkspaceUser) =>
                                      projectWorkspaceUser?.id ===
                                      workspaceUser.id,
                                  );
                                })
                                .map((workspaceUser) => ({
                                  label:
                                    workspaceUser?.user?.name ?? 'Unknown user',
                                  value: workspaceUser?.id ?? '',
                                }))}
                              defaultSelectedItem={{
                                label: field.value
                                  ? (workspaceUsers?.find(
                                      ({ user }) => user?.id === field.value,
                                    )?.user?.name ?? 'Unknown user')
                                  : '',
                                value: field.value,
                              }}
                              searchLabel="Search users"
                              onChange={field.onChange}
                            />
                          </div>
                        ) : (
                          <Form.Description>
                            No users available.
                          </Form.Description>
                        )}
                      </div>
                    </Form.Control>
                  </Form.Item>
                )}
              />
              {/* <Form.Field
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Role</Form.Label>
                    <Form.Control>
                      <Select onValueChange={field.onChange}>
                        <Select.Trigger>
                          <Select.Value
                            placeholder={
                              field.value ? field.value : 'Select a role'
                            }
                          />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="MAINTAINER">
                            Maintainer
                          </Select.Item>
                          <Select.Item value="MEMBER">Member</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              /> */}
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  variant="default"
                  loading={inviteStatus === 'loading'}
                  disabled={!form.formState.isValid}
                >
                  Invite
                </Button>
              </Dialog.Close>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
  );
}

function SuccessFormContent({ onInviteAgain }: { onInviteAgain: () => void }) {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Invitation sent</Form.Title>
          <Form.Description>
            We've sent an invitation to the user to join this project.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
        <Button variant="default" type="button" onClick={onInviteAgain}>
          Invite Another
        </Button>
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
          <Form.Title>Invitation failed</Form.Title>
          <Form.Description className="text-center">
            Could not send this invitation. <br />
            This user may already belong to this project.
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
