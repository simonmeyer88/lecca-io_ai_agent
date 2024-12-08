import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import {
  UseFieldArrayRemove,
  UseFormReturn,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { Node } from 'reactflow';

import { api, appQueryClient } from '@/api/api-library';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { useProjectWorkflow } from '@/hooks/useProjectWorkflow';
import { useToast } from '@/hooks/useToast';
import { Agent } from '@/models/agent/agent-model';
import { FieldConfig, InputConfig } from '@/models/workflow/input-config-model';
import { Workflow } from '@/models/workflow/workflow-model';
import { cn } from '@/utils/cn';

import { getDefaultsFromInputConfig } from '../../node-utils';

import { CloseDialogOrPopoverButton } from './close-dialog-popover-button';
import { ConnectionFormField } from './connection-form-field';
import { DynamicFormField, DynamicFormFieldProps } from './dynamic-form-field';
import { FilterFormFields } from './lecca-filter-form-fields';
import { SharedLabelAndTooltip } from './shared-label-and-tooltip';
import { WebhookListenerDialogContent } from './webhook-listener-dialog-content';

export const ActionNodeConfigFormBuilder = ({
  onSubmit,
  currentNode,
  viewOutput,
  projectId,
  executionId,
  agentId,
  workflowId,
  noPopover,
}: {
  onSubmit?: (values: any) => Promise<Workflow | Agent>;
  currentNode: Node;
  previousNode?: Node;
  viewOutput?: () => void;
  projectId: string;
  executionId: string | undefined;
  agentId: string | undefined;
  workflowId: string | undefined;
  noPopover: boolean | undefined;
}) => {
  //Only used for the manual input button
  const [isSendingManualInput, setIsSendingManualInput] = useState(false);
  const { toast } = useToast();

  const { workflowApps, runSingleNode, isSaving } = useProjectWorkflow();

  const inputConfig = useMemo(() => {
    return currentNode.data.inputConfig as InputConfig;
  }, [currentNode]);

  const workflowApp = useMemo(() => {
    return workflowApps?.find((app) => app.id === currentNode.data.appId);
  }, [currentNode.data.appId, workflowApps]);

  const form = useForm<any>({
    defaultValues:
      currentNode.data.raw ?? getDefaultsFromInputConfig(inputConfig),
  });

  //This might not exist, but if it does, we need to watch for when the value changes
  const manualInputFormField = form.watch('customInputConfigValues');

  const generatedFormFields = useMemo(() => {
    const actionIdOrTriggerId =
      currentNode.data.actionId ?? currentNode.data.triggerId;

    switch (actionIdOrTriggerId) {
      default: {
        return inputConfig.map((fieldConfig) => {
          let oneOrMoreDynamicFormFieldComponents: any;
          if ((fieldConfig as any).inputConfig) {
            //NESTED FIELDS
            oneOrMoreDynamicFormFieldComponents = (
              (fieldConfig as any).inputConfig as FieldConfig[]
            ).map(
              (_fieldConfig: FieldConfig) =>
                (args: DynamicFormFieldFunctionProps) =>
                  DynamicFormField({
                    fieldConfig: _fieldConfig,
                    form,
                    formName: args.formName,
                    isNestedFieldConfig: true,
                    useGroupLabel: args.useGroupLabel,
                    node: currentNode,
                    fieldOverrides: args.fieldOverrides,
                    projectId,
                    agentId,
                    executionId,
                    workflowId,
                  }),
            );
          } else {
            //NORMAL FIELD
            oneOrMoreDynamicFormFieldComponents = (
              args: DynamicFormFieldFunctionProps,
            ) =>
              DynamicFormField({
                fieldConfig: fieldConfig as FieldConfig,
                form,
                formName: args.formName,
                useGroupLabel: args.useGroupLabel,
                node: currentNode,
                fieldOverrides: args.fieldOverrides,
                projectId,
                agentId,
                executionId,
                workflowId,
              });
          }

          const renderComponent = (args: DynamicFormFieldFunctionProps) => {
            if (Array.isArray(oneOrMoreDynamicFormFieldComponents)) {
              return oneOrMoreDynamicFormFieldComponents.map(
                (dynamicFormFieldComponentBuilder) =>
                  dynamicFormFieldComponentBuilder({
                    formName: args.formName,
                    useGroupLabel: args.useGroupLabel,
                    fieldOverrides: args.fieldOverrides,
                  }),
              );
            } else {
              return oneOrMoreDynamicFormFieldComponents({
                formName: args.formName,
                useGroupLabel: args.useGroupLabel,
                fieldOverrides: args.fieldOverrides,
              });
            }
          };

          if (fieldConfig.occurenceType === 'multiple') {
            return (
              <MultipleFieldsComponent
                key={fieldConfig.id}
                fieldConfig={fieldConfig as FieldConfig}
                form={form}
                renderComponent={renderComponent}
                executionId={executionId}
              />
            );
          } else if (fieldConfig.occurenceType === 'dynamic') {
            return (
              <DynamicFieldsComponent
                key={fieldConfig.id}
                fieldConfig={fieldConfig as FieldConfig}
                form={form}
                renderComponent={renderComponent}
                node={currentNode}
                projectId={projectId}
                workflowId={workflowId}
                executionId={executionId}
                agentId={agentId}
              />
            );
          } else {
            return renderComponent({
              formName: fieldConfig.id,
              fieldOverrides: {},
            });
          }
        });
      }
    }
  }, [
    agentId,
    currentNode,
    executionId,
    form,
    inputConfig,
    projectId,
    workflowId,
  ]);

  if (!workflowApp) {
    return <div>App Not Found</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (onSubmit) {
            onSubmit(values);
          }
        })}
        className="w-full max-h-[calc(80dvh-100px)] flex flex-col"
      >
        <ScrollArea>
          <Form.Content className="space-y-6 pt-6 overflow-y-auto max-h-full">
            {currentNode.data?.needsConnection && (
              <ConnectionFormField
                form={form}
                workflowApp={workflowApp}
                projectId={projectId}
                executionId={executionId}
              />
            )}
            {generatedFormFields}
            {currentNode.data?.triggerId &&
              !currentNode.data?.viewOptions?.hideConditions && (
                <FilterFormFields
                  form={form}
                  node={currentNode}
                  defaultFilters={{
                    operator: 'OR',
                    filters: form.getValues('leccaFilters')?.['filters'] ?? [],
                  }}
                  projectId={projectId}
                  agentId={agentId}
                />
              )}
          </Form.Content>
        </ScrollArea>
        <Form.Footer className="space-x-2 py-2 border-t flex justify-between">
          <div>
            {!isSaving && currentNode.data?.output && (
              <Button
                type="button"
                variant="ghost"
                size={'sm'}
                onClick={() => {
                  if (viewOutput) {
                    viewOutput();
                  }
                }}
              >
                View Output
              </Button>
            )}
          </div>
          {agentId && (
            <CloseDialogOrPopoverButton noPopover={noPopover}>
              <SaveButton
                currentNode={currentNode}
                form={form}
                onSubmit={async (values) => {
                  return onSubmit!(values).then((data) => {
                    toast({
                      title: 'Agent Action Saved',
                    });

                    return data;
                  });
                }}
                label="Save"
                primary
                shouldMock={false}
                skipValidatingConditions={false}
                tooltip=""
                isSaving={isSaving}
              />
            </CloseDialogOrPopoverButton>
          )}
          {!agentId &&
            executionId &&
            currentNode?.data?.viewOptions?.showManualInputButton && (
              <CloseDialogOrPopoverButton noPopover={noPopover}>
                <Button
                  className={cn('space-x-2 flex')}
                  size={'sm'}
                  variant={'default'}
                  disabled={!manualInputFormField || isSendingManualInput}
                  loading={isSendingManualInput}
                  type="button"
                  onClick={async () => {
                    setIsSendingManualInput(true);

                    const { data, error } =
                      await api.executions.sendManualInput({
                        executionId: executionId!,
                        nodeId: currentNode.id,
                        data: manualInputFormField,
                      });

                    if (error) {
                      toast({
                        title: error,
                        variant: 'destructive',
                      });
                    } else if (data) {
                      toast({
                        title: 'Manual input was successful',
                      });
                    } else {
                      toast({
                        title: 'Something went wrong',
                        variant: 'destructive',
                      });
                    }

                    setIsSendingManualInput(false);
                  }}
                >
                  <span>
                    {
                      currentNode?.data?.viewOptions?.manualInputButtonOptions
                        ?.label
                    }
                  </span>
                  {currentNode?.data?.viewOptions?.manualInputButtonOptions
                    ?.tooltip ? (
                    <Tooltip>
                      <Tooltip.Trigger type="button">
                        <Icons.infoCircle className="size-4" />
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        className="max-w-96 text-wrap text-left cursor-default"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {
                          currentNode.data.viewOptions.manualInputButtonOptions
                            .tooltip
                        }
                      </Tooltip.Content>
                    </Tooltip>
                  ) : null}
                </Button>
              </CloseDialogOrPopoverButton>
            )}
          {!agentId && !executionId && (
            <div className="flex space-x-2">
              {currentNode?.data?.viewOptions?.showWebhookListenerButton && (
                <Dialog>
                  <Dialog.Trigger asChild>
                    <Button
                      type="button"
                      size={'sm'}
                      variant="ghost"
                      disabled={!form.formState.isValid || isSaving}
                      className="text-muted-foreground"
                    >
                      Save & Listen
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <WebhookListenerDialogContent
                      node={currentNode}
                      workflowId={workflowId}
                      form={form}
                      onSubmit={onSubmit}
                    />
                  </Dialog.Content>
                </Dialog>
              )}
              {!currentNode?.data?.viewOptions?.saveButtonOptions
                ?.hideSaveAndTestButton &&
                (currentNode?.data?.viewOptions?.saveButtonOptions
                  ?.replaceSaveAndTestButton ? (
                  <SaveButton
                    currentNode={currentNode}
                    form={form}
                    onSubmit={onSubmit}
                    runSingleNode={runSingleNode}
                    primary={true}
                    label={
                      currentNode?.data?.viewOptions?.saveButtonOptions
                        ?.replaceSaveAndTestButton?.label ?? ''
                    }
                    shouldMock={
                      currentNode?.data?.viewOptions?.saveButtonOptions
                        ?.replaceSaveAndTestButton?.type === 'real'
                        ? false
                        : true
                    }
                    skipValidatingConditions={true}
                    tooltip={
                      currentNode?.data?.viewOptions?.saveButtonOptions
                        ?.replaceSaveAndTestButton?.tooltip ?? undefined
                    }
                    isSaving={isSaving}
                  />
                ) : (
                  <Popover>
                    <Popover.Trigger asChild>
                      <Button
                        type="button"
                        size={'sm'}
                        disabled={!form.formState.isValid || isSaving}
                        variant="ghost"
                        loading={isSaving}
                      >
                        Save & Test
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content className="text-sm w-44 flex flex-col">
                      {!currentNode.data?.viewOptions?.hideMockButton && (
                        <SaveButton
                          currentNode={currentNode}
                          form={form}
                          onSubmit={onSubmit}
                          runSingleNode={runSingleNode}
                          label="Use Mock Data"
                          shouldMock={true}
                          skipValidatingConditions={true}
                          tooltip="This will not execute the action. It will return a fake response. You can reference this response throughout your workflow as if it were real data. This is useful for most cases, but it may not be accurate."
                          isSaving={isSaving}
                        />
                      )}
                      <Separator />
                      <SaveButton
                        currentNode={currentNode}
                        form={form}
                        onSubmit={onSubmit}
                        runSingleNode={runSingleNode}
                        label="Use Real Data"
                        shouldMock={false}
                        skipValidatingConditions={true}
                        tooltip="This will execute the action and return the real response."
                        isSaving={isSaving}
                      />
                      {currentNode.data?.triggerId &&
                        !currentNode.data?.viewOptions?.hideConditions && (
                          <>
                            <Separator />
                            <Button
                              className="space-x-2 px-2 flex items-center justify-start rounded-none"
                              variant="ghost"
                              onClick={() => {
                                form.handleSubmit(async (values) => {
                                  if (onSubmit) {
                                    if (
                                      currentNode.data?.strategy?.startsWith(
                                        'webhook',
                                      )
                                    ) {
                                      const workflowResponse =
                                        await onSubmit(values);

                                      await runSingleNode({
                                        workflowId: workflowResponse.id,
                                        nodeId: currentNode.id,
                                        shouldMock: true,
                                      });
                                    } else {
                                      const workflowResponse =
                                        await onSubmit(values);

                                      await runSingleNode({
                                        workflowId: workflowResponse.id,
                                        nodeId: currentNode.id,
                                      });
                                    }
                                  }
                                })();
                              }}
                            >
                              <span>Validate Conditions</span>
                              <Tooltip>
                                <Tooltip.Trigger type="button">
                                  <Icons.infoCircle className="size-4" />
                                </Tooltip.Trigger>
                                <Tooltip.Content className="max-w-96">
                                  <span className="whitespace-pre-wrap text-left">
                                    This will execute the action using the real
                                    response and use any conditions you've
                                    applied to the trigger. If no conditions are
                                    met, then you will see an error message. If
                                    this is a webhook trigger, then mock data
                                    will be used.
                                  </span>
                                </Tooltip.Content>
                              </Tooltip>
                            </Button>
                          </>
                        )}
                    </Popover.Content>
                  </Popover>
                ))}
              {currentNode.data?.viewOptions?.saveButtonOptions
                ?.hideSaveButton ? null : currentNode?.data?.viewOptions
                  ?.saveButtonOptions?.replaceSaveButton &&
                currentNode?.data?.viewOptions?.saveButtonOptions
                  ?.replaceSaveButton.type !== 'save' ? (
                <SaveButton
                  currentNode={currentNode}
                  form={form}
                  onSubmit={onSubmit}
                  runSingleNode={runSingleNode}
                  primary={true}
                  label={
                    currentNode?.data?.viewOptions?.saveButtonOptions
                      ?.replaceSaveButton?.label ?? ''
                  }
                  shouldMock={
                    currentNode?.data?.viewOptions?.saveButtonOptions
                      ?.replaceSaveButton?.type === 'real'
                      ? false
                      : true
                  }
                  skipValidatingConditions={true}
                  tooltip={
                    currentNode?.data?.viewOptions?.saveButtonOptions
                      ?.replaceSaveButton?.tooltip ?? undefined
                  }
                  isSaving={isSaving}
                />
              ) : (
                <CloseDialogOrPopoverButton noPopover={noPopover}>
                  <Button
                    type="submit"
                    size={'sm'}
                    disabled={!form.formState.isValid || isSaving}
                    loading={isSaving}
                    className="space-x-2"
                  >
                    <span>
                      {currentNode?.data?.viewOptions?.saveButtonOptions
                        ?.replaceSaveButton?.label ?? 'Save'}
                    </span>
                    {currentNode?.data?.viewOptions?.saveButtonOptions
                      ?.replaceSaveButton?.tooltip && (
                      <Tooltip>
                        <Tooltip.Trigger type="button">
                          <Icons.infoCircle className="size-4" />
                        </Tooltip.Trigger>
                        <Tooltip.Content className="max-w-96">
                          <span className="whitespace-pre-wrap text-left">
                            {
                              currentNode.data.viewOptions.saveButtonOptions
                                .replaceSaveButton.tooltip
                            }
                          </span>
                        </Tooltip.Content>
                      </Tooltip>
                    )}
                  </Button>
                </CloseDialogOrPopoverButton>
              )}
            </div>
          )}
        </Form.Footer>
      </form>
    </Form>
  );
};

const SaveButton = ({
  form,
  onSubmit,
  runSingleNode,
  currentNode,
  label,
  tooltip,
  shouldMock,
  skipValidatingConditions,
  primary,
  isSaving,
}: {
  form: UseFormReturn<any, any, undefined>;
  onSubmit: ((values: any) => Promise<Workflow | Agent>) | undefined;
  runSingleNode?: (args: {
    workflowId: string;
    nodeId: string;
    shouldMock: boolean;
    skipValidatingConditions: boolean;
  }) => Promise<void>;
  currentNode: Node;
  label: string;
  tooltip: string;
  shouldMock: boolean;
  skipValidatingConditions: boolean;
  primary?: boolean;
  isSaving: boolean;
}) => {
  return (
    <Button
      className={cn('space-x-2 flex', {
        'items-center justify-start rounded-none': !primary,
      })}
      size={primary ? 'sm' : undefined}
      variant={primary ? 'default' : 'ghost'}
      disabled={!form.formState.isValid || isSaving}
      onClick={() => {
        form.handleSubmit(async (values) => {
          if (onSubmit) {
            const workflowResponse = await onSubmit(values);

            if (runSingleNode) {
              await runSingleNode({
                workflowId: workflowResponse.id,
                nodeId: currentNode.id,
                shouldMock,
                skipValidatingConditions,
              });
            }
          }
        })();
      }}
    >
      <span>{label}</span>
      {tooltip ? (
        <Tooltip>
          <Tooltip.Trigger type="button">
            <Icons.infoCircle className="size-4" />
          </Tooltip.Trigger>
          <Tooltip.Content
            className="max-w-96 text-wrap text-left cursor-default"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {tooltip}
          </Tooltip.Content>
        </Tooltip>
      ) : null}
    </Button>
  );
};

export const MultipleFieldsComponent = ({
  fieldConfig,
  form,
  renderComponent,
  executionId,
}: {
  fieldConfig: FieldConfig;
  form: UseFormReturn<any, any, undefined>;
  renderComponent: (args: DynamicFormFieldFunctionProps) => React.ReactElement;
  executionId: string | undefined;
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldConfig.id,
    rules: {
      required: fieldConfig.required && {
        message: fieldConfig.required.missingMessage,
        value: true,
      },
    },
  });

  return (
    <div className="space-y-4">
      <SharedLabelAndTooltip
        description={fieldConfig.description}
        label={fieldConfig.label}
      />
      <div className="space-y-4">
        {fields.length === 0 ? (
          <RemoveWrapper
            key={0}
            fieldIndex={0}
            remove={remove}
            renderComponent={() =>
              renderComponent({
                formName: `${fieldConfig.id}.${0}`,
                useGroupLabel: true,
                fieldOverrides: {},
              })
            }
          />
        ) : (
          fields.map((_field, fieldIndex) => {
            return (
              <RemoveWrapper
                key={fieldIndex}
                fieldIndex={fieldIndex}
                remove={remove}
                renderComponent={() =>
                  renderComponent({
                    formName: `${fieldConfig.id}.${fieldIndex}`,
                    useGroupLabel: true,
                    fieldOverrides: {},
                  })
                }
              />
            );
          })
        )}
        {!executionId && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant={'ghost'}
              onClick={() => append([''])}
              size={'sm'}
            >
              Add {fieldConfig.label}
              <Icons.plus className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const DynamicFieldsComponent = ({
  fieldConfig,
  form,
  renderComponent,
  node,
  projectId,
  workflowId,
  executionId,
  agentId,
}: {
  fieldConfig: FieldConfig;
  form: UseFormReturn<any, any, undefined>;
  renderComponent: (args: DynamicFormFieldFunctionProps) => React.ReactElement;
  node: Node;
  projectId: string;
  workflowId: string | undefined;
  executionId: string | undefined;
  agentId: string | undefined;
}) => {
  const refreshRef = React.useRef<HTMLButtonElement>(null);

  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState(false);
  /**
   * If this matches dependsOnValue, then we don't run the useEffect to set the dependsOnValues
   * This prevents an infinite loop in the use effect.
   */
  const [
    dependsOnChangeHackValueComparison,
    setDependsOnChangeHackValueComparison,
  ] = useState<Record<string, any>>();
  const [dynamicData, setDynamicData] =
    useState<{ label: string; value: string }[]>();
  const connectionId = form.watch('connectionId');
  const dependsOnWatchers = form.watch(
    fieldConfig.loadOptions?.dependsOn?.map
      ? fieldConfig.loadOptions.dependsOn.map((val: any) => val.id ?? val)
      : [''],
  );
  const [dependsOnValues, setDependsOnValues] = useState<Record<string, any>>();
  const { toast } = useToast();

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: fieldConfig.id,
    rules: {
      required: fieldConfig.required && {
        message: fieldConfig.required.missingMessage,
        value: true,
      },
    },
  });

  const loadDynamicData = useCallback(
    async ({ resetData }: { resetData: boolean }) => {
      if (executionId) {
        return;
      }

      if (resetData) {
        //We need to call replace([]) after the async call so that setDynamicData and replace([]) are batched and the use effect only runs once
        // replace([]); //Reset fields to empty, so that the new dynamic data can override it in the useEffect
      } else if (!dependsOnValues && fieldConfig.loadOptions?.dependsOn) {
        //dynamic data will only be set if they're all set.
        return;
      } else if (fields.length > 0) {
        //If fields are already set, don't load dynamic data again
        //Unless it's select or multi-select. Those need to be set so the dropdown value exists
        switch (fieldConfig.inputType) {
          case 'select':
          case 'multi-select':
            break;
          default:
            return;
        }
      }

      setIsLoadingDynamicData(true);
      try {
        const appId = node.data.appId;
        const actionId = node.data.actionId;
        const triggerId = node.data.triggerId;

        let selectOptions: { label: string; value: string }[] | undefined =
          undefined;

        const satisfiesConnectionReqs =
          (node.data?.needsConnection && connectionId) ||
          !node.data?.needsConnection;

        if (satisfiesConnectionReqs && appId) {
          if (actionId || triggerId) {
            selectOptions = await appQueryClient.fetchQuery({
              queryKey: [
                'workflow-apps',
                'retrieveDynamicValues',
                {
                  fieldId: fieldConfig.id,
                  connectionId: connectionId,
                  appId: appId,
                  actionId: actionId,
                  triggerId: triggerId,
                  workflowId,
                  agentId,
                },
              ],
              queryFn: async () => {
                if (projectId) {
                  const response = actionId
                    ? await api.workflowApps.retrieveActionDynamicValues({
                        actionId,
                        projectId,
                        workflowId,
                        agentId,
                        appId,
                        data: {
                          fieldId: fieldConfig.id,
                          connectionId: connectionId,
                        },
                        extraOptions: { ...dependsOnValues },
                      })
                    : await api.workflowApps.retrieveTriggerDynamicValues({
                        triggerId,
                        projectId,
                        workflowId,
                        agentId,
                        appId: appId,
                        data: {
                          fieldId: fieldConfig.id,
                          connectionId: connectionId,
                        },
                        extraOptions: { ...dependsOnValues },
                      });
                  if (response.data) {
                    return response.data;
                  } else {
                    throw response.error;
                  }
                } else {
                  return [];
                }
              },
            });
          }
        }

        if (resetData) {
          replace([]);
        }

        setDynamicData(selectOptions);
      } catch (error: any) {
        toast({
          title: 'Error loading dynamic data',
          description: error,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDynamicData(false);
      }
    },
    [
      agentId,
      connectionId,
      dependsOnValues,
      executionId,
      fieldConfig.id,
      fieldConfig.inputType,
      fieldConfig.loadOptions?.dependsOn,
      fields.length,
      node.data.actionId,
      node.data.appId,
      node.data?.needsConnection,
      node.data.triggerId,
      projectId,
      replace,
      toast,
      workflowId,
    ],
  );

  const DynamicRefreshButton = useMemo(() => {
    const satisfiesConnectionReqs =
      (node.data?.needsConnection && connectionId) ||
      !node.data?.needsConnection;

    return (
      satisfiesConnectionReqs &&
      !executionId && (
        <Button
          ref={refreshRef}
          variant="ghost"
          size="sm"
          className={cn('text-muted-foreground text-xs', {
            hidden: fieldConfig.loadOptions?.hideRefreshButton,
          })}
          type="button"
          loading={isLoadingDynamicData}
          onClick={async () => {
            const appId = node.data.appId;
            const actionId = node.data.actionId;
            const triggerId = node.data.triggerId;

            setIsLoadingDynamicData(true);

            await appQueryClient.invalidateQueries({
              exact: true,
              queryKey: [
                'workflow-apps',
                'retrieveDynamicValues',
                {
                  fieldId: fieldConfig.id,
                  connectionId: connectionId,
                  appId: appId,
                  actionId: actionId,
                  triggerId: triggerId,
                  workflowId,
                  agentId,
                },
              ],
            });

            loadDynamicData({ resetData: true });
          }}
        >
          Refresh
        </Button>
      )
    );
  }, [
    agentId,
    connectionId,
    executionId,
    fieldConfig.id,
    fieldConfig.loadOptions?.hideRefreshButton,
    isLoadingDynamicData,
    loadDynamicData,
    node.data.actionId,
    node.data.appId,
    node.data?.needsConnection,
    node.data.triggerId,
    workflowId,
  ]);

  useEffect(() => {
    if (fieldConfig.loadOptions?.dependsOn) {
      const tempDependsOnValues: Record<string, any> = {};
      let allValuesSet = true;
      dependsOnWatchers.forEach((watcherValue, index) => {
        if (!watcherValue) {
          allValuesSet = false;
          return false;
        }

        const dependsOnItem = fieldConfig.loadOptions!.dependsOn[index];
        if ((dependsOnItem as any).value) {
          //Check if the value matches the watcherValue
          if (
            JSON.stringify((dependsOnItem as any).value) !==
            JSON.stringify(watcherValue)
          ) {
            allValuesSet = false;
            return false;
          }
        }

        tempDependsOnValues[(dependsOnItem as any)?.id ?? dependsOnItem] =
          watcherValue;
      });

      if (
        allValuesSet &&
        JSON.stringify(tempDependsOnValues) !==
          JSON.stringify(dependsOnChangeHackValueComparison)
      ) {
        setDependsOnChangeHackValueComparison(tempDependsOnValues);
        setDependsOnValues(tempDependsOnValues);

        if (dynamicData && fieldConfig.loadOptions?.forceRefresh) {
          //Only forcing after dynamic data has been loaded. This prevents the refresh from overriding the values before the dynamic data is loaded
          //If you remove dynamicData, then the saved values will always be overwritten since refresh click will reset the values.

          setTimeout(() => {
            refreshRef.current?.click();
          }, 100); //Keep this at 100. Since we're using react strict mode, if it's set to 0, it won't work in production
        }
      } else if (
        !allValuesSet &&
        JSON.stringify(tempDependsOnValues) !==
          JSON.stringify(dependsOnChangeHackValueComparison)
      ) {
        setDependsOnChangeHackValueComparison(undefined);
        setDependsOnValues(undefined);
      }
    }
  }, [
    dependsOnChangeHackValueComparison,
    dependsOnValues,
    dependsOnWatchers,
    dynamicData,
    fieldConfig.id,
    fieldConfig.loadOptions,
    fieldConfig.loadOptions?.dependsOn,
    replace,
  ]);

  useEffect(() => {
    if (dynamicData) {
      const formattedData = formatDynamicOptionsBasedOnInputType({
        dynamicData,
        fieldConfig,
      });

      if (fields.length === 0) {
        replace(formattedData);
      }
    }
  }, [dynamicData, fieldConfig, fields.length, replace]);

  useEffect(() => {
    loadDynamicData({ resetData: false });
  }, [loadDynamicData, connectionId]);

  if (!dependsOnValues && fieldConfig.loadOptions?.dependsOn) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <SharedLabelAndTooltip
          description={fieldConfig.description}
          label={fieldConfig.label}
          requiredForAgent={fieldConfig.inputType === 'map'}
        />
        {DynamicRefreshButton}
      </div>
      {isLoadingDynamicData ? (
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="w-24 h-6" />
              <Skeleton className="h-10" />
            </div>
          ) : (
            Array.from({ length: fields.length }).map((_, index) => (
              <DynamicMultipleSkeleton key={index} />
            ))
          )}
        </div>
      ) : fields.length === 0 ? (
        <Input disabled placeholder="No values" />
      ) : (
        <div className="space-y-4">
          {fields.map((_field, fieldIndex) => {
            return renderComponent({
              formName: `${fieldConfig.id}.${fieldIndex}`,
              useGroupLabel: true,
              fieldOverrides: {},
            });
          })}
        </div>
      )}
    </div>
  );
};

const DynamicMultipleSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="w-32 h-3" />
      <Skeleton className="h-8" />
    </div>
  );
};

const RemoveWrapper = ({
  fieldIndex,
  renderComponent,
  remove,
}: {
  fieldIndex: number;
  renderComponent: () => any;
  remove: UseFieldArrayRemove;
}) => {
  return (
    <div className="relative space-y-4 group">
      {renderComponent()}
      {fieldIndex > 0 && (
        <Icons.trash
          className="size-4 absolute -top-3 -right-4 cursor-pointer hidden group-hover:block text-muted-foreground"
          onClick={() => {
            remove(fieldIndex);
          }}
        />
      )}
    </div>
  );
};

const formatDynamicOptionsBasedOnInputType = ({
  fieldConfig,
  dynamicData,
}: {
  fieldConfig: FieldConfig;
  dynamicData?: { label: string; value: string }[];
}) => {
  /**
   * Whatever you return will be set to the field array
   * Even if you have a single dynamic field, it will be an array.
   *
   * For example, for 'select' if I return an array of 3 values. 3 select fields will be created.
   * We will only do 1 for select fields. If you want multiple dynamic select fields, then the server will have
   * to create 3 individual dynamic select fields. In the case of a dynamic map field, we don't want
   * individual fields, so we will return an array of the fields.
   */

  switch (fieldConfig.inputType) {
    case 'select': {
      fieldConfig.selectOptions = dynamicData;

      return [dynamicData?.[0]?.value];
    }
    case 'map':
      return (
        dynamicData?.map((data) => ({
          key: data.label,
          value: '',
        })) ?? []
      );
    default:
      throw new Error(
        `Dynamic load options for ${fieldConfig.inputType} is not handled yet`,
      );
  }
};

type DynamicFormFieldFunctionProps = {
  formName: string;
  useGroupLabel?: boolean;
  fieldOverrides: DynamicFormFieldProps['fieldOverrides'];
};
