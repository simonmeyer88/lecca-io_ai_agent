import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Edge,
  FitViewOptions,
  MiniMap,
  Node,
  ProOptions,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 } from 'uuid';

import { Loader } from '../../../../components/loaders/loader';
import { useProjectAgent } from '../../../../hooks/useProjectAgent';
import { Agent } from '../../../../models/agent/agent-model';
import { AgentWorkflowControls } from '../workflow/agent-controls/agent-workflow-controls';
import { useLayout } from '../workflow/hooks/useLayout';

import { RootAgentNode } from './nodes/root-agent-node';

const proOptions: ProOptions = { account: 'paid-pro', hideAttribution: true };
export const defaultNodes: Node[] = [
  {
    id: v4(),
    data: {
      label: '+',
      placeholderType: 'trigger',
    },
    position: { x: 0, y: 0 },
    type: 'placeholder',
  },
];
const defaultEdges: Edge[] = [];
const fitViewOptions: FitViewOptions = {
  padding: 0.95,
};

export function AgentWorkflow({ agent }: { agent: Agent | undefined }) {
  useLayout({
    orientation: 'VERTICAL', //Vertical makes sense to visualize an agentic system
  });

  const nodeTypes = useMemo(
    () => ({
      rootAgentNode: RootAgentNode,
    }),
    [],
  );

  //   const edgeTypes = useMemo(
  //     () => ({
  //       workflow: workflowEdge,
  //       placeholder: placeholderEdge,
  //     }),
  //     [],
  //   );

  const panOnDrag = useMemo(() => {
    if (window.innerWidth < 640) {
      return undefined;
    }

    return [1, 2];
  }, []);

  const { mappedWorkflowApps, workflowAppsLoading } = useProjectAgent();

  const defaults = useMemo(() => {
    const loadedNodes: Node[] = [];
    const loadedEdges: Edge[] = [];

    if (!mappedWorkflowApps) {
      return {
        nodes: defaultNodes,
        edges: defaultEdges,
      };
    }

    console.info('agent', agent);

    // if (workflowData) {
    //   const { nodes, edges } = loadNodesFromSavedState({
    //     savedNodes: workflowData.nodes,
    //     savedEdges: workflowData.edges,
    //     apps: mappedWorkflowApps,
    //   });

    //   loadedNodes = nodes;
    //   loadedEdges = edges;
    // }

    return {
      nodes: loadedNodes.length ? loadedNodes : defaultNodes,
      edges: loadedEdges ?? defaultEdges,
    };
  }, [agent, mappedWorkflowApps]);

  if (workflowAppsLoading) {
    return <Loader />;
  }

  return (
    <ReactFlow
      defaultNodes={defaults.nodes}
      defaultEdges={defaults.edges}
      proOptions={proOptions}
      fitView
      nodeTypes={nodeTypes}
      //   edgeTypes={edgeTypes}
      fitViewOptions={fitViewOptions}
      minZoom={0.2}
      panOnScroll
      panOnDrag={panOnDrag}
      nodesDraggable={false}
      nodesConnectable={false}
      className="relative"
    >
      <MiniMap
        zoomable
        pannable
        className="hidden sm:block !bg-background rounded-lg [&>svg]:rounded-lg"
      />
      <Background gap={8} style={{ opacity: 0.25 }} />
      <AgentWorkflowControls />
    </ReactFlow>
  );
}
