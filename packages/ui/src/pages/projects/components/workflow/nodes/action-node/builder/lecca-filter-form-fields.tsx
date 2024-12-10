import { isValid } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Node, useReactFlow } from 'reactflow';

import { DynamicInput } from '../../../../../../../components/dynamic-input/dynamic-input';
import {
  KEY_NAME_DELIMITER,
  createNodeAndEdgeMaps,
  findAllPreviousNodes,
} from '../../../../../../../components/dynamic-input/references-popover';
import { Icons } from '../../../../../../../components/icons';
import { Button } from '../../../../../../../components/ui/button';
import { ComboBox } from '../../../../../../../components/ui/combo-box';
import { DateTimePicker } from '../../../../../../../components/ui/date-time-picker';
import { Popover } from '../../../../../../../components/ui/popover';
import { ScrollArea } from '../../../../../../../components/ui/scroll-area';
import { Tooltip } from '../../../../../../../components/ui/tooltip';
import { cn } from '../../../../../../../utils/cn';
import {
  OutputSelector,
  OutputSelectorOnClickArgs,
} from '../output/output-selector';

import { ConditionalPathFilter } from './conditional-paths-form-fields';
import { SharedLabelAndTooltip } from './shared-label-and-tooltip';

export function FilterFormFields({
  node,
  form,
  label,
  description,
  clearLabel,
  conditionalPath,
  defaultFilters,
  readonly,
  projectId,
  agentId,
}: {
  node: Node;
  form: UseFormReturn;
  label?: string;
  description?: string;
  clearLabel?: string;
  conditionalPath?: ConditionalPathFilter;
  defaultFilters: LeccaFilter;
  readonly?: boolean;
  projectId: string;
  agentId: string | undefined;
}) {
  const { getEdges, getNodes } = useReactFlow();
  const [filters, setFilters] = useState<LeccaFilter>(defaultFilters);

  const outputReferences = useMemo(() => {
    if (node.data.triggerId) {
      const nodeOutput = {
        [`${node.id}${KEY_NAME_DELIMITER}${node.data.name}`]: node.data.output,
      };

      const firstKey = Object.keys(nodeOutput)[0];
      return nodeOutput[firstKey];
    } else {
      const edges = getEdges();
      const nodes = getNodes();

      /**
       * Find all previous nodes starting from the current node
       */
      const { nodesMap, edgesMap } = createNodeAndEdgeMaps(nodes, edges);
      const previousNodes = findAllPreviousNodes(node.id, nodesMap, edgesMap);

      const outputArray = previousNodes
        .filter((node) => node.data?.output)
        .map((node) => {
          //The OutputSelector / JsonViewer displays the key, but I want the key to have the name in it so it's easier to identify the key from the name
          //So I'll put them both in with a delimiter that I can split on later
          return {
            key: `${node.id}${KEY_NAME_DELIMITER}${node.data.name}`,
            value: node.data.output,
          };
        });

      const outputObject: Record<string, { key: string; value: any }> = {};

      outputArray.forEach((output) => {
        outputObject[output!.key] = output!.value;
      });

      return outputObject;
    }
  }, [
    getEdges,
    getNodes,
    node.data.name,
    node.data.output,
    node.data.triggerId,
    node.id,
  ]);

  const onSelect = ({
    outputSelector,
    operator,
    groupIndex,
  }: {
    outputSelector: OutputSelectorOnClickArgs;
    operator: 'and' | 'or';
    groupIndex: number;
  }) => {
    //Should always be an array
    if (Array.isArray(outputSelector.path)) {
      //Reverse so the key is in the first item
      const newPath = [...outputSelector.path].reverse();
      let nodeId: string | undefined;
      let nodeName: string | undefined;

      //The first item should always be the key::name, so we can split on the delimiter
      const variableRef: string[] = [];
      const variableNameArr: string[] = [];

      newPath.forEach((key, i) => {
        if (i === 0 && !node.data.triggerId) {
          //Again, we don't need the node id for a trigger, so we'll skip it
          //index 0 is the key::name, so we'll split it but only if it's an action, not a trigger

          const [id, name] = key.split(KEY_NAME_DELIMITER);
          nodeId = id;
          nodeName = name;

          if (!nodeId || !nodeName) {
            throw new Error(`Invalid reference key: ${key}`);
          }

          variableRef.push(nodeId);
          variableNameArr.push(nodeName);
        } else {
          variableRef.push(key);

          if (typeof key === 'number') {
            //Numbers indicate array indexes, so we'll wrap them in parentheses
            variableNameArr.push(`(${key})`);
          } else {
            variableNameArr.push(key);
          }
        }
      });

      /**
       * We currently only support OR operators as a main Lecca Filter type.
       * However in the UI, when we click 'OR', we create a new filter group. When we click
       * 'AND', we add a new condition to the current filter group.
       *
       * All the filter groups are 'OR'ed together. That's what I mean by we only support OR operators as a main Lecca Filter type.
       * This is just to future proof the code, in case we decide to support AND operators as a main Lecca Filter type
       * to allow for more complex conditions.
       */

      if (operator === 'or') {
        setFilters((prev) => {
          const newFilters = [...prev.filters];
          newFilters.splice(groupIndex + 1, 0, [
            {
              //Only for action nodes, not triggers. Triggers only reference they're own output so no reference needed
              refValue: node.data.actionId
                ? `={{ref:${variableRef.join(',')}}}`
                : undefined,
              fieldId: variableRef.join(','),
              condition: 'contains',
              label: variableNameArr.join(' '),
              value: undefined,
            },
          ]);

          return { ...prev, filters: newFilters };
        });
      } else if (operator === 'and') {
        setFilters((prev) => {
          const newFilters = [...prev.filters];
          newFilters[groupIndex].push({
            //Only for action nodes, not triggers. Triggers only reference they're own output so no reference needed
            refValue: node.data.actionId
              ? `={{ref:${variableRef.join(',')}}}`
              : undefined,
            fieldId: variableRef.join(','),
            condition: 'contains',
            label: variableNameArr.join(' '),
            value: undefined,
          });

          return { ...prev, filters: newFilters };
        });
      } else {
        throw new Error(`Invalid operator: ${operator}`);
      }
    }
  };

  useEffect(() => {
    if (conditionalPath) {
      const existingConditionalPathsFilters =
        (form.getValues(
          'conditionalPathsLeccaFilters',
        ) as ConditionalPathFilter[]) ?? [];

      const findCurrentPath = existingConditionalPathsFilters.find(
        (pathFilter) => pathFilter.pathId === conditionalPath.pathId,
      );

      if (!findCurrentPath) {
        form.setValue('conditionalPathsLeccaFilters', [
          ...existingConditionalPathsFilters,
          conditionalPath,
        ]);
      } else {
        form.setValue(
          'conditionalPathsLeccaFilters',
          existingConditionalPathsFilters.map((pathFilter) => {
            if (pathFilter.pathId === conditionalPath.pathId) {
              return { ...conditionalPath, filters: filters };
            } else {
              return pathFilter;
            }
          }),
        );
      }
    } else {
      form.setValue('leccaFilters', filters);
    }
  }, [conditionalPath, filters, form]);

  if (!filters || agentId) {
    // This is just while the use effect is setting the defaults.
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between group mb-3">
        <SharedLabelAndTooltip
          label={label ?? 'Optional Conditions'}
          required={false}
          delayDuration={500}
          small
          description={
            description ??
            'Only trigger your workflow if these conditions are met. Empty fields will always pass conditions, so delete unused fields for accurate checking.'
          }
        />
        {!readonly && filters.filters.length > 0 && (
          <Button
            className="text-muted-foreground text-xs invisible group-hover:visible p-1.5 font-normal h-6 space-x-1"
            variant="ghost"
            onClick={() => {
              setFilters({ operator: 'OR', filters: [] });
            }}
          >
            <span>{clearLabel ?? 'Clear Conditions'}</span>
            <Icons.x className="size-3" />
          </Button>
        )}
      </div>
      <div
        className={cn(
          'flex flex-col justify-start items-start w-full space-y-4',
          {
            'bg-muted/30 border p-3 rounded-md': filters.filters.length > 0,
          },
        )}
      >
        {!readonly && filters.filters.length === 0 && (
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline" className="space-x-1">
                <span>Add Condition</span>
                <Icons.plus />
              </Button>
            </Popover.Trigger>
            <Popover.Content className="p-4 w-[520px]" side="right">
              <ScrollArea className="!max-h-[500px] overflow-y-auto">
                {!outputReferences ||
                (outputReferences &&
                  Object.keys(outputReferences).length === 0) ? (
                  <div className="text-sm text-muted-foreground p-2 flex flex-col space-y-2 items-start">
                    <p>No output data.</p>
                    <p>
                      <em>Save & Test</em> this node to generate output data.
                      You can then add conditions based on the output data.
                    </p>
                  </div>
                ) : (
                  <OutputSelector
                    data={outputReferences}
                    onClick={(outputSelector) =>
                      onSelect({
                        operator: 'or',
                        outputSelector,
                        groupIndex: 0,
                      })
                    }
                    hideRoot
                    keyNameDelimiter={KEY_NAME_DELIMITER}
                  />
                )}
              </ScrollArea>
            </Popover.Content>
          </Popover>
        )}

        {filters.filters.map((filterGroup, groupIndex) => (
          <FilterFieldGroup
            key={groupIndex}
            filterGroup={filterGroup}
            groupIndex={groupIndex}
            setFilters={setFilters}
            node={node}
            onSelect={onSelect}
            outputReferences={outputReferences}
            totalGroups={filters.filters.length}
            readonly={readonly}
            projectId={projectId}
            agentId={agentId}
          />
        ))}
      </div>
    </div>
  );
}
const FilterFieldGroup = ({
  filterGroup,
  groupIndex,
  setFilters,
  node,
  onSelect,
  outputReferences,
  totalGroups,
  readonly,
  projectId,
  agentId,
}: {
  filterGroup: FilterGroup;
  groupIndex: number;
  setFilters: React.Dispatch<React.SetStateAction<LeccaFilter>>;
  node: Node;
  onSelect: ({
    outputSelector,
    operator,
    groupIndex,
  }: {
    outputSelector: OutputSelectorOnClickArgs;
    operator: 'and' | 'or';
    groupIndex: number;
  }) => void;

  outputReferences: Record<string, any>;
  totalGroups: number;
  readonly?: boolean;
  projectId: string;
  agentId: string | undefined;
}) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      {groupIndex !== 0 && (
        <div className="flex space-x-2 items-center w-full group">
          <div className="text-muted-foreground text-xs ml-3 mr-2">OR</div>
          <div className="h-[1px] w-full bg-border" />
          {!readonly && (
            <Button
              className="text-muted-foreground text-xs invisible group-hover:visible p-1.5 font-normal h-6"
              variant="ghost"
              onClick={() => {
                setFilters((prev) => {
                  const newFilters = [...prev.filters];
                  newFilters.splice(groupIndex, 1);
                  return { operator: prev.operator, filters: newFilters };
                });
              }}
            >
              <Icons.trash />
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-col space-y-4 w-full">
        {filterGroup.map((field, fieldIndex) => {
          return (
            <React.Fragment key={fieldIndex}>
              <FilterField
                filterField={field}
                node={node}
                groupIndex={groupIndex}
                fieldIndex={fieldIndex}
                setFilters={setFilters}
                readonly={readonly}
                projectId={projectId}
                agentId={agentId}
              />
              {!readonly && fieldIndex === filterGroup.length - 1 ? (
                <div className="flex justify-start space-x-2 pt-2">
                  <Popover>
                    <Popover.Trigger asChild>
                      <Button
                        variant="outline"
                        size={'sm'}
                        className="space-x-1"
                      >
                        <span>AND</span>
                        <Icons.plus />
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content
                      portal={false}
                      className="p-4 w-[520px]"
                      side="right"
                    >
                      <ScrollArea className="!max-h-[500px] overflow-y-auto">
                        <OutputSelector
                          data={outputReferences}
                          onClick={(outputSelector) =>
                            onSelect({
                              operator: 'and',
                              outputSelector,
                              groupIndex,
                            })
                          }
                          hideRoot
                          keyNameDelimiter={KEY_NAME_DELIMITER}
                        />
                      </ScrollArea>
                    </Popover.Content>
                  </Popover>
                  {groupIndex === totalGroups - 1 && (
                    <Popover>
                      <Popover.Trigger asChild>
                        <Button
                          variant="outline"
                          size={'sm'}
                          className="space-x-1"
                        >
                          <span>OR</span>
                          <Icons.plus />
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content
                        portal={false}
                        className="p-4 w-[520px]"
                        side="right"
                      >
                        <ScrollArea className="!max-h-[500px] overflow-y-auto">
                          <OutputSelector
                            data={outputReferences}
                            onClick={(outputSelector) =>
                              onSelect({
                                operator: 'or',
                                outputSelector,
                                groupIndex,
                              })
                            }
                            hideRoot
                            keyNameDelimiter={KEY_NAME_DELIMITER}
                          />
                        </ScrollArea>
                      </Popover.Content>
                    </Popover>
                  )}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const FilterField = ({
  filterField,
  groupIndex,
  fieldIndex,
  node,
  setFilters,
  readonly,
  projectId,
  agentId,
}: {
  filterField: FilterFieldType;
  groupIndex: number;
  fieldIndex: number;
  node: Node;
  setFilters: React.Dispatch<React.SetStateAction<LeccaFilter>>;
  readonly?: boolean;
  projectId: string;
  agentId: string | undefined;
}) => {
  const setValueOnChange = useCallback(
    (value: string) => {
      setFilters((prev) => {
        const newFilters = [...prev.filters];
        newFilters[groupIndex][fieldIndex].value = value ?? undefined;

        return {
          operator: prev.operator,
          filters: newFilters,
        };
      });
    },
    [fieldIndex, groupIndex, setFilters],
  );

  const selectedCondition = useMemo(() => {
    const conditionToReturn = CONDITIONS.find(
      (c) => c.value === filterField.condition,
    );

    if (conditionToReturn?.type === 'boolean') {
      //This doesn't matter, as long as there's a value.
      //The backend just always passes conditions if there's no value at all.
      setValueOnChange('boolean');
    }

    return conditionToReturn;
  }, [filterField.condition, setValueOnChange]);

  return (
    <div className="flex flex-col space-y-1 items-start">
      <div className="flex items-end justify-between group w-full">
        <Tooltip delayDuration={1000}>
          <Tooltip.Trigger asChild>
            <div className="text-sm ml-1 line-clamp-1">{filterField.label}</div>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <div className="text-sm">{filterField.label}</div>
          </Tooltip.Content>
        </Tooltip>
        {!readonly && (
          <Button
            className="text-muted-foreground text-xs invisible group-hover:visible p-1.5 font-normal h-6"
            variant="ghost"
            onClick={() => {
              setFilters((prev) => {
                const newFilters = [...prev.filters]
                  .map((group, _groupIndex) =>
                    group.filter((_, _fieldIndex) => {
                      if (_groupIndex === groupIndex) {
                        return _fieldIndex !== fieldIndex;
                      } else {
                        return true;
                      }
                    }),
                  )
                  .filter((group) => group.length > 0);

                return { operator: prev.operator, filters: newFilters };
              });
            }}
          >
            <Icons.trash />
          </Button>
        )}
      </div>
      <div className="flex space-x-2 items-center w-full">
        <ComboBox
          disabled={readonly}
          items={CONDITIONS.map((c) => {
            return {
              label: c.label,
              value: c.value,
            };
          })}
          defaultSelectedItem={{
            label: selectedCondition?.label ?? 'Condition not found',
            value: filterField.condition,
          }}
          onChange={(value) => {
            setFilters((prev) => {
              const newFilters = [...prev.filters];
              newFilters[groupIndex][fieldIndex].condition = value as CONDITION;
              newFilters[groupIndex][fieldIndex].value = undefined;

              return {
                operator: prev.operator,
                filters: newFilters,
              };
            });
          }}
          searchLabel="Search condition"
        />
        {selectedCondition?.type ===
        'boolean' ? null : selectedCondition?.type === 'date' ? (
          <DateTimePicker
            disabled={readonly}
            value={
              isValid(new Date(filterField.value as string))
                ? new Date(filterField.value as string)
                : undefined
            }
            hourCycle={12}
            granularity={'minute'}
            onChange={(date) => setValueOnChange(date!.toISOString())}
          />
        ) : (
          <DynamicInput
            placeholder="Add text"
            node={node}
            readOnly={readonly}
            defaultValue={filterField.value}
            className="w-full"
            hideReferences
            onChange={setValueOnChange}
            required={true}
            projectId={projectId}
            agentId={agentId}
          />
        )}
      </div>
    </div>
  );
};

const CONDITIONS = [
  {
    label: 'Contains',
    value: 'contains',
    type: 'text',
  },
  {
    label: 'Does not contain',
    value: 'does_not_contain',
    type: 'text',
  },
  {
    label: 'Equals',
    value: 'equals',
    type: 'text',
  },
  {
    label: 'Does not equal',
    value: 'does_not_equal',
    type: 'text',
  },
  {
    label: 'Exists',
    value: 'exists',
    type: 'boolean',
  },
  {
    label: 'Does not exist',
    value: 'does_not_exist',
    type: 'boolean',
  },
  {
    label: 'Starts with',
    value: 'starts_with',
    type: 'text',
  },
  {
    label: 'Ends with',
    value: 'ends_with',
    type: 'text',
  },
  {
    label: 'Is empty',
    value: 'is_empty',
    type: 'boolean',
  },
  {
    label: 'Is not empty',
    value: 'is_not_empty',
    type: 'boolean',
  },
  {
    label: 'Comes before',
    value: 'comes_before',
    type: 'date',
  },
  {
    label: 'Comes after',
    value: 'comes_after',
    type: 'date',
  },
  {
    label: 'Is in the past',
    value: 'is_in_the_past',
    type: 'date',
  },
  {
    label: 'Is in the future',
    value: 'is_in_the_future',
    type: 'date',
  },
  {
    label: 'Is true',
    value: 'is_true',
    type: 'boolean',
  },
  {
    label: 'Is false',
    value: 'is_false',
    type: 'boolean',
  },
  {
    label: 'Is truthy',
    value: 'is_truthy',
    type: 'boolean',
  },
  {
    label: 'Is falsey',
    value: 'is_falsey',
    type: 'boolean',
  },
  {
    label: 'Is greater than',
    value: 'is_greater_than',
    type: 'number',
  },
  {
    label: 'Is less than',
    value: 'is_less_than',
    type: 'number',
  },
  {
    label: 'Is greater than or equal to',
    value: 'is_greater_than_or_equal_to',
    type: 'number',
  },
  {
    label: 'Is less than or equal to',
    value: 'is_less_than_or_equal_to',
    type: 'number',
  },
  {
    label: 'Matches regex',
    value: 'matches_regex',
    type: 'text',
  },
  {
    label: 'Does not match regex',
    value: 'does_not_match_regex',
    type: 'text',
  },
] as const;

type CONDITION = (typeof CONDITIONS)[number]['value'];

/**
 * Conditions are the individual conditions that make up a filter.
 */
export type FilterFieldType = {
  /**
   * refValue only used for nodes like condition-paths that reference other nodes for their conditional filters.
   * the trigger conditions don't use since because they only reference their own output.
   *
   * This should always be in the format of ={{ref:nodeId,path,to,property}}
   */
  refValue?: string;
  fieldId: string;
  condition: CONDITION;
  label: string;
  value: string | undefined;
};

export type FilterGroup = FilterFieldType[];

export type LeccaFilter = {
  operator: 'OR';
  filters: FilterGroup[];
};
