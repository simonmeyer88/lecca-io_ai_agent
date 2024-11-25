import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import {
  FEATURES_THAT_CAN_BE_DISABLED,
  UpdateWorkspacePreferencesType,
  updateWorkspacePreferencesSchema,
} from '@/models/workspace-preferences-model';

export default function WorkspacePreferencesPage() {
  const { workspacePreferences, setWorkspacePreferences } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [disabledFeaturesChanged, setDisabledFeaturesChanged] = useState(false);

  const form = useForm<UpdateWorkspacePreferencesType>({
    resolver: zodResolver(updateWorkspacePreferencesSchema),
    defaultValues: {
      disabledFeatures: workspacePreferences?.disabledFeatures ?? [],
    },
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
            description:
              disabledFeaturesChanged && 'Refresh the page to see the changes.',
            action: disabledFeaturesChanged ? (
              <ToastAction
                altText="Refresh"
                onClick={() => {
                  window.location.reload();
                }}
                className="space-x-2"
              >
                <span>Refresh Page</span>
              </ToastAction>
            ) : undefined,
          });

          setDisabledFeaturesChanged(false);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  useEffect(() => {
    form.reset({
      disabledFeatures: workspacePreferences?.disabledFeatures ?? [],
    });
    form.getValues(); //DO NOT DELETE. HACK TO GET THE FORM TO RE-RENDER AND KEEP THE UPDATED VALUES AFTER SAVING. SUPER WEIRD
  }, [form, workspacePreferences]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Workspace Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Update your workspace preferences.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Form.Field
            control={form.control}
            name="disabledFeatures"
            render={({ field }) => {
              return (
                <Form.Item className="flex flex-col justify-start items-start">
                  <Form.Label>Hide Features</Form.Label>
                  <Form.Control>
                    <MultiSelect
                      items={FEATURES_THAT_CAN_BE_DISABLED}
                      onChange={(items) => {
                        field.onChange(items);
                        if (
                          items.length !==
                          workspacePreferences?.disabledFeatures.length
                        ) {
                          setDisabledFeaturesChanged(true);
                        }
                      }}
                      value={field.value}
                      placeholder="Select features to hide"
                    />
                  </Form.Control>
                  <Form.Description className="ml-1">
                    You may only use Lecca.io for certain features. You can hide
                    features to simplify the interface.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Button loading={isSubmitting} type="submit">
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
