import { HierarchyPointNode, stratify, tree } from 'd3-hierarchy';
import { timer } from 'd3-timer';
import { useEffect, useRef } from 'react';
import {
  Edge,
  Node,
  ReactFlowState,
  useNodesInitialized,
  useReactFlow,
  useStore,
} from 'reactflow';

import { WorkflowOrientation } from '@/models/workspace-user-preferences-model';

// initialize the tree layout (see https://observablehq.com/@d3/tree for examples)
const horizontalLayout = tree<Node>()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([120, 200])
  // this is needed for creating equal space between all nodes
  .separation(() => 1);

const verticalLayout = tree<Node>()
  // the node size configures the spacing between the nodes ([width, height])
  .nodeSize([200, 100])
  // this is needed for creating equal space between all nodes
  .separation(() => 1);

const options = { duration: 200 };

// the layouting function
// accepts current nodes and edges and returns the layouted nodes with their updated positions
function layoutNodes(
  nodes: Node[],
  edges: Edge[],
  orientation: WorkflowOrientation,
): Node[] {
  // if there are no nodes we can't calculate a layout
  if (nodes.length === 0) {
    return [];
  }
  // convert nodes and edges into a hierarchical object for using it with the layout function
  const hierarchy = stratify<Node>()
    .id((d) => d.id)
    // get the id of each node by searching through the edges
    // this only works if every node has one connection
    .parentId((d: Node) => edges.find((e: Edge) => e.target === d.id)?.source)(
    nodes,
  );

  // run the layout algorithm with the hierarchy data structure
  let root: HierarchyPointNode<Node>;
  if (orientation === 'HORIZONTAL') {
    root = horizontalLayout(hierarchy);
  } else if (orientation === 'VERTICAL') {
    root = verticalLayout(hierarchy);
  } else {
    throw new Error(`Invalid orientation: ${orientation}`);
  }

  // convert the hierarchy back to react flow nodes (the original node is stored as d.data)
  // we only extract the position from the d3 function
  return root.descendants().map((d) => {
    return {
      ...d.data,
      position:
        orientation === 'HORIZONTAL'
          ? { x: d.y, y: d.x - d.data!.height! / 2 }
          : {
              x: d.x - d.data!.width! / 2,
              y: d.y,
            },
    };
  });
}

// this is the store selector that is used for triggering the layout, this returns the number of nodes once they change
const nodeCountSelector = (state: ReactFlowState) => state.nodeInternals.size;

export function useLayout({
  orientation,
}: {
  orientation: WorkflowOrientation;
}) {
  const initialized = useNodesInitialized();

  // this ref is used to fit the nodes in the first run
  // after first run, this is set to false
  const initial = useRef(true);

  // we are using nodeCount as the trigger for the re-layouting
  // whenever the nodes length changes, we calculate the new layout
  const nodeCount = useStore(nodeCountSelector);

  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } =
    useReactFlow();

  useEffect(() => {
    if (initialized) {
      // get the current nodes and edges
      const nodes = getNodes();
      const edges = getEdges();

      // run the layout and get back the nodes with their updated positions
      const targetNodes = layoutNodes(nodes, edges, orientation);

      // if you do not want to animate the nodes, you can uncomment the following line
      // return setNodes(targetNodes);

      // to interpolate and animate the new positions, we create objects that contain the current and target position of each node
      const transitions = targetNodes.map((node) => {
        return {
          id: node.id,
          from: node.position || getNode(node.id)?.position, // this is where the node currently is placed
          to: node.position, // this is where we want the node to be placed
          node,
        };
      });

      // create a timer to animate the nodes to their new positions
      const t = timer((elapsed: number) => {
        const s = elapsed / options.duration;

        const currNodes = transitions.map(({ node, from, to }) => {
          return {
            id: node.id,
            position: {
              // simple linear interpolation
              x: from.x + (to.x - from.x) * s,
              y: from.y + (to.y - from.y) * s,
            },
            data: { ...node.data },
            type: node.type,
          };
        });

        setNodes(currNodes);

        // this is the final step of the animation
        if (elapsed > options.duration) {
          // we are moving the nodes to their destination
          // this needs to happen to avoid glitches
          const finalNodes = transitions.map(({ node, to }) => {
            return {
              id: node.id,
              position: {
                x: to.x,
                y: to.y,
              },
              data: { ...node.data },
              type: node.type,
            };
          });

          setNodes(finalNodes);

          // stop the animation
          t.stop();

          //Always fit the view
          if (nodeCount <= 6) {
            const padding = orientation === 'HORIZONTAL' ? 0.2 : 0.1;
            setTimeout(() => fitView({ duration: 300, padding: padding }), 0);
          }

          // In the first run, fit the view
          if (initial.current) {
            setTimeout(() => fitView({ duration: 200, padding: 0.2 }), 200);
          }
          initial.current = false;
        }
      });

      return () => {
        t.stop();
      };
    }
  }, [
    nodeCount,
    getEdges,
    getNodes,
    getNode,
    setNodes,
    fitView,
    setEdges,
    orientation,
    initialized,
  ]);
}
