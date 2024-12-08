import { UseFormReturn } from 'react-hook-form';

import useApiQuery from '@/api/use-api-query';
import { CreateConnectionForm } from '@/components/forms/create-connection-form';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/combo-box';
import { Dialog } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';

import { SharedLabelAndTooltip } from './shared-label-and-tooltip';

export function ConnectionFormField({
  form,
  workflowApp,
  projectId,
  executionId,
}: {
  form: UseFormReturn;
  workflowApp: WorkflowApp;
  projectId: string;
  executionId: string | undefined;
}) {
  const { data: connections, isLoading: isLoadingConnections } = useApiQuery({
    service: 'connections',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [
            `workflowAppId:${workflowApp.id}`,
            `projectAccessId:${projectId}`,
          ],
        },
      },
    },
  });

  return (
    <Form.Field
      control={form.control}
      name={'connectionId'}
      render={({ field }) => {
        form.register('connectionId', {
          required: true,
        });

        return (
          <Form.Item>
            <Form.Control>
              <div className="flex flex-col space-y-2">
                <SharedLabelAndTooltip
                  description="This app requires credentials."
                  label={`${workflowApp.name} Connection`}
                  required
                />
                {isLoadingConnections ? (
                  <Skeleton className="w-full h-10" />
                ) : (
                  <div className="flex space-x-1 items-center">
                    <ComboBox
                      dropdownWidthMatchesButton
                      className="w-full flex justify-between"
                      fallbackLabel="Select a connection"
                      searchable={false}
                      disabled={!!executionId}
                      items={connections?.map((connection) => ({
                        label: connection.name,
                        value: connection.id,
                      }))}
                      defaultSelectedItem={{
                        label: field.value
                          ? (connections?.find(
                              (connection) => connection.id === field.value,
                            )?.name ?? 'Connection not found')
                          : '',
                        value: field.value,
                      }}
                      searchLabel="Search connections"
                      onChange={field.onChange}
                    />
                    {!executionId && (
                      <Dialog>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <Dialog.Trigger asChild>
                              <Button
                                size="sm"
                                className="h-9 w-8 p-0"
                                variant={'ghost'}
                              >
                                <Icons.plusCircled />
                              </Button>
                            </Dialog.Trigger>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            Add a new connection
                          </Tooltip.Content>
                        </Tooltip>
                        <Dialog.Content
                          className="p-0 w-full sm:min-w-[400px]"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <CreateConnectionForm workflowApp={workflowApp} />
                        </Dialog.Content>
                      </Dialog>
                    )}
                  </div>
                )}
              </div>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
}
