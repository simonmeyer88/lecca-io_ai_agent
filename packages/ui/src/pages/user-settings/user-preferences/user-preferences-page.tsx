import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

import useApiMutation from '@/api/use-api-mutation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { RadioGroup } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import {
  UpdateWorkspaceUserPreferencesType,
  updateWorkspaceUserPreferencesSchema,
} from '@/models/workspace-user-preferences-model';

export default function UserPreferencesPage() {
  const {
    workspaceUserPreferences: userPreferences,
    setWorkspaceUserPreferences: setUserPreferences,
  } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UpdateWorkspaceUserPreferencesType>({
    resolver: zodResolver(updateWorkspaceUserPreferencesSchema),
    defaultValues: {
      theme: userPreferences?.theme ?? 'SYSTEM',
      workflowOrientation: userPreferences?.workflowOrientation ?? 'HORIZONTAL',
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
        <h3 className="text-lg font-medium">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal preferences.
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  Whether your workflows should be displayed horizontally or
                  vertically by default.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          /> */}
          <Form.Field
            control={form.control}
            name="theme"
            render={({ field }) => (
              <Form.Item className="space-y-1">
                <Form.Label>Theme</Form.Label>
                <Form.Description>
                  Select the theme this application.
                </Form.Description>
                <Form.Message />
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid max-w-md grid-cols-1 gap-8 pt-2 sm:grid-cols-2"
                >
                  <Form.Item>
                    <Form.Label className="[&:has([data-state=checked])>div]:border-primary">
                      <Form.Control>
                        <RadioGroup.Item value="LIGHT" className="sr-only" />
                      </Form.Control>
                      <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                          <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">
                        Light
                      </span>
                    </Form.Label>
                  </Form.Item>
                  <Form.Item>
                    <Form.Label className="[&:has([data-state=checked])>div]:border-primary">
                      <Form.Control>
                        <RadioGroup.Item value="DARK" className="sr-only" />
                      </Form.Control>
                      <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                          <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">
                        Dark
                      </span>
                    </Form.Label>
                  </Form.Item>
                </RadioGroup>
              </Form.Item>
            )}
          />
          <Button loading={isSubmitting} type="submit">
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
