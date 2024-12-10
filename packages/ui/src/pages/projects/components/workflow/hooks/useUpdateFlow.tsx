import { useReactFlow } from 'reactflow';
import { v4 } from 'uuid';

import { useProjectWorkflow } from '../../../../../hooks/useProjectWorkflow';
import { setActionNodeData, setTriggerNodeData } from '../nodes/node-utils';

export function useUpdateFlow() {
  const { getNode, setNodes, setEdges, getEdges } = useReactFlow();
  const { mappedWorkflowApps, setRerenderKey, takeSnapshot } =
    useProjectWorkflow();

  const appendNode = ({
    parentNodeId,
    appId,
    triggerId,
    actionId,
    replace,
  }: {
    parentNodeId: string;
    appId: string;
    actionId?: string;
    triggerId?: string;
    replace?: boolean;
  }) => {
    // we need the parent node object for getting its position
    const parentNode = getNode(parentNodeId);

    if (!parentNode) {
      return;
    }

    const workflowApp = mappedWorkflowApps?.[appId];
    const newNodeId = v4();
    const defaultNodeData = {
      id: newNodeId,
      position: {
        x: !replace ? parentNode.position.x + 120 : parentNode.position.x,
        y: parentNode.position.y,
      },
      type: 'action',
      data: {},
    };

    let newNode;

    if (actionId) {
      const workflowAction = workflowApp?.actions?.find(
        (action) => action.id === actionId,
      );

      if (!workflowApp || !workflowAction) {
        throw new Error('Invalid action id: ' + actionId);
      }

      newNode = setActionNodeData({
        workflowApp,
        workflowAction,
        node: defaultNodeData,
      });
    } else if (triggerId) {
      const workflowTrigger = workflowApp?.triggers?.find(
        (trigger) => trigger.id === triggerId,
      );

      if (!workflowApp || !workflowTrigger) {
        throw new Error('Invalid trigger id: ' + triggerId);
      }

      newNode = setTriggerNodeData({
        workflowApp,
        workflowTrigger,
        node: defaultNodeData,
      });
    } else {
      throw new Error('Invalid node type. Must be either trigger or action');
    }

    // we need a connection from the clicked node to the new placeholder
    const childPlaceholderEdge = {
      id: `${parentNode.id}=>${newNodeId}`,
      source: parentNode.id,
      target: newNodeId,
      type: 'workflow',
      animated: true,
    };

    setNodes((nodes) => {
      if (replace) {
        return nodes.map((node) => {
          if (node.id === parentNodeId) {
            return newNode;
          } else {
            return node;
          }
        });
      } else {
        return nodes.concat([newNode]);
      }
    });

    setEdges((edges) => edges.concat(replace ? [] : [childPlaceholderEdge]));

    setRerenderKey((key) => key + 1);
  };

  const deleteNode = ({ nodeId }: { nodeId: string }) => {
    /**
     * There are multiple types of node deletions we have to deal with:
     *
     * 1. Deleting a node that has no children (completely delete)
     * 2. Deleting a node that has no source or target edges and is not the trigger node. (completely delete)
     * 3. Deleting a node that has children. (delete the node and reassign the children to the parent node)
     * 4. Deleting the trigger node. (turn into a placeholder)
     * 5. Deleting a trigger placeholder (not allowed)
     */

    //1. Determine the node deletion type
    let deletionType:
      | 'noChildren'
      | 'noEdges'
      | 'hasChildren'
      | 'trigger'
      | 'triggerPlaceholder';

    const node = getNode(nodeId)!;

    //1.a Check if it's the trigger node
    const isTriggerNode = node.data.triggerId;

    //1.b Check if it has children
    const hasChildren = getEdges().some((edge) => edge.source === nodeId);

    //1.c Check if it has no edges
    const hasEdges = getEdges().some(
      (edge) => edge.source === nodeId || edge.target === nodeId,
    );

    //1.d Check if the placeholder is a trigger
    const isTriggerPlaceholder = node.data.placeholderType === 'trigger';

    if (isTriggerNode) {
      deletionType = 'trigger';
    } else if (isTriggerPlaceholder) {
      deletionType = 'triggerPlaceholder';
    } else if (!hasEdges) {
      deletionType = 'noEdges';
    } else if (hasChildren) {
      deletionType = 'hasChildren';
    } else {
      deletionType = 'noChildren';
    }

    //2. Perform the deletion based on the type
    switch (deletionType) {
      case 'noChildren':
        setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
        setEdges((edges) => edges.filter((edge) => edge.target !== nodeId));
        break;
      case 'noEdges':
        setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
        break;
      case 'hasChildren': {
        //2.a Get the parent node of the node being deleted
        const parentNodeId = getEdges().find(
          (edge) => edge.target === nodeId,
        )!.source;

        //2.b Get the children of the node being deleted
        const children = getEdges().filter((edge) => edge.source === nodeId);

        //2.c Create new edges from the parent node to the children
        const newEdges = children.map((child) => {
          return {
            ...child,
            source: parentNodeId,
          };
        });

        //2.d Remove the node and its edges
        setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
        setEdges((edges) =>
          edges
            .filter((edge) => edge.target !== nodeId && edge.source !== nodeId)
            .concat(newEdges),
        );
        break;
      }
      case 'trigger':
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                type: 'placeholder',
                data: {
                  placeholderType: 'trigger',
                },
              };
            }
            return node;
          }),
        );
        break;
      case 'triggerPlaceholder': {
        //Do nothing
        return;
      }
    }

    takeSnapshot();
    setRerenderKey((key) => key + 1); //To trigger useGetNodeStatus
  };

  const insertNode = ({
    parentNodeId,
    childNodeId,
    appId,
    triggerId,
    actionId,
  }: {
    parentNodeId: string;
    childNodeId: string;
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    const parentNode = getNode(parentNodeId);
    if (!parentNode) return;

    const workflowApp = mappedWorkflowApps?.[appId];
    const newNodeId = v4();
    const defaultNodeData = {
      id: newNodeId,
      position: {
        x: parentNode.position.x + 130, //slight offset of append
        y: parentNode.position.y - 10, //slight offset of append
      },
      type: 'action',
      data: {},
    };

    let newNode;
    if (actionId) {
      const workflowAction = workflowApp?.actions?.find(
        (action) => action.id === actionId,
      );
      if (!workflowApp || !workflowAction)
        throw new Error('Invalid action id: ' + actionId);
      newNode = setActionNodeData({
        workflowApp,
        workflowAction,
        node: defaultNodeData,
      });
    } else if (triggerId) {
      const workflowTrigger = workflowApp?.triggers?.find(
        (trigger) => trigger.id === triggerId,
      );
      if (!workflowApp || !workflowTrigger)
        throw new Error('Invalid trigger id: ' + triggerId);
      newNode = setTriggerNodeData({
        workflowApp,
        workflowTrigger,
        node: defaultNodeData,
      });
    } else {
      throw new Error('Invalid node type. Must be either trigger or action');
    }

    setNodes((nodes) => {
      return nodes.concat([newNode]);
    });

    setEdges((edges) => {
      return edges
        .map((edge) => {
          if (edge.source === parentNodeId && edge.target === childNodeId) {
            return [
              {
                ...edge,
                id: `${parentNode.id}=>${newNodeId}`,
                source: parentNode.id,
                target: newNodeId,
              },
              {
                ...edge,
                id: `${newNodeId}=>${childNodeId}`,
                source: newNodeId,
                target: childNodeId,
              },
            ];
          } else {
            return edge;
          }
        })
        .flat();
    });

    setRerenderKey((key) => key + 1);
  };

  const splitPath = ({
    parentNodeId,
    appId,
    triggerId,
    actionId,
  }: {
    parentNodeId: string;
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    // Retrieve the parent node based on the provided ID
    const parentNode = getNode(parentNodeId);
    if (!parentNode) {
      return;
    }

    // Get workflow app data
    const workflowApp = mappedWorkflowApps?.[appId];
    const newNodeId = v4();

    // Default position offset to create the new branch visually below the parent
    const defaultNodeData = {
      id: newNodeId,
      position: {
        x: parentNode.position.x + 120, // Offset horizontally to avoid overlap
        y: parentNode.position.y + 100, // Offset vertically for branching effect
      },
      type: 'action',
      data: {},
    };

    let newNode;

    if (actionId) {
      const workflowAction = workflowApp?.actions?.find(
        (action) => action.id === actionId,
      );
      if (!workflowApp || !workflowAction)
        throw new Error('Invalid action id: ' + actionId);
      newNode = setActionNodeData({
        workflowApp,
        workflowAction,
        node: defaultNodeData,
      });
    } else if (triggerId) {
      const workflowTrigger = workflowApp?.triggers?.find(
        (trigger) => trigger.id === triggerId,
      );
      if (!workflowApp || !workflowTrigger)
        throw new Error('Invalid trigger id: ' + triggerId);
      newNode = setTriggerNodeData({
        workflowApp,
        workflowTrigger,
        node: defaultNodeData,
      });
    } else {
      throw new Error('Invalid node type. Must be either trigger or action');
    }

    // Create a new edge from parentNode to the new node to form the branch
    const newEdge = {
      id: `${parentNodeId}=>${newNodeId}`,
      source: parentNodeId,
      target: newNodeId,
      type: 'workflow',
      animated: true,
    };

    // Add the new node and edge to the graph state
    setNodes((nodes) => nodes.concat([newNode]));
    setEdges((edges) => edges.concat([newEdge]));

    // Trigger re-render
    setRerenderKey((key) => key + 1);
  };

  const replacePlaceholder = ({
    nodeId,
    appId,
    triggerId,
    actionId,
  }: {
    nodeId: string;
    appId: string;
    triggerId?: string;
    actionId?: string;
  }) => {
    const node = getNode(nodeId);
    if (!node) {
      return;
    }

    const workflowApp = mappedWorkflowApps?.[appId];
    const newNodeId = v4();
    const defaultNodeData = {
      id: newNodeId,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
      type: 'action',
      data: {},
    };

    let newNode;

    if (actionId) {
      const workflowAction = workflowApp?.actions?.find(
        (action) => action.id === actionId,
      );
      if (!workflowApp || !workflowAction)
        throw new Error('Invalid action id: ' + actionId);
      newNode = setActionNodeData({
        workflowApp,
        workflowAction,
        node: defaultNodeData,
      });
    } else if (triggerId) {
      const workflowTrigger = workflowApp?.triggers?.find(
        (trigger) => trigger.id === triggerId,
      );
      if (!workflowApp || !workflowTrigger)
        throw new Error('Invalid trigger id: ' + triggerId);
      newNode = setTriggerNodeData({
        workflowApp,
        workflowTrigger,
        node: defaultNodeData,
      });
    } else {
      throw new Error('Invalid node type. Must be either trigger or action');
    }

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          return newNode;
        } else {
          return n;
        }
      }),
    );

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.source === nodeId) {
          return {
            ...edge,
            source: newNodeId,
          };
        } else if (edge.target === nodeId) {
          return {
            ...edge,
            target: newNodeId,
          };
        } else {
          return edge;
        }
      }),
    );

    setRerenderKey((key) => key + 1);
  };

  return { appendNode, deleteNode, insertNode, splitPath, replacePlaceholder };
}
