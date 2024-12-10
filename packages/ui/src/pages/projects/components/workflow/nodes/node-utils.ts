import { Edge, Node, NodeProps } from 'reactflow';
import { v4 } from 'uuid';

import { Connection } from '../../../../../models/connections-model';
import { Variable } from '../../../../../models/variable-model';
import {
  FieldConfig,
  InputConfig,
} from '../../../../../models/workflow/input-config-model';
import {
  SavedActionNode,
  SavedTriggerNode,
  SavedWorkflowNode,
} from '../../../../../models/workflow/node/node-model';
import {
  MappedWorkflowApps,
  WorkflowApp,
} from '../../../../../models/workflow/workflow-app-model';
import { UnionEdgeType as WorkflowEdgeType } from '../../../../../models/workflow/workflow-model';

import { ConditionalPathFilter } from './action-node/builder/conditional-paths-form-fields';
import { DecidePathOptions } from './action-node/builder/decide-paths-form-fields';
import {
  FilterFieldType,
  FilterGroup,
} from './action-node/builder/lecca-filter-form-fields';

export const edgeAndNodeStatuses = [
  'good',
  'warning',
  'error',
  'needsInput', //For executions
  'scheduled', //For executions
  'running', //For executions
  'unknown',
] as const;

export type NodeStatus = (typeof edgeAndNodeStatuses)[number];

export function getNodeStatus({
  node,
  connections,
  variables,
  nodes,
  edges,
}: {
  node: Node | NodeProps;
  connections: Connection[] | undefined;
  variables: Variable[] | undefined;
  nodes: Node[];
  edges: Edge[];
}): {
  status: NodeStatus;
  isComplete: boolean;
  messages: string[];
} {
  if (!connections || !variables) {
    return { status: 'unknown', isComplete: false, messages: [] };
  }

  if (node.type === 'placeholder') {
    return { status: 'good', isComplete: true, messages: [] };
  }

  let status: NodeStatus = 'good';
  let isComplete = true;
  const messages: string[] = [];

  function checkInputConfigStatus({
    fieldConfig,
    parentFieldConfig,
  }: {
    fieldConfig: FieldConfig;
    parentFieldConfig?: FieldConfig;
  }) {
    if ((fieldConfig as any).inputConfig) {
      (fieldConfig as any).inputConfig.forEach(
        (subFieldConfig: FieldConfig) => {
          checkInputConfigStatus({
            fieldConfig: subFieldConfig,
            parentFieldConfig: fieldConfig,
          });
        },
      );
    } else {
      if (fieldConfig.required) {
        let fieldConfigValue;
        if (parentFieldConfig) {
          fieldConfigValue = node.data.value?.[parentFieldConfig.id];
        } else {
          fieldConfigValue = node.data.value?.[fieldConfig.id];
        }

        /**
         * So this isn't a very good check.
         * If we have a nested fields, this is just checking that the parent field exists.
         * The subfields could still be missing. But I we will rely on the form UI to enforce
         * all fields being filled out.
         */

        if (
          fieldConfigValue === undefined ||
          (Array.isArray(fieldConfigValue) && fieldConfigValue.length === 0)
        ) {
          status = fieldConfig.required.missingStatus as NodeStatus;
          isComplete = false;
          messages.push(fieldConfig.required.missingMessage);
        }
      }
    }
  }

  //Check that all required fields are filled out
  node.data.inputConfig.forEach((fieldConfig: FieldConfig) => {
    checkInputConfigStatus({
      fieldConfig,
    });
  });

  //Check that a connection is selected.
  const nodeConnectionId = node.data.value?.connectionId;
  if (node.data.needsConnection) {
    if (nodeConnectionId === undefined) {
      status = 'warning';
      isComplete = false;
      messages.push('Connection is required');
    } else if (
      !connections.some((connection) => connection.id === nodeConnectionId)
    ) {
      status = 'error';
      isComplete = false;
      messages.push("Connection doesn't exist anymore");
    }
  }

  //Check that referenced id's exist
  if (node.data.value) {
    const referenceIds = getReferenceIdsFromNodeValues(node.data.value);
    if (referenceIds.length > 0) {
      let isMissingReferenceId = false;
      referenceIds.some((referenceId) => {
        if (!nodes.some((node) => node.id === referenceId)) {
          isMissingReferenceId = true;
          return true;
        }

        return false;
      });

      if (isMissingReferenceId) {
        status = 'error';
        isComplete = false;
        messages.push('Reference does not exist');
      }
    }

    //Check that variable id's exist
    const variableIds = getVariableIdsFromNodeValues(node.data.value);
    if (variableIds.length > 0) {
      let isMissingVariableId = false;
      variableIds.some((variableId) => {
        if (!variables.some((variable) => variable.id === variableId)) {
          isMissingVariableId = true;
          return true;
        }

        return false;
      });

      if (isMissingVariableId) {
        status = 'error';
        isComplete = false;
        messages.push('Variable does not exist');
      }
    }
  }
  //Check that decidePathOptions match the connected edges (options)
  if (
    node.data.value?.decidePathOptions ||
    node.data.actionId === 'flow-control_action_manually-decide-paths'
  ) {
    const connectedEdges = edges.filter((edge) => edge.source === node.id);

    //connected edges with placeholder nodes don't count
    const connectedEdgesWithActionNodes = connectedEdges.filter((edge) => {
      const connectedNode = nodes.find((n) => n.id === edge.target);
      if (!connectedNode || connectedNode.type === 'placeholder') {
        return false;
      } else {
        return true;
      }
    });

    if (
      connectedEdgesWithActionNodes.length !==
      node.data.value?.decidePathOptions?.length
    ) {
      status = 'warning';
      isComplete = false;
      messages.push(
        'Path options are not in sync with connected paths. Click Save Path Options to sync',
      );
    } else {
      node.data.value?.decidePathOptions?.forEach(
        (pathOption: DecidePathOptions) => {
          if (
            connectedEdgesWithActionNodes.some(
              (edge) => edge.id === pathOption.pathId,
            )
          ) {
            //It exists, so do nothing
          } else {
            status = 'warning';
            isComplete = false;
            messages.push(
              'Path options are not in sync with connected paths. Click Save Path Options to sync',
            );
          }
        },
      );
    }
  }

  return { status, isComplete, messages };
}

function getReferenceIdsFromNodeValues(value: any): string[] {
  const valueString = JSON.stringify(value);
  const references = valueString.match(/={{ref:[^}]+}}/g);
  const referenceIds: string[] = [];

  if (!references) {
    return [];
  }

  for (const reference of references) {
    const referencePathString = reference.split(':')[1].replace('}}', '');

    //Reference path is in the format of <nodeId>,<some-path>,<maybe-some-array-index>,<property>
    const referencePath = referencePathString.split(',');
    const referenceNodeId = referencePath[0];
    if (referenceNodeId) {
      referenceIds.push(referenceNodeId);
    }
  }

  return referenceIds;
}

function getVariableIdsFromNodeValues(value: any): string[] {
  const valueString = JSON.stringify(value);
  const variables = valueString.match(/={{var:([\w-]+)}}/g);
  const variableIds: string[] = [];

  if (!variables) {
    return [];
  }

  for (const variable of variables) {
    const variableId = variable.split(':')[1].replace('}}', '');
    if (variableId) {
      variableIds.push(variableId);
    }
  }

  return variableIds;
}

type TipTapContentType = {
  content: {
    content: {
      attrs: {
        variable: 'string';
      };
      text?: string;
      type: 'text' | 'templateVariable';
    }[];
    type: 'paragraph';
  }[];
  type: 'doc';
};

function extractTipTapContentValue(tipTapValue: TipTapContentType) {
  if (tipTapValue?.content) {
    const extractedValue =
      tipTapValue?.content?.flatMap((content) => {
        if (content?.type === 'paragraph' && !content?.content) {
          return '';
        }

        return content?.content
          ?.map((subContent) => {
            let textContent = '';

            if (subContent.type === 'templateVariable') {
              //We'll also want to have more attrs, like attrs.text, attrs.referenceNodeId
              //Which means that when a node type changes, we need to change the nodeId so it breaks
              //the reference.
              textContent = `={{${subContent.attrs.variable}}}`;
            } else {
              textContent = subContent.text ?? '';
            }

            return textContent;
          })
          .join('');
      }) ?? [];

    return { tipTapValue: extractedValue.join('\n') };
  } else {
    //There may be cases where we call extractTipTapContentValue on a value that isn't a tiptap content
    //If that's the case, just return the content
    return { tipTapValue: tipTapValue };
  }
}

export function calculateValueFromRaw(
  /**
   * This is the raw form data after saving a node popover form.
   */
  raw: Record<string, any>,
) {
  /**
   * Support multiple flows
   * 1. Single properties like raw.name
   * 2. Array properties like raw.messages
   * 3. Array of objects like raw.messages[0].role & raw.message[0].content
   * 4. Object like raw.message.role & raw.message.content
   *
   * Except it's not that straight forward. We are using TipTap for the rich text editor and it's not as simple as raw.message.content
   * It returns something like this for raw.role:
   *
   * ```
   * {
   *  content: [{
   *   content: [
   *    {
   *      text: 'value ={{hi}}'
   *      type: 'text'
   *    },
   *    {
   *      attrs: {
   *        variable: 'variable'
   *      }
   *      type: 'templateVariable',
   *    }
   *   ]
   *   type: 'paragraph',
   *  }],
   *  type: 'doc'
   * }
   * ```
   *
   * but if you have an array of select values itll be a simple array. So we need to check the type of data
   *
   */

  const valueFromRaw: Record<string, any> = {};

  /**
   * TODO:
   * We're keying a lot off of 'doc' here. We should probably have a better way to determine if it's a tiptap content or not
   * because someone could have type: doc in their data
   */
  Object.entries(raw).forEach(([key, value]) => {
    if (key === 'leccaFilters') {
      valueFromRaw[key] = {
        operator: value.operator,
        filters: value.filters.map((filterGroup: FilterGroup) =>
          filterGroup.map((filterField: FilterFieldType) => {
            if (filterField.value == null) {
              return filterField;
            } else {
              const { tipTapValue } = extractTipTapContentValue(
                filterField.value as unknown as TipTapContentType,
              );

              return { ...filterField, value: tipTapValue };
            }
          }),
        ),
      };
    } else if (key === 'conditionalPathsLeccaFilters') {
      const arrayValueFromRaw: ConditionalPathFilter[] = [];

      (value as ConditionalPathFilter[]).forEach((item) => {
        const filter = item.filters;

        const tempConditionalFilter: ConditionalPathFilter['filters'] = {
          operator: filter.operator,
          filters: filter.filters.map((filterGroup: FilterGroup) =>
            filterGroup.map((filterField: FilterFieldType) => {
              if (filterField.value == null) {
                return filterField;
              } else {
                const { tipTapValue } = extractTipTapContentValue(
                  filterField.value as unknown as TipTapContentType,
                );

                return { ...filterField, value: tipTapValue as string };
              }
            }),
          ),
        };

        arrayValueFromRaw.push({
          label: item.label,
          pathId: item.pathId,
          filters: tempConditionalFilter,
        });
      });

      valueFromRaw[key] = arrayValueFromRaw;
    } else if (Array.isArray(value)) {
      const arrayValueFromRaw: any[] = [];

      value.forEach((item) => {
        if (item === undefined || item === null) return;

        if (typeof item === 'object') {
          if (item?.type === 'doc') {
            //tiptap content
            const { tipTapValue } = extractTipTapContentValue(item);

            arrayValueFromRaw.push(tipTapValue);
          } else if (item.objectType === 'lecca-io-map') {
            const { tipTapValue: keyValue } = extractTipTapContentValue(
              item.key,
            );
            const { tipTapValue: valueValue } = extractTipTapContentValue(
              item.value,
            );

            arrayValueFromRaw.push({
              key: keyValue,
              value: valueValue,
            });
          } else {
            //item might be an object that has values that are tiptap content.
            const mappedObject: Record<any, any> = {};

            Object.entries(item).forEach(([key, value]: any) => {
              if (value?.type === 'doc') {
                //tiptap content
                const { tipTapValue } = extractTipTapContentValue(value);

                mappedObject[key] = tipTapValue;
              } else {
                //Since we're not doing anything special, just return value;
                mappedObject[key] = value;
              }
            });

            arrayValueFromRaw.push(mappedObject);
          }
        } else {
          //Since we're not doing anything special, just return value;
          arrayValueFromRaw.push(item);
        }
      });
      valueFromRaw[key] = arrayValueFromRaw;
    } else if (key === 'customInputConfigValues') {
      const customInputConfigValues: Record<string, any> = {};

      if (!value) {
        //It means it's an empty config because custom input config doesn't require any values
        valueFromRaw[key] = customInputConfigValues;
      } else {
        Object.entries(value).forEach(([key, value]: [string, any]) => {
          if (value?.type === 'doc') {
            //tiptap content
            const { tipTapValue } = extractTipTapContentValue(value);
            customInputConfigValues[key] = tipTapValue;
          } else {
            customInputConfigValues[key] = value;
          }
        });

        valueFromRaw[key] = customInputConfigValues;
      }
    } else if (typeof value === 'object') {
      if (value.type === 'doc') {
        //tiptap content
        const { tipTapValue } = extractTipTapContentValue(value);
        valueFromRaw[key] = tipTapValue;
      } else if (value.objectType === 'lecca-io-map') {
        const { tipTapValue: keyValue } = extractTipTapContentValue(value.key);
        const { tipTapValue: valueValue } = extractTipTapContentValue(
          value.value,
        );
        valueFromRaw[key] = {
          key: keyValue,
          value: valueValue,
        };
      } else {
        valueFromRaw[key] = value;
      }
    } else {
      valueFromRaw[key] = value;
    }
  });

  return { value: valueFromRaw };
}

export function formatNodesForSaving(nodes: Node[]): SavedWorkflowNode[] {
  const formattedNodes = nodes.map((n) => {
    const formattedNode: SavedWorkflowNode = {
      id: n.id,
      appId: n.data.appId!,
      nodeType: n.type as SavedWorkflowNode['nodeType'],
      connectionId: n.data.connectionId,
      actionId: n.data.actionId,
      triggerId: n.data.triggerId,
      description: n.data.description,
      name: n.data.name,
      position: { x: n.position.x, y: n.position.y },
      value: n.data.value,
      raw: n.data.raw,
      output: n.data.output,
    };

    return formattedNode;
  });

  return formattedNodes;
}

export function getDefaultsFromInputConfig(inputConfig: InputConfig) {
  const defaults: Record<string, any> = {};

  inputConfig.forEach((fieldConfig) => {
    if ((fieldConfig as any).inputConfig) {
      const nestedDefaultTemp: Record<string, any> = {};
      (fieldConfig as any).inputConfig.forEach(
        (subFieldConfig: FieldConfig) => {
          nestedDefaultTemp[subFieldConfig.id] =
            subFieldConfig.defaultValue ?? undefined;
        },
      );
      defaults[fieldConfig.id] = [nestedDefaultTemp];
    } else {
      defaults[fieldConfig.id] =
        (fieldConfig as FieldConfig).defaultValue ?? undefined;
    }
  });

  return defaults;
}

export function formatEdgesForSaving(edges: Edge[]): WorkflowEdgeType[] {
  return edges.map((edge) => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type as WorkflowEdgeType['type'],
      animated: true,
    };
  });
}

export function loadNodesFromSavedState({
  savedNodes,
  savedEdges,
  apps,
}: {
  savedNodes: SavedWorkflowNode[];
  savedEdges: Edge[];
  apps: MappedWorkflowApps;
}): { nodes: Node[]; edges: Edge[] } {
  const loadedNodes = savedNodes
    .map((n) => {
      if (n.nodeType === 'placeholder') {
        return {
          id: n.id,
          type: n.nodeType,
          position: { x: n.position.x, y: n.position.y },
          data: {},
        };
      } else if (n.nodeType === 'action') {
        const workflowApp = apps[n.appId];
        const workflowAction = workflowApp?.actions?.find(
          (action) => action.id === n.actionId,
        );

        if (!workflowApp || !workflowAction) {
          return null;
        }

        return {
          ...setActionNodeData({
            savedNode: n,
            workflowApp: workflowApp as WorkflowApp,
            workflowAction,
          }),
        };
      } else if (n.nodeType === 'trigger') {
        const workflowApp = apps[n.appId];
        const workflowTrigger = workflowApp?.triggers?.find(
          (trigger) => trigger.id === n.triggerId,
        );

        if (!workflowApp || !workflowTrigger) {
          return null;
        }

        return {
          ...setTriggerNodeData({
            savedNode: n,
            workflowApp: workflowApp as WorkflowApp,
            workflowTrigger,
          }),
        };
      } else {
        return null;
      }
    })
    .filter(Boolean) as Node[];

  return {
    nodes: loadedNodes,
    edges: savedEdges,
  };
}

export function setActionNodeData({
  node,
  savedNode,
  workflowApp,
  workflowAction,
  clearValue,
  clearOutput,
}: {
  node?: Node;
  savedNode?: SavedActionNode;
  workflowApp: WorkflowApp;
  workflowAction: WorkflowApp['actions'][number];
  clearValue?: boolean;
  clearOutput?: boolean;
}) {
  const data = {
    id: savedNode?.id ?? node?.id ?? v4(),
    position: savedNode?.position ?? node?.position ?? { x: 0, y: 0 },
    type: 'action',
    data: {
      appId: workflowApp.id,
      actionId: workflowAction.id,
      name: savedNode?.name ?? node?.data?.name ?? workflowAction.name,
      description:
        savedNode?.description ??
        node?.data?.description ??
        workflowAction.description,
      iconUrl: workflowAction.iconUrl,
      inputConfig: workflowAction.inputConfig,
      value: clearValue ? undefined : savedNode?.value,
      raw: clearValue ? undefined : savedNode?.raw,
      output: clearOutput ? undefined : savedNode?.output,
      needsConnection: workflowAction.needsConnection,
      viewOptions: workflowAction.viewOptions,
      references: savedNode?.references ?? node?.data?.references ?? {},
      variables: savedNode?.variables ?? node?.data?.variables ?? {},

      //Execution properties
      //only savedNode, because you can't change the execution status
      executionStatus: savedNode?.executionStatus,
      executionStatusMessage: savedNode?.executionStatusMessage,
      startTime: savedNode?.startTime,
      endTime: savedNode?.endTime,
    },
  };

  return data;
}

export function setTriggerNodeData({
  node,
  savedNode,
  workflowApp,
  workflowTrigger,
  clearValue,
  clearOutput,
}: {
  node?: Node;
  savedNode?: SavedTriggerNode;
  workflowApp: WorkflowApp;
  workflowTrigger: WorkflowApp['triggers'][number];
  clearValue?: boolean;
  clearOutput?: boolean;
}) {
  return {
    id: savedNode?.id ?? node?.id ?? v4(),
    position: savedNode?.position ?? node?.position ?? { x: 0, y: 0 },
    type: 'trigger',
    data: {
      appId: workflowApp.id,
      triggerId: workflowTrigger.id,
      name: savedNode?.name ?? node?.data?.name ?? workflowTrigger.name,
      iconUrl: workflowTrigger.iconUrl,
      description:
        savedNode?.description ??
        node?.data?.description ??
        workflowTrigger.description,
      inputConfig: workflowTrigger.inputConfig,
      value: clearValue ? undefined : savedNode?.value,
      raw: clearValue ? undefined : savedNode?.raw,
      output: clearOutput ? undefined : savedNode?.output,
      needsConnection: workflowTrigger.needsConnection,
      viewOptions: workflowTrigger.viewOptions,
      variables: savedNode?.variables ?? node?.data?.variables ?? {},
      strategy: workflowTrigger.strategy,

      //Execution properties
      //only savedNode, because you can't change the execution status
      executionStatus: savedNode?.executionStatus,
      executionStatusMessage: savedNode?.executionStatusMessage,
      startTime: savedNode?.startTime,
      endTime: savedNode?.endTime,
    },
  };
}
