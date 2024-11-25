import { useCallback, useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Edge, Node, useReactFlow } from 'reactflow';

import { DynamicInput } from '@/components/dynamic-input/dynamic-input';
import { ComboBox } from '@/components/ui/combo-box';
import { Form } from '@/components/ui/form';
import { FieldConfig } from '@/models/workflow/input-config-model';
import { cn } from '@/utils/cn';

export function DecidePathsFormFields({
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
  const [pathOptions, setPathOptions] = useState<DecidePathOptions[]>([]);

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

  const onNameChange = useCallback(
    ({ newName, pathIndex }: { newName: string; pathIndex: number }) => {
      const newPathOptions = pathOptions.map((pathOption, index) => {
        if (index === pathIndex) {
          return { ...pathOption, label: newName };
        }
        return pathOption;
      });

      setPathOptions(newPathOptions);
    },
    [pathOptions],
  );

  useEffect(() => {
    if (
      !form.getValues('decidePathOptions') ||
      !form.getValues('decidePathOptions').length
    ) {
      //WE GET HERE WHEN THERE IS NO SAVED DATA
      const pathOptions = connectedEdgesAndNodes.map((edgeAndNode, index) => {
        let pathLabel = edgeAndNode.node.data.name;

        //Cant let pathName be duplicate. So add index to it if it is, e.g. name (1)
        if (
          connectedEdgesAndNodes.filter(
            (edgeAndNode) => edgeAndNode.node.data.name === pathLabel,
          ).length > 1
        ) {
          pathLabel = `${pathLabel} (${index + 1})`;
        }

        const pathOption = {
          label: pathLabel,
          pathId: edgeAndNode.edge.id,
        };

        return pathOption;
      });

      setPathOptions(pathOptions);
    } else {
      //WE GET HERE WHEN THERE IS SAVED DATA

      /**
       * We have to make sure that no new paths have been added or deleted.
       * If a path was deleted from the connectedEdgesAndNodes we need to delete it ffrom the saved decidePathsOptions using the pathId (edge.id)
       * If a path was added, add the new path using the connected node name as the default path label
       */

      // Get current saved path options
      const savedPathOptions = form.getValues(
        'decidePathOptions',
      ) as DecidePathOptions[];

      // Extract path IDs from saved options and connected edges and nodes
      const savedPathIds = new Set(
        savedPathOptions.map((pathOption) => pathOption.pathId),
      );
      const connectedPathIds = new Set(
        connectedEdgesAndNodes.map((edgeAndNode) => edgeAndNode.edge.id),
      );

      // Filter out deleted paths from saved path options
      const updatedPathOptions = savedPathOptions.filter((pathOption) =>
        connectedPathIds.has(pathOption.pathId),
      );

      // Find new paths that are in connectedEdgesAndNodes but not in savedPathOptions
      const usedLabels = new Set(
        updatedPathOptions.map((option) => option.label),
      );
      const newPaths = connectedEdgesAndNodes
        .filter((edgeAndNode) => !savedPathIds.has(edgeAndNode.edge.id))
        .map((edgeAndNode) => {
          const baseLabel = edgeAndNode.node.data.name;
          let pathLabel = baseLabel;
          let suffix = 1;

          // Ensure unique path labels
          while (usedLabels.has(pathLabel)) {
            pathLabel = `${baseLabel} (${suffix++})`;
          }
          usedLabels.add(pathLabel);

          return {
            label: pathLabel,
            pathId: edgeAndNode.edge.id,
          };
        });

      // Update the path options state
      setPathOptions([...updatedPathOptions, ...newPaths]);
    }
  }, [connectedEdgesAndNodes, form]);

  useEffect(() => {
    if (pathOptions?.length) {
      form.setValue('decidePathOptions', pathOptions);
    }
  }, [form, pathOptions]);

  if (node.data.executionStatus === 'NEEDS_INPUT') {
    //We won't use the pathOptions, because those are determined from the existing nodes in the workflow. But an
    //execution only shows the nodes that have started in the execution.
    //So we'll need to use the pathOptions from the saved node.data.value
    const savedOptions: { label: string; pathId: string }[] | undefined =
      node.data.value?.decidePathOptions;

    if (savedOptions) {
      return (
        <Form.Item className="flex flex-col space-y-1">
          <div className="ml-1 text-sm font-semibold">Path Options</div>
          <Form.Control>
            <ComboBox
              items={savedOptions.map((option) => ({
                label: option.label,
                value: option.pathId,
              }))}
              portal={false}
              onChange={(value) => {
                form.setValue('customInputConfigValues', {
                  pathDecision: {
                    pathIds: [value],
                  },
                });
              }}
              searchable={false}
              fallbackLabel="Select a path"
              className="w-full"
              dropdownWidthMatchesButton
            />
          </Form.Control>
        </Form.Item>
      );
    } else {
      return <div>Something went wrong. there are no options available</div>;
    }
  } else if (!pathOptions.length) {
    if (readonly) {
      return (
        <div className="">
          <p className="font-bold text-md">There are no paths available</p>
        </div>
      );
    } else {
      return (
        <div className="">
          <p className="font-bold text-md">{fieldConfig.label}</p>
          <p className="text-sm">{fieldConfig.description}</p>
        </div>
      );
    }
  } else {
    return (
      <Form.Item>
        <div className="ml-1 text-sm font-semibold">
          {readonly ? 'Selected Path' : 'Path Options'}
        </div>
        <Form.Control>
          <div
            className={cn('space-y-4 overflow-x-hidden ', {
              'bg-muted/30 border p-3 rounded-md': !readonly,
            })}
          >
            {pathOptions.map((pathOption, index) => (
              <DynamicInput
                key={index}
                projectId={projectId}
                onChange={(value: string) =>
                  onNameChange({ newName: value, pathIndex: index })
                }
                defaultValue={pathOption.label}
                required={
                  // !!form.register(`decidePathOptions.${index}.label`, {
                  //   required: true,
                  // }).required
                  //The above code isn't working as expected.
                  //And the code below doesn't actually apply to the form, so it doesn't work either.
                  //So a user could technically save this field empty, which would make their decision path options look weird.
                  //but that's on them.
                  true
                }
                placeholder={'Add path name'}
                node={node}
                readOnly={readonly}
                agentId={agentId}
              />
            ))}
          </div>
        </Form.Control>
        <Form.Message />
      </Form.Item>
    );
  }
}

export type DecidePathOptions = {
  /**
   * Node Name (node.data.name) of the connected node
   */
  label: string;
  /**
   * This is the edge id of the connected edge
   */
  pathId: string;
};
