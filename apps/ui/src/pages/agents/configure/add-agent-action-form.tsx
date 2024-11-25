import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/combo-box';
import { Dialog } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

const selectAgentSchema = z.object({
  actionId: z.string(),
});

type SelectAgentType = z.infer<typeof selectAgentSchema>;

type Props = {
  onSubmit: (values: SelectAgentType) => void;
  enabledActionIds: string[] | undefined;
  enabledAppIds: string[] | undefined;
};

export function AddAgentActionForm({
  onSubmit: onSubmitCallback,
  enabledActionIds = [],
  enabledAppIds = [],
}: Props) {
  const [enableStatus, setEnableStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const { data: apps, isLoading: isLoadingApps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const unselectedActions = useMemo(() => {
    return (
      apps?.filter((app) => {
        return (
          app.availableForAgent &&
          (enabledAppIds.includes(app.id) || !app.needsConnection) &&
          !enabledActionIds.includes(app.id)
        );
      }) ?? []
    ).flatMap((app) =>
      app.actions.map((action) => ({ ...action, logoUrl: app.logoUrl })),
    );
  }, [apps, enabledActionIds, enabledAppIds]);

  const form = useForm<SelectAgentType>({
    resolver: zodResolver(selectAgentSchema),
    defaultValues: {},
  });

  const onSubmit = (values: SelectAgentType) => {
    onSubmitCallback(values);
    setEnableStatus('success');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {enableStatus === 'success' ? (
          <SuccessFormContent
            onEnableAgain={() => {
              setEnableStatus('idle');
              form.reset();
            }}
          />
        ) : enableStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>Enable Action</Form.Title>
              <Form.Subtitle>Give your agent access to an action</Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="actionId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <div className="flex flex-col space-y-2">
                        {isLoadingApps ? (
                          <>
                            <Form.Label>Action</Form.Label>
                            <Skeleton className="w-full h-10" />
                          </>
                        ) : unselectedActions?.length ? (
                          <>
                            <Form.Label>Action</Form.Label>
                            <div className="flex space-x-1 items-center">
                              <ComboBox
                                dropdownWidthMatchesButton
                                className="w-full flex justify-between"
                                fallbackLabel="Select an action"
                                searchable={true}
                                items={unselectedActions?.map((app) => ({
                                  label: app.name,
                                  subLabel: app.description,
                                  value: app.id,
                                  prefix: (
                                    <img
                                      src={app.logoUrl}
                                      alt={app.name}
                                      className="size-5 bg-white rounded p-0.5"
                                    />
                                  ),
                                }))}
                                defaultSelectedItem={{
                                  label: field.value
                                    ? (unselectedActions?.find(
                                        (action) => action.id === field.value,
                                      )?.name ?? 'Unknown action')
                                    : '',
                                  value: field.value,
                                }}
                                searchLabel="Search actions"
                                onChange={field.onChange}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Form.Description>
                              No actions available. Add more connections to see
                              more.
                            </Form.Description>
                          </div>
                        )}
                      </div>
                    </Form.Control>
                    <Form.Message />
                    <Form.Description>
                      Enable connections to see the available actions of that
                      connection type.
                    </Form.Description>
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
                  loading={enableStatus === 'loading'}
                  disabled={!form.formState.isValid}
                >
                  Enable
                </Button>
              </Dialog.Close>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
  );
}

function SuccessFormContent({ onEnableAgain }: { onEnableAgain: () => void }) {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Action enabled</Form.Title>
          <Form.Description>
            The agent now has access to this action.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
        <Button variant="default" type="button" onClick={onEnableAgain}>
          Enable Another
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
          <Form.Title>Failure</Form.Title>
          <Form.Description className="text-center">
            Could not enable action for this agent. <br />
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
