import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Edge, Node, useReactFlow } from 'reactflow';

import { Tabs } from '@/components/ui/tabs';
import { FieldConfig } from '@/models/workflow/input-config-model';

import { FilterFormFields, LeccaFilter } from './lecca-filter-form-fields';

export function ConditionalPathsFormFields({
  form,
  node,
  fieldConfig,
  readonly,
  projectId,
  agentId,
}: {
  form: UseFormReturn<any, any, undefined>;
  node: Node;
  fieldConfig: FieldConfig;
  readonly?: boolean;
  projectId: string;
  agentId: string | undefined;
}) {
  const { getEdges, getNodes } = useReactFlow();

  const connectedEdgesAndNodes = useMemo(() => {
    //Return an array of objects like { edge, node } for each connected edge

    const edges = getEdges();
    const nodes = getNodes();

    const connectedEdges = edges.filter((edge) => edge.source === node.id);
    const connectedEdgesAndNodes = connectedEdges.map((edge) => {
      const node = nodes.find((n) => n.id === edge.target);
      return { edge, node };
    });

    //Only return the edge where the connected node exists and is not type 'placeholder'
    return connectedEdgesAndNodes.filter(
      (edgeAndNode) =>
        edgeAndNode.node && edgeAndNode.node.type !== 'placeholder',
    ) as { edge: Edge; node: Node }[];
  }, [getEdges, getNodes, node.id]);

  const pathFilters = useMemo(() => {
    return (connectedEdgesAndNodes ?? []).map((edgeAndNode) => {
      const conditionalFilters =
        (form.getValues(
          'conditionalPathsLeccaFilters',
        ) as ConditionalPathFilter[]) ?? [];

      const existingFilterForPathId = conditionalFilters.find(
        (filter) => filter.pathId === edgeAndNode.edge.id,
      );

      const pathFilter: ConditionalPathFilter = {
        label: edgeAndNode.node.data.name,
        pathId: edgeAndNode.edge.id,
        filters: existingFilterForPathId?.filters ?? {
          filters: [],
          operator: 'OR',
        },
      };

      return pathFilter;
    });
  }, [connectedEdgesAndNodes, form]);

  if (!pathFilters.length) {
    return readonly ? (
      <div className="">
        <p className="font-bold text-md">No paths were taken</p>
      </div>
    ) : (
      <div className="">
        <p className="font-bold text-md">{fieldConfig.label}</p>
        <p className="text-sm">{fieldConfig.description}</p>
      </div>
    );
  }

  return (
    <Tabs
      className="space-y-6 overflow-x-hidden"
      defaultValue={pathFilters[0].pathId}
    >
      <div className="flex flex-col items-start justify-start w-full overflow-x-auto">
        <Tabs.List>
          {pathFilters.map((pathFilter) => (
            <Tabs.Trigger key={pathFilter.pathId} value={pathFilter.pathId}>
              {pathFilter.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>
      {pathFilters.map((conditionalPathFilter) => {
        return (
          <Tabs.Content
            key={conditionalPathFilter.pathId}
            value={conditionalPathFilter.pathId}
          >
            <FilterFormFields
              form={form}
              node={node}
              label="Path Conditions"
              description="Add conditions to determine when this path should be taken. If no conditions are added, this path will always be taken."
              defaultFilters={conditionalPathFilter.filters}
              conditionalPath={conditionalPathFilter}
              readonly={readonly}
              projectId={projectId}
              agentId={agentId}
            />
          </Tabs.Content>
        );
      })}
    </Tabs>
  );
}

export type ConditionalPathFilter = {
  /**
   * Node Name (node.data.name) of the connected node
   */
  label: string;
  /**
   * This is the edge id of the connected edge
   */
  pathId: string;
  filters: LeccaFilter;
};
