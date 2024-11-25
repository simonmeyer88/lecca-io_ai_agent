import React, { useCallback, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Node } from 'reactflow';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ComboBox } from '@/components/ui/combo-box';
import { DatePicker } from '@/components/ui/date-picker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Table } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import {
  COMMON_INPUT_TYPES,
  CommonInputType,
  FieldConfig,
  InputConfig,
} from '@/models/workflow/input-config-model';
import { cn } from '@/utils/cn';

export function ConfigBuilderFormField({
  readonly,
  form,
  node,
}: {
  form: UseFormReturn;
  readonly?: boolean;
  node: Node;
}) {
  const [inputConfig, setInputConfig] = useState<InputConfig>(
    form.getValues('customInputConfig') ?? [],
  );

  const onAddInput = (type: CommonInputType) => {
    setInputConfig((prev) => [
      ...prev,
      {
        id: '',
        label: '',
        inputType: type,
        description: '',
        defaultValue: '',
        selectOptions: [],
      },
    ]);

    //Purposely not saving to form state here. We only save when we change the values in that new field config.
    // form.setValue('customInputConfig', newConfig); // <- not doing this
  };

  return (
    <div className="flex flex-col">
      {inputConfig.length === 0 ? (
        <div className="text-muted-foreground ml-1 text-sm">
          {readonly ? (
            <div className="text-primary">No optional inputs configured</div>
          ) : (
            'Add optional inputs'
          )}
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row className="hover:bg-transparent border-none">
              <Table.Head>
                <div className="flex items-center space-x-1">
                  <span>Input Name</span>
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icons.infoCircle className="size-4" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      Name of the input field. Only alphanumeric characters are
                      allowed.
                    </Tooltip.Content>
                  </Tooltip>
                </div>
              </Table.Head>
              <Table.Head>
                <div className="flex items-center space-x-1">
                  {readonly ? <span>Value</span> : <span>Default Value</span>}
                  {!readonly && (
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Icons.infoCircle className="size-4" />
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        If no value is provided, this value will be used by
                        default.
                      </Tooltip.Content>
                    </Tooltip>
                  )}
                </div>
              </Table.Head>
              <Table.Head>
                <Tooltip>
                  <Tooltip.Trigger>*</Tooltip.Trigger>
                  <Tooltip.Content>Make this field required</Tooltip.Content>
                </Tooltip>
              </Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {inputConfig.map((fieldConfig, index) => (
              <FieldBuilder
                key={index}
                fieldConfig={fieldConfig as FieldConfig}
                fieldConfigIndex={index}
                form={form}
                setInputConfig={setInputConfig}
                readonly={!!readonly}
                node={node}
              />
            ))}
          </Table.Body>
        </Table>
      )}

      {!readonly && (
        <div className="flex justify-start mt-4">
          <FieldTypePicker onSelect={onAddInput} />
        </div>
      )}
    </div>
  );
}

function FieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  form,
  setInputConfig,
  node,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  form: UseFormReturn;
  setInputConfig: React.Dispatch<React.SetStateAction<InputConfig>>;
  node: Node;
}) {
  const updateFieldConfigByIndex = useCallback(
    ({
      index,
      newFieldConfig,
    }: {
      index: number;
      newFieldConfig: FieldConfig;
    }) => {
      setInputConfig((prev) => {
        const newConfig = [...prev];
        newConfig[index] = newFieldConfig;

        form.setValue('customInputConfig', newConfig);
        return newConfig;
      });
    },
    [form, setInputConfig],
  );

  const deleteFieldConfigByIndex = useCallback(
    (index: number) => {
      setInputConfig((prev) => {
        const newConfig = [...prev];
        newConfig.splice(index, 1);

        form.setValue('customInputConfig', newConfig);
        return newConfig;
      });
    },
    [form, setInputConfig],
  );

  const Field = useMemo(() => {
    let readonlyValue: string | undefined;

    if (readonly) {
      readonlyValue = node.data?.output?.[fieldConfig.id];
    }

    const fieldProps = {
      fieldConfig,
      fieldConfigIndex,
      updateFieldConfigByIndex,
      readonly,
      readonlyValue,
    };

    switch (fieldConfig.inputType) {
      case 'text':
        return <TextFieldBuilder {...fieldProps} />;
      case 'number':
        return <NumberFieldBuilder {...fieldProps} />;
      case 'select':
        return <SelectFieldBuilder {...fieldProps} />;
      case 'multi-select':
        //TODO: switch to another multi select ocmponent. the way this one is built won't show up within a table cell.
        //But it also doesn't use portals in a good way so they get cut off within a node config popover. So we just need a better component.
        //Try using https://shadcnui-expansions.typeart.cc/docs/multiple-selector
        return <MultiSelectFieldBuilder {...fieldProps} />;
      case 'date':
        return <DateFieldBuilder {...fieldProps} />;
      case 'date-time':
        return <DateTimeFieldBuilder {...fieldProps} />;
      default:
        throw new Error(
          `Unknown input type for config ubilder: ${fieldConfig.inputType}`,
        );
    }
  }, [fieldConfig, fieldConfigIndex, node, readonly, updateFieldConfigByIndex]);

  return (
    <Table.Row className="hover:bg-transparent border-b-0">
      {Field}
      {
        <Table.Cell>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Checkbox
                disabled={readonly}
                checked={fieldConfig.required !== undefined}
                onCheckedChange={(checked) =>
                  updateFieldConfigByIndex({
                    index: fieldConfigIndex,
                    newFieldConfig: {
                      ...fieldConfig,
                      required: checked
                        ? {
                            missingMessage: fieldConfig.id + ' is required',
                            missingStatus: 'warning',
                          }
                        : undefined,
                    },
                  })
                }
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Make this field required.</Tooltip.Content>
          </Tooltip>
        </Table.Cell>
      }
      {!readonly && (
        <Table.Cell>
          <Button
            className="p-0 px-2"
            variant={'ghost'}
            type="button"
            onClick={() => {
              deleteFieldConfigByIndex(fieldConfigIndex);
            }}
          >
            <Icons.trash className="size-4" />
          </Button>
        </Table.Cell>
      )}
    </Table.Row>
  );
}

function TextFieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  updateFieldConfigByIndex,
  readonlyValue,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
  readonlyValue?: string;
}) {
  return (
    <>
      <Table.Cell>
        <Input
          placeholder="Add name"
          className="max-w-48"
          value={fieldConfig.id}
          onChange={(e) => {
            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); // Only allow alphanumeric characters
            updateFieldConfigByIndex({
              index: fieldConfigIndex,
              newFieldConfig: {
                ...fieldConfig,
                id: sanitizedValue,
              },
            });
          }}
          disabled={readonly}
        />
      </Table.Cell>
      <Table.Cell>
        {readonly ? (
          <Input value={readonlyValue} disabled />
        ) : (
          <Input
            placeholder="Add text"
            className="max-w-44"
            value={fieldConfig.defaultValue}
            onChange={(e) =>
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  defaultValue: e.target.value,
                },
              })
            }
            disabled={readonly}
          />
        )}
      </Table.Cell>
    </>
  );
}

function NumberFieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  updateFieldConfigByIndex,
  readonlyValue,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
  readonlyValue?: string;
}) {
  return (
    <>
      <Table.Cell>
        <Input
          placeholder="Add name"
          className="max-w-48"
          value={fieldConfig.id}
          onChange={(e) => {
            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); // Only allow alphanumeric characters
            updateFieldConfigByIndex({
              index: fieldConfigIndex,
              newFieldConfig: {
                ...fieldConfig,
                id: sanitizedValue,
              },
            });
          }}
          disabled={readonly}
        />
      </Table.Cell>
      <Table.Cell>
        {readonly ? (
          <Input value={readonlyValue} disabled />
        ) : (
          <Input
            type="number"
            placeholder="Add number"
            className="max-w-44"
            value={fieldConfig.defaultValue}
            onChange={(e) =>
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  defaultValue: e.target.value,
                },
              })
            }
            disabled={readonly}
          />
        )}
      </Table.Cell>
    </>
  );
}

function SelectFieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  updateFieldConfigByIndex,
  readonlyValue,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
  readonlyValue?: string;
}) {
  return (
    <>
      <Table.Cell>
        <div className="inline-block relative">
          <Input
            className="pr-24 max-w-48"
            placeholder="Add name"
            value={fieldConfig.id}
            onChange={(e) => {
              const sanitizedValue = e.target.value.replace(
                /[^a-zA-Z0-9]/g,
                '',
              ); // Only allow alphanumeric characters
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  id: sanitizedValue,
                },
              });
            }}
            disabled={readonly}
          />
          {!readonly && (
            <Popover>
              <Popover.Trigger asChild>
                <Button
                  size="sm"
                  type="button"
                  variant={'ghost'}
                  className="absolute top-1/2 -translate-y-1/2 right-0.5 space-x-1"
                >
                  <span className="text-muted-foreground">Options</span>
                  <Icons.pencil className="size-3 text-muted-foreground" />
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <OptionsBuilder
                  fieldConfig={fieldConfig}
                  fieldConfigIndex={fieldConfigIndex}
                  updateFieldConfigByIndex={updateFieldConfigByIndex}
                />
              </Popover.Content>
            </Popover>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        {readonly ? (
          <Input value={readonlyValue} disabled />
        ) : (
          <ComboBox
            dropdownWidthMatchesButton
            className="h-9 w-full max-w-44 overflow-hidden"
            toggle
            items={fieldConfig.selectOptions}
            defaultSelectedItem={{
              value: fieldConfig.defaultValue,
              label: fieldConfig.defaultValue,
            }}
            disabled={readonly}
            onChange={(items) => {
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  defaultValue: items,
                },
              });
            }}
          />
        )}
      </Table.Cell>
    </>
  );
}

function MultiSelectFieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  updateFieldConfigByIndex,
  readonlyValue,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
  readonlyValue?: string;
}) {
  return (
    <>
      <Table.Cell>
        <div className="inline-block relative">
          <Input
            className="pr-24 max-w-48"
            placeholder="Add name"
            value={fieldConfig.id}
            onChange={(e) => {
              const sanitizedValue = e.target.value.replace(
                /[^a-zA-Z0-9]/g,
                '',
              ); // Only allow alphanumeric characters
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  id: sanitizedValue,
                },
              });
            }}
            disabled={readonly}
          />

          {!readonly && (
            <Popover>
              <Popover.Trigger asChild>
                <Button
                  size="sm"
                  type="button"
                  variant={'ghost'}
                  className="absolute top-1/2 -translate-y-1/2 right-0.5 space-x-1"
                >
                  <span className="text-muted-foreground">Options</span>
                  <Icons.pencil className="size-3 text-muted-foreground" />
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <OptionsBuilder
                  fieldConfig={fieldConfig}
                  fieldConfigIndex={fieldConfigIndex}
                  updateFieldConfigByIndex={updateFieldConfigByIndex}
                />
              </Popover.Content>
            </Popover>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        {readonly ? (
          <Input value={readonlyValue} disabled />
        ) : (
          <MultiSelect
            className="max-w-44"
            items={
              fieldConfig.selectOptions?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
            value={
              fieldConfig.defaultValue?.length ? fieldConfig.defaultValue : []
            }
            onChange={(items) => {
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  defaultValue: items,
                },
              });
            }}
            disabled={readonly}
          />
        )}
      </Table.Cell>
    </>
  );
}

function DateFieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  updateFieldConfigByIndex,
  readonlyValue,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
  readonlyValue?: string;
}) {
  return (
    <>
      <Table.Cell>
        <Input
          placeholder="Add name"
          className="max-w-48"
          value={fieldConfig.id}
          onChange={(e) => {
            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); // Only allow alphanumeric characters
            updateFieldConfigByIndex({
              index: fieldConfigIndex,
              newFieldConfig: {
                ...fieldConfig,
                id: sanitizedValue,
              },
            });
          }}
          disabled={readonly}
        />
      </Table.Cell>
      <Table.Cell>
        {readonly ? (
          <Input value={readonlyValue} disabled />
        ) : (
          <DatePicker
            className="max-w-44"
            placeholder="Add date"
            value={fieldConfig.defaultValue}
            onChange={(date) =>
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  defaultValue: date,
                },
              })
            }
            disabled={readonly}
          />
        )}
      </Table.Cell>
    </>
  );
}

function DateTimeFieldBuilder({
  fieldConfig,
  fieldConfigIndex,
  readonly,
  updateFieldConfigByIndex,
  readonlyValue,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  readonly: boolean;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
  readonlyValue?: string;
}) {
  return (
    <>
      <Table.Cell>
        <Input
          className="max-w-48"
          placeholder="Add name"
          value={fieldConfig.id}
          onChange={(e) => {
            const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); // Only allow alphanumeric characters
            updateFieldConfigByIndex({
              index: fieldConfigIndex,
              newFieldConfig: {
                ...fieldConfig,
                id: sanitizedValue,
              },
            });
          }}
          disabled={readonly}
        />
      </Table.Cell>
      <Table.Cell>
        {readonly ? (
          <Input value={readonlyValue} disabled />
        ) : (
          <DateTimePicker
            className="max-w-44 pl-0.5 overflow-hidden"
            placeholder="Add date"
            value={fieldConfig.defaultValue}
            hourCycle={12}
            granularity="minute"
            onChange={(date) =>
              updateFieldConfigByIndex({
                index: fieldConfigIndex,
                newFieldConfig: {
                  ...fieldConfig,
                  defaultValue: date,
                },
              })
            }
            disabled={readonly}
          />
        )}
      </Table.Cell>
    </>
  );
}

function OptionsBuilder({
  fieldConfig,
  fieldConfigIndex,
  updateFieldConfigByIndex,
}: {
  fieldConfig: FieldConfig;
  fieldConfigIndex: number;
  updateFieldConfigByIndex: ({
    index,
    newFieldConfig,
  }: {
    index: number;
    newFieldConfig: FieldConfig;
  }) => void;
}) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="text-sm ml-1">Configure Select Options</div>
      <div className="flex flex-col space-y-2">
        {fieldConfig.selectOptions?.length === 0 && (
          <div className="text-muted-foreground text-xs ml-1">
            Click <strong className="text-primary">Add option</strong> to add
            options to your select dropdown
          </div>
        )}
        {fieldConfig.selectOptions?.map((option, index) => {
          return (
            <div className="relative" key={index}>
              <Input
                className={cn('w-full', {
                  'pr-12': fieldConfig.selectOptions?.length !== 1,
                })}
                autoFocus
                required
                value={option.value}
                placeholder="option value"
                onChange={(e) => {
                  const newOptions = [...(fieldConfig.selectOptions ?? [])];

                  newOptions[index] = {
                    value: e.target.value,
                    label: e.target.value,
                  };

                  updateFieldConfigByIndex({
                    index: fieldConfigIndex,
                    newFieldConfig: {
                      ...fieldConfig,
                      selectOptions: newOptions,
                    },
                  });
                }}
              />
              {fieldConfig.selectOptions?.length !== 1 && (
                <Button
                  variant={'ghost'}
                  type="button"
                  className="absolute top-1/2 -translate-y-1/2 right-0.5"
                  onClick={() => {
                    updateFieldConfigByIndex({
                      index: fieldConfigIndex,
                      newFieldConfig: {
                        ...fieldConfig,
                        selectOptions: fieldConfig.selectOptions?.filter(
                          (_, i) => i !== index,
                        ),
                      },
                    });
                  }}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => {
            updateFieldConfigByIndex({
              index: fieldConfigIndex,
              newFieldConfig: {
                ...fieldConfig,
                selectOptions: [
                  ...(fieldConfig.selectOptions ?? []),
                  {
                    value: '',
                    label: '',
                  },
                ],
              },
            });
          }}
        >
          <span>Add option</span>
          <Icons.plus className="ml-2 h-4 w-4" />
        </Button>
        <Popover.Close asChild>
          <Button size="sm" type="button">
            Done
          </Button>
        </Popover.Close>
      </div>
    </div>
  );
}

function FieldTypePicker({
  onSelect,
}: {
  onSelect: (type: CommonInputType) => void;
}) {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" type="button">
          <span>{'Add input'}</span>
          <Icons.plus className="ml-2 h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col space-y-0.5 w-40 pb-2">
        <div>
          <div className="text-sm text-muted-foreground px-4 py-2">
            Select Input Type
          </div>
          <Separator className="mb-2" />
        </div>
        {COMMON_INPUT_TYPES.map((type) => {
          const typeLabel = type
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <Popover.Close asChild key={type}>
              <Button
                onClick={() => onSelect(type)}
                type="button"
                variant={'ghost'}
                className="text-sm font-normal m-1 px-4 py-4 h-9 flex justify-start"
              >
                {typeLabel}
              </Button>
            </Popover.Close>
          );
        })}
      </Popover.Content>
    </Popover>
  );
}
