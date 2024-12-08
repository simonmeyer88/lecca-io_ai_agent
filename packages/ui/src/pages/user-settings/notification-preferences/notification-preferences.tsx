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
  UpdateWorkspaceUserPreferencesType,
  updateWorkspaceUserPreferencesSchema,
} from '@/models/workspace-user-preferences-model';

export default function NotificationPreferencesPage() {
  const {
    workspaceUserPreferences: userPreferences,
    setWorkspaceUserPreferences: setUserPreferences,
  } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UpdateWorkspaceUserPreferencesType>({
    resolver: zodResolver(updateWorkspaceUserPreferencesSchema),
    defaultValues: {
      theme: userPreferences?.theme ?? 'LIGHT',
    },
  });

  const mutation = useApiMutation({
    service: 'workspaceUserPreferences',
    method: 'updateMe',
  });

  const onSubmit = async (data: UpdateWorkspaceUserPreferencesType) => {
    setIsSubmitting(true);

    await mutation.mutateAsync(
      {
        data,
      },
      {
        onSuccess: (data) => {
          setUserPreferences(data);
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
        <h3 className="text-lg font-medium">Notification</h3>
        <p className="text-sm text-muted-foreground">
          Update your notification preferences.
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
