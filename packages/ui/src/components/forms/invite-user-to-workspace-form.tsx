import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import { useToast } from '../../hooks/useToast';
import { useUser } from '../../hooks/useUser';
import {
  CreateWorkspaceInvitationType,
  createWorkspaceInvitationSchema,
} from '../../models/workspace-invitation-model';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';
import { Select } from '../ui/select';

export function InviteUsertoWorkspaceForm() {
  const { toast } = useToast();
  const { workspace, enabledFeatures } = useUser();
  const [inviteStatus, setInviteStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const inviteUserMutation = useApiMutation({
    service: 'workspaceInvitations',
    method: 'create',
    apiLibraryArgs: {},
  });

  const form = useForm<CreateWorkspaceInvitationType>({
    resolver: zodResolver(createWorkspaceInvitationSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: CreateWorkspaceInvitationType) => {
    setInviteStatus('loading');
    await inviteUserMutation.mutateAsync(
      {
        data: values,
      },
      {
        onSuccess: () => {
          toast({ title: 'User invited to workspace' });
          setInviteStatus('success');
        },
        onError: () => {
          setInviteStatus('error');
        },
      },
    );
  };

  if (
    enabledFeatures.BILLING &&
    (!workspace?.billing ||
      (workspace.billing.planType !== 'team' &&
        workspace.billing.planType !== 'business'))
  ) {
    return (
      <div>
        <Form.Header>
          <Form.Title>Upgrade Plans</Form.Title>
        </Form.Header>
        <Form.Content>
          <Form.Subtitle>
            Your workspace needs to be on a <strong>Team</strong> plan to invite
            more users.
          </Form.Subtitle>
          <Form.Subtitle>
            Go to the
            <Button asChild variant={'link'} className="px-1">
              <Link to="/workspace-billing" className="text-primary">
                billing page
              </Link>
            </Button>
            to learn more.
          </Form.Subtitle>
        </Form.Content>
      </div>
    );
  } else if (!enabledFeatures.TEAMS) {
    return (
      <div>
        <Form.Header>
          <Form.Title>Commercial License Required</Form.Title>
        </Form.Header>
        <Form.Content>
          <Form.Subtitle>
            Reach out to support@lecca.io for more information regarding our
            commercial license.
          </Form.Subtitle>
        </Form.Content>
      </div>
    );
  }

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
                Invite your team members to join this workspace.
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Invitation Email</Form.Label>
                    <Form.Control>
                      <Input {...field} type="email" placeholder="Email" />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Role</Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                      >
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
              />
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
            We've sent an invitation to to join this workspace.
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
            This user may already belong to this workspace.
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
