import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import {
  UpdateWorkspacePreferencesType,
  updateWorkspacePreferencesSchema,
} from '@/models/workspace-preferences-model';

export default function WorkspaceNotificationPreferencesPage() {
  const { setWorkspacePreferences } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UpdateWorkspacePreferencesType>({
    resolver: zodResolver(updateWorkspacePreferencesSchema),
    defaultValues: {},
  });

  const mutation = useApiMutation({
    service: 'workspacePreferences',
    method: 'updateMe',
  });

  const onSubmit = async (data: UpdateWorkspacePreferencesType) => {
    setIsSubmitting(true);

    await mutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: (data) => {
          setWorkspacePreferences(data);
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
        <h3 className="text-lg font-medium">Workspace Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Update your workspace notification preferences.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* <Form.Field
            control={form.control}
            name="theme"
            render={({ field }) => (
             
            )}
          /> */}
          <Button loading={isSubmitting} type="submit">
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
