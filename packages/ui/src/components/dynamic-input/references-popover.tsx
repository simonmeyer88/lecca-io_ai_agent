import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edge, Node, useReactFlow } from 'reactflow';

import useApiQuery from '@/api/use-api-query';
import {
  OutputSelector,
  OutputSelectorOnClickArgs,
} from '@/pages/projects/components/workflow/nodes/action-node/output/output-selector';
import { cn } from '@/utils/cn';

import { Icons } from '../icons';
import { ListViewLoader } from '../loaders/list-view-loader';
import { Input } from '../ui/input';
import { ListView } from '../ui/list-view';
import { Popover } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs } from '../ui/tabs';
import { Tooltip } from '../ui/tooltip';

type ReferencesPopoverProps = {
  addReferences: (args: {
    variableId: string;
    variableName: string;
    refType: 'ref' | 'var';
  }) => void;
  projectId: string;
  node: Node;
  hideReferences?: boolean;
};

export function ReferencesPopover({
  addReferences,
  projectId,
  node,
  hideReferences,
}: ReferencesPopoverProps) {
  return (
    <Popover.Content side="top" sideOffset={20} className="w-[520px] mr-1 p-4">
      <Tabs defaultValue={hideReferences ? 'variables' : 'references'}>
        <Tabs.List
          className={cn({
            hidden: hideReferences,
          })}
        >
          {!hideReferences && (
            <Tabs.Trigger value="references">References</Tabs.Trigger>
          )}
          <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="variables" className="space-y-2">
          <VariablesContent
            projectId={projectId}
            addReferences={addReferences}
            node={node}
          />
        </Tabs.Content>
        <Tabs.Content value="references" className="space-y-2">
          <ReferencesContent addReferences={addReferences} node={node} />
        </Tabs.Content>
      </Tabs>
    </Popover.Content>
  );
}

export const KEY_NAME_DELIMITER = '::';

function ReferencesContent({
  addReferences,
  node,
}: Pick<ReferencesPopoverProps, 'addReferences' | 'node'>) {
  const { getNodes, getEdges } = useReactFlow();

  const onSelect = ({ path }: OutputSelectorOnClickArgs) => {
    //Should always be an array
    if (Array.isArray(path)) {
      //Reverse so the key is in the first item
      const newPath = [...path].reverse();
      let nodeId: string | undefined;
      let nodeName: string | undefined;

      //The first item should always be the key::name, so we can split on the delimiter
      const variableRef: string[] = [];
      const variableNameArr: string[] = [];

      newPath.forEach((key, i) => {
        if (i === 0) {
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

      addReferences({
        variableId: variableRef.join(','),
        variableName: variableNameArr.join(' '),
        refType: 'ref',
      });
    }
  };

  const outputReferences = useMemo(() => {
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
  }, [getEdges, getNodes, node.id]);

  return (
    <ScrollArea className="!max-h-[500px] overflow-y-auto">
      {outputReferences && Object.keys(outputReferences).length === 0 ? (
        <div className="text-sm text-muted-foreground p-2 flex flex-col space-y-2 items-start">
          <p>No output data.</p>
          <p>
            <em>Save & Test</em> your nodes to generate outputs that you can map
            to your actions. You can only map previous nodes that have outputs.
          </p>
        </div>
      ) : (
        <OutputSelector
          data={outputReferences}
          onClick={onSelect}
          hideRoot
          keyNameDelimiter={KEY_NAME_DELIMITER}
        />
      )}
    </ScrollArea>
  );
}

function VariablesContent({
  addReferences,
  projectId,
}: ReferencesPopoverProps) {
  const { data: variables, isLoading: isLoadingVariables } = useApiQuery({
    service: 'variables',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${projectId}`],
        },
      },
    },
  });

  const [variableSearch, setVariableSearch] = useState('');
  const [filteredVariables, setFilteredVariables] = useState(variables);

  useEffect(() => {
    if (variables) {
      setFilteredVariables(
        variables.filter((variable) =>
          variable.name.toLowerCase().includes(variableSearch.toLowerCase()),
        ),
      );
    }
  }, [variableSearch, variables]);

  return variables && variables.length > 0 ? (
    <>
      <Input
        placeholder="Search variables..."
        value={variableSearch}
        onChange={(event) => {
          setVariableSearch(event.target.value);
        }}
        className="py-2 w-[150px] lg:w-[250px] ml-1 bg-background"
      />

      <ListView className="max-h-96">
        {isLoadingVariables ? (
          <ListViewLoader />
        ) : (
          <ListView.Body>
            {filteredVariables?.map((variable) => (
              <ListView.Row
                key={variable.id}
                onClick={() => {
                  addReferences({
                    variableId: variable.id,
                    variableName: variable.name,
                    refType: 'var',
                  });
                }}
                className="group flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <ListView.Description className="space-x-2 flex items-center">
                      <span>{variable.name}</span>
                      {variable.description && (
                        <Tooltip>
                          <Tooltip.Trigger type="button">
                            <Icons.infoCircle className="h-4 w-4" />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {variable.description}
                          </Tooltip.Content>
                        </Tooltip>
                      )}
                    </ListView.Description>
                  </div>
                </div>
                <Icons.plus className="group-hover:opacity-100 opacity-0 transition-transform" />
              </ListView.Row>
            ))}
          </ListView.Body>
        )}
      </ListView>
    </>
  ) : (
    <div className="text-sm text-muted-foreground p-2 flex flex-col space-y-2 items-start">
      <p>No variables found.</p>
      <p>
        Create variables on the{' '}
        <Link to="/variables" className="underline">
          Variables
        </Link>{' '}
        page to use in your nodes
      </p>
    </div>
  );
}

/**
 * Function to find all previous nodes recursively
 */
export const findAllPreviousNodes = (
  currentNodeId: string,
  nodesMap: Map<string, Node>,
  edgesMap: Map<string, string[]>,
): Node[] => {
  const previousNodes: Node[] = [];

  const traverse = (nodeId: string) => {
    const incomingEdges = edgesMap.get(nodeId) || [];
    for (const sourceNodeId of incomingEdges) {
      const sourceNode = nodesMap.get(sourceNodeId);
      if (sourceNode) {
        previousNodes.push(sourceNode);
        traverse(sourceNode.id); // Recursively traverse to find all previous nodes
      }
    }
  };

  traverse(currentNodeId);
  return previousNodes;
};

/**
 * Creating maps for efficient lookup
 */
export const createNodeAndEdgeMaps = (nodes: Node[], edges: Edge[]) => {
  const nodesMap = new Map(nodes.map((node) => [node.id, node]));
  const edgesMap = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (!edgesMap.has(edge.target)) {
      edgesMap.set(edge.target, []);
    }
    edgesMap.get(edge.target)!.push(edge.source);
  });

  return { nodesMap, edgesMap };
};
