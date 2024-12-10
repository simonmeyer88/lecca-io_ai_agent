import { Node, NodeProps, useReactFlow } from 'reactflow';
import { v4 } from 'uuid';

import { useProjectWorkflow } from '../../../../../hooks/useProjectWorkflow';
import { setActionNodeData, setTriggerNodeData } from '../nodes/node-utils';

// this hook implements the logic for clicking a placeholder node
// on placeholder node click: turn the placeholder and connecting edge into a workflow node
export function useAddNode(id: NodeProps['id']) {
  const { getNode, setNodes, setEdges, getEdges } = useReactFlow();
  const { mappedWorkflowApps } = useProjectWorkflow();

  const addWorkflowNode = ({
    appId,
    triggerId,
    actionId,
  }: {
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    // we need the parent node object for getting its position
    const parentNode = getNode(id);

    if (!parentNode) {
      return;
    }

    // create a unique id for the placeholder node that will be added as a child of the clicked node
    const childPlaceholderId = v4();

    // create a placeholder node that will be added as a child of the clicked node
    const childPlaceholderNode = {
      id: childPlaceholderId,
      // the placeholder is placed at the position of the clicked node
      // the layout function will animate it to its new position
      position: {
        x: parentNode.position.x + 100,
        y: parentNode.position.y + 16.5,
      },
      type: 'placeholder',
      data: { label: '+' },
    };

    // we need a connection from the clicked node to the new placeholder
    const childPlaceholderEdge = {
      id: `${parentNode.id}=>${childPlaceholderId}`,
      source: parentNode.id,
      target: childPlaceholderId,
      type: 'placeholder',
      animated: true,
    };

    //Check if a connecting node already exists. If it does, we don't need to add a new edge or node because this is an insert
    const existingEdge = getEdges().find((edge) => edge.source === id);

    setNodes((nodes) =>
      nodes
        .map((node) => {
          // here we are changing the type of the clicked node from placeholder to workflow
          if (node.id === id) {
            const workflowApp = mappedWorkflowApps?.[appId];

            if (actionId) {
              const workflowAction = workflowApp?.actions?.find(
                (action) => action.id === actionId,
              );

              if (!workflowApp || !workflowAction) {
                return node;
              }

              return setActionNodeData({
                workflowApp,
                workflowAction,
                node,
              }) as Node;
            } else if (triggerId) {
              const workflowTrigger = workflowApp?.triggers?.find(
                (trigger) => trigger.id === triggerId,
              );

              if (!workflowApp || !workflowTrigger) {
                return node;
              }

              return setTriggerNodeData({
                workflowApp,
                workflowTrigger,
                node,
              }) as Node;
            }
          }
          return node;
        })
        // add the new placeholder node
        .concat(existingEdge ? [] : [childPlaceholderNode]),
    );

    setEdges((edges) =>
      edges
        .map((edge) => {
          // here we are changing the type of the connecting edge from placeholder to workflow
          if (edge.target === id) {
            return {
              ...edge,
              type: 'workflow',
            };
          }
          return edge;
        })
        // add the new placeholder edge
        .concat(existingEdge ? [] : [childPlaceholderEdge]),
    );
  };

  return { addActionNode: addWorkflowNode };
}
