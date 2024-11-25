import Dagre from '@dagrejs/dagre';
import { timer } from 'd3-timer';
import { useRef } from 'react';
import { Edge, Node, useNodesInitialized, useReactFlow } from 'reactflow';

import { WorkflowOrientation } from '@/models/workspace-user-preferences-model';

/**
 * The only reason we're not using dagre yet is because it always completeley redraws the graph.
 * Meaning, a path that was at the top of the graph before, might be at the bottom after the layouting which
 * is horrible UX. We don't actually need this until we want to support loops, multiple nodes to a single node, and dynamic node sizes (which we'll need to upgrade reactflow versions to get node.measured data).
 *
 * For now we'll use the d3 hierarchy layout which is more predictable in useLayout.tsx.
 */

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { orientation: WorkflowOrientation },
) => {
  const g = new Dagre.graphlib.Graph({}).setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: options.orientation === 'HORIZONTAL' ? 'LR' : 'TB',
    ranksep: 60,
    nodesep: 60,
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  // Add nodes to the graph with initial positions if they exist
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.width ?? 0,
      height: node.height ?? 0,
    });

    // Add dummy nodes to maintain branch order
    if (node.data && node.data.initialY !== undefined) {
      g.setNode(`dummy-${node.id}`, {
        width: 0,
        height: 0,
        layer: true,
      });
      g.setEdge(`dummy-${node.id}`, node.id, { weight: 10 });
    }
  });

  Dagre.layout(g);

  return {
     
    nodes: nodes.map((node: any) => {
      const position = g.node(node.id);
      const x = position.x - (node.width ?? 0) / 2;
      const y = position.y - (node.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export function useLayoutDagre({
  orientation,
}: {
  orientation: WorkflowOrientation;
}) {
  const { getNodes, getNode, setNodes, getEdges, fitView } = useReactFlow();

  const initialized = useNodesInitialized();
  const initial = useRef(true);

  // Define the `fixLayout` function to calculate and set node positions
  const fixLayout = () => {
    if (!initialized) return; // Only run if nodes are initialized

    const prevNodes = getNodes();
    const prevEdges = getEdges();

    const { nodes: targetNodes } = getLayoutedElements(prevNodes, prevEdges, {
      orientation,
    });

    // Create objects for animating the node positions
    const transitions = targetNodes.map((node) => ({
      id: node.id,
      from: node.position ?? getNode(node.id)?.position,
      to: node.position,
      node,
    }));

    // Create a timer to animate the nodes to their new positions
    const t = timer((elapsed) => {
      const s = elapsed / 200; // Animation duration in ms

      const currNodes = transitions.map(({ node, from, to }) => ({
        id: node.id,
        position: {
          x: from.x + (to.x - from.x) * s,
          y: from.y + (to.y - from.y) * s,
        },
        data: { ...node.data },
        type: node.type,
      }));

      setNodes(currNodes);

      // Finalize animation and positioning
      if (elapsed > 200) {
        const finalNodes = transitions.map(({ node, to }) => ({
          id: node.id,
          position: {
            x: to.x,
            y: to.y,
          },
          data: { ...node.data },
          type: node.type,
        }));

        setNodes(finalNodes);
        t.stop();

        // Fit view on the first run
        setTimeout(() => fitView({ duration: 200, padding: 0.2 }), 200);
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  };

  // Expose `fixLayout` as the function for manually triggering layout updates
  return { fixLayout };
}
