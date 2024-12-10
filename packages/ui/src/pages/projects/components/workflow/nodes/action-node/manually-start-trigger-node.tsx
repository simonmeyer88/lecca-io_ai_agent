import { isValid } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ControllerRenderProps, FieldValues, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { NodeProps } from 'reactflow';

import { api } from '../../../../../../api/api-library';
import { Icons } from '../../../../../../components/icons';
import { Button } from '../../../../../../components/ui/button';
import { DatePicker } from '../../../../../../components/ui/date-picker';
import { DateTimePicker } from '../../../../../../components/ui/date-time-picker';
import { Dialog } from '../../../../../../components/ui/dialog';
import { Form } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { Select } from '../../../../../../components/ui/select';
import { Tooltip } from '../../../../../../components/ui/tooltip';
import { useProjectWorkflow } from '../../../../../../hooks/useProjectWorkflow';
import { useToast } from '../../../../../../hooks/useToast';
import { FieldConfig } from '../../../../../../models/workflow/input-config-model';

/**
 * Not actually a node, but appears on the canvas like an node
 */
export function ManuallyStartTriggerNode({
  nodeProps,
  projectId,
  executionId,
}: {
  nodeProps: NodeProps;
  projectId: string;
  executionId: string | undefined;
}) {
  const { runSingleNode, saveWorkflow } = useProjectWorkflow();
  const { toast } = useToast();
  const [newExecutionId, setNewExecutionId] = useState<string>();
  const [runStatus, setRunStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const form = useForm({
    mode: 'all',
    defaultValues: {},
  });

  const customInputConfig = useMemo((): FieldConfig[] => {
    const manuallyRunNodeData = nodeProps.data;

    if (!manuallyRunNodeData) {
      return [];
    } else {
      const manuallyRunNodeInputConfig =
        manuallyRunNodeData.value?.customInputConfig;

      return manuallyRunNodeInputConfig ?? [];
    }
  }, [nodeProps.data]);

  const onSubmit = async (values: Record<string, string | number>) => {
    if (saveWorkflow === undefined || runSingleNode === undefined) {
      return;
    }

    setRunStatus('loading');
    try {
      const savedWorkflowResponse = await saveWorkflow();

      //The workflowId might've not existed until now when we saved the workflow
      //because this could've been a new workflow.
      const newOrExistingWorkflowId = savedWorkflowResponse?.id;

      if (newOrExistingWorkflowId) {
        const executionResponse = await api.executions.manuallyExecuteWorkflow({
          workflowId: newOrExistingWorkflowId,
          inputData: values,
        });

        if (executionResponse.data) {
          setRunStatus('success');
          setNewExecutionId(executionResponse.data.id);
        } else {
          throw new Error(executionResponse.error);
        }

        setRunStatus('success');
      } else {
        throw new Error('Failed to save workflow');
      }
    } catch (e: any) {
      setRunStatus('error');
      toast({
        title: e.message ?? 'Failed to run workflow',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const defaultValues = customInputConfig.reduce(
      (acc, fieldConfig) => ({
        ...acc,
        [fieldConfig.id]: fieldConfig.defaultValue ?? undefined,
      }),
      {},
    );
    form.reset(defaultValues);
  }, [customInputConfig, form]);

  return projectId && !executionId ? (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setRunStatus('idle');
        }
      }}
    >
      <Dialog.Trigger>
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 border flex items-center action-node !w-[unset] !p-2 space-x-1 bg-background hover:border-blue-400 shadow-sm group">
          <Icons.play className="size-3 group-hover:text-blue-400" />
        </div>
      </Dialog.Trigger>
      <Dialog.Content>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {runStatus === 'success' ? (
              <SuccessFormContent
                projectId={projectId}
                newExecutionId={newExecutionId}
              />
            ) : runStatus === 'error' ? (
              <ErrorFormContent />
            ) : (
              <>
                <Form.Header>
                  <Form.Title>Manually Run</Form.Title>
                  <Form.Subtitle>
                    Press <strong>Run</strong> to trigger this workflow
                    manually.
                  </Form.Subtitle>
                </Form.Header>
                <Form.Content>
                  <CustomInputConfigFormFields
                    form={form}
                    customInputConfig={customInputConfig}
                  />
                </Form.Content>
                <Form.Footer className="space-x-2 flex justify-end">
                  <Dialog.Close asChild>
                    <Button variant="outline">Close</Button>
                  </Dialog.Close>
                  <Button
                    variant="default"
                    loading={runStatus === 'loading'}
                    disabled={
                      !form.formState.isValid || runStatus === 'loading'
                    }
                  >
                    Run
                  </Button>
                </Form.Footer>
              </>
            )}
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  ) : null;
}

export function CustomInputConfigFormFields({
  form,
  idPrefix,
  customInputConfig,
}: {
  form: ReturnType<typeof useForm>;
  /**
   * Used for the name. To group custom inputs under a single object.
   */
  idPrefix?: string;
  customInputConfig: FieldConfig[];
}) {
  const Field = useCallback(
    ({
      fieldConfig,
      field,
      formName,
    }: {
      fieldConfig: FieldConfig;
      field: ControllerRenderProps<FieldValues, string>;
      formName: string;
    }) => {
      form.register(formName, {
        required: !!fieldConfig.required,
      });

      switch (fieldConfig.inputType) {
        case 'text':
          return (
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder="Add a value"
            />
          );
        case 'number':
          return (
            <Input
              type="number"
              {...field}
              value={field.value ?? ''}
              placeholder="Add a value"
            />
          );
        case 'date':
          return (
            <DatePicker
              value={
                isValid(new Date(field.value))
                  ? new Date(field.value)
                  : undefined
              }
              placeholder={
                field.value
                  ? isValid(new Date(field.value))
                    ? 'Valid date'
                    : 'Invalid date'
                  : 'Pick a date'
              }
              onChange={(date) => field.onChange(date)}
            />
          );
        case 'date-time':
          return (
            <DateTimePicker
              value={
                isValid(new Date(field.value))
                  ? new Date(field.value)
                  : undefined
              }
              placeholder={
                field.value
                  ? isValid(new Date(field.value))
                    ? 'Valid date'
                    : 'Invalid date'
                  : 'Pick a date'
              }
              hourCycle={12}
              granularity="minute"
              onChange={(date) => field.onChange(date)}
            />
          );
        case 'select':
          return (
            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
            >
              <Select.Trigger>
                <Select.Value
                  placeholder={
                    field.value ? (field.value as string) : 'Select a value'
                  }
                />
              </Select.Trigger>
              <Select.Content>
                {fieldConfig.selectOptions?.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                )) ?? []}
              </Select.Content>
            </Select>
          );
        default:
          throw new Error(
            'Invalid input type in CustomInputConfigFormFields: ' +
              fieldConfig.inputType,
          );
      }
    },
    [form],
  );

  return (
    <div className="flex flex-col space-y-4">
      {customInputConfig.map((fieldConfig) => (
        <Form.Field
          key={fieldConfig.id}
          control={form.control}
          name={`${idPrefix ? `${idPrefix}.` : ''}${fieldConfig.id}`}
          render={({ field }) => (
            <Form.Item className="flex flex-col space-y-2">
              <Form.Label className="flex space-x-1">
                <span>{fieldConfig.id}</span>
                {!!fieldConfig.required && (
                  <Tooltip>
                    <Tooltip.Trigger>*</Tooltip.Trigger>
                    <Tooltip.Content>This field is required</Tooltip.Content>
                  </Tooltip>
                )}
              </Form.Label>
              <Form.Control>
                <Field
                  fieldConfig={fieldConfig}
                  field={field}
                  formName={fieldConfig.id}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ))}
    </div>
  );
}

function SuccessFormContent({
  newExecutionId,
  projectId,
}: {
  newExecutionId?: string;
  projectId: string;
}) {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pt-8 ">
          <Icons.zap className="size-6 mb-4" />
          <Form.Title>Workflow executed</Form.Title>
          <Form.Subtitle>
            You can view the workflow execution{' '}
            <Link
              to={`/projects/${projectId}/executions/${newExecutionId}`}
              className="underline"
            >
              here
            </Link>
          </Form.Subtitle>
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

function ErrorFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pt-8 ">
          <Icons.x className="w-12 h-12 text-error" />
          <Form.Title>Workflow trigger failed.</Form.Title>
          <Form.Description className="text-center">
            Could not trigger a workflow. Please double check your workflow
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
