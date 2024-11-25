import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import {
  UpdateWorkflowAppType,
  updateWorkflowAppSchema,
} from '@/models/workflow/workflow-app-model';
import { cn } from '@/utils/cn';

export function AppDetailsOverview() {
  const { workspaceUser: user } = useUser();
  const { appId } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: app } = useApiQuery({
    service: 'workflowApps',
    method: 'getById',
    apiLibraryArgs: {
      id: appId!,
    },
  });

  const canEdit = useMemo(() => {
    //If the app is not published, only the owner and maintainer can edit it
    if (app?.isPublished === false) {
      if (user!.roles.includes('OWNER') || user!.roles.includes('MAINTAINER')) {
        return true;
      }
    }

    return false;
  }, [user, app]);

  const form = useForm<UpdateWorkflowAppType>({
    resolver: zodResolver(updateWorkflowAppSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const updateAppMutation = useApiMutation({
    service: 'workflowApps',
    method: 'update',
  });

  const onSubmit = async (data: UpdateWorkflowAppType) => {
    setIsSubmitting(true);

    await updateAppMutation.mutateAsync(
      {
        id: appId,
        data,
      },
      {
        onSuccess: () => {
          toast({
            title: 'App saved',
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  useEffect(() => {
    if (app) {
      form.reset({
        name: app.name,
        description: app.description,
        logoUrl: app.logoUrl,
      });
    }
  }, [app, form]);

  return (
    <div className={'space-y-6'}>
      <div>
        <h3 className="text-lg font-medium">App overview</h3>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(`space-y-8`, {
            'space-y-2': !canEdit,
          })}
        >
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) =>
              canEdit ? (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input placeholder="Add a name" {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              ) : (
                <p className="text-lg font-semibold">{field.value}</p>
              )
            }
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) =>
              canEdit ? (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea placeholder="Add a description" {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              ) : (
                <p>{field.value}</p>
              )
            }
          />
          {canEdit && (
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
