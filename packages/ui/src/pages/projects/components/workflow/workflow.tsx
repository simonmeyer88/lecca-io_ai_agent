import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Edge,
  FitViewOptions,
  MiniMap,
  Node,
  ProOptions,
  SelectionMode,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 } from 'uuid';

import { ErrorBoundary } from '../../../../components/error-boundary/error-boundary';
import { Loader } from '../../../../components/loaders/loader';
import { useProjectWorkflow } from '../../../../hooks/useProjectWorkflow';
import { useUser } from '../../../../hooks/useUser';
import { Execution as ExecutionModel } from '../../../../models/execution-model';
import { WorkflowTemplate as WorkflowTemplateModel } from '../../../../models/workflow-template-model';
import { Workflow as WorkflowModel } from '../../../../models/workflow/workflow-model';

import { WorkflowControls } from './controls/workflow-controls';
import placeholderEdge from './edges/placeholder-edge/placeholder-edge';
import workflowEdge from './edges/workflow-edge/workflow-edge';
import actionNode from './nodes/action-node/action-node';
import { loadNodesFromSavedState } from './nodes/node-utils';
import placeholderNode from './nodes/placeholder-node/placeholder-node';

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

export function Workflow({
  workflowData,
}: {
  workflowData?: WorkflowModel | ExecutionModel | WorkflowTemplateModel;
}) {
  const { executionId } = useParams();
  const { workspaceUserPreferences } = useUser();
  const { setWorkflowOrientation, setRerenderKey, takeSnapshot } =
    useProjectWorkflow();
  const { mappedWorkflowApps, workflowAppsLoading } = useProjectWorkflow();
  const { setNodes, setEdges } = useReactFlow();

  //This is used to rerender the nodes when an execution updates (when polling for updates)
  const [previousWorkflowData, setPreviousWorkflowData] =
    useState(workflowData);

  useEffect(() => {
    const orientation = (workflowData as WorkflowModel)?.workflowOrientation
      ? (workflowData as WorkflowModel)?.workflowOrientation
      : (workspaceUserPreferences?.workflowOrientation ?? 'HORIZONTAL');

    setWorkflowOrientation(orientation);
  }, [
    setWorkflowOrientation,
    workflowData,
    workspaceUserPreferences?.workflowOrientation,
  ]);

  const nodeTypes = useMemo(
    () => ({
      placeholder: placeholderNode,
      action: actionNode,
      trigger: actionNode, //There's no big difference, so we'll keep them the same
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      workflow: workflowEdge,
      placeholder: placeholderEdge,
    }),
    [],
  );

  const panOnDrag = useMemo(() => {
    if (window.innerWidth < 640) {
      return undefined;
    }

    return [1, 2];
  }, []);

  const defaults = useMemo(() => {
    let loadedNodes: Node[] = [];
    let loadedEdges: Edge[] = [];

    if (!mappedWorkflowApps) {
      return {
        nodes: defaultNodes,
        edges: defaultEdges,
      };
    }

    if (workflowData) {
      const { nodes, edges } = loadNodesFromSavedState({
        savedNodes: workflowData.nodes,
        savedEdges: workflowData.edges,
        apps: mappedWorkflowApps,
      });

      loadedNodes = nodes;
      loadedEdges = edges;
    }

    return {
      nodes: loadedNodes.length ? loadedNodes : defaultNodes,
      edges: loadedEdges ?? defaultEdges,
    };
  }, [mappedWorkflowApps, workflowData]);

  useEffect(() => {
    /**
     * Only for executions. When the workflowData updates, we want to reset the workflow
     * with the new nodes/edges. We get these updates when we poll the execution for updates.
     */

    if (
      mappedWorkflowApps &&
      executionId &&
      workflowData &&
      workflowData.updatedAt !== previousWorkflowData?.updatedAt
    ) {
      setPreviousWorkflowData(workflowData);

      const { nodes, edges } = loadNodesFromSavedState({
        savedNodes: workflowData.nodes,
        savedEdges: workflowData.edges,
        apps: mappedWorkflowApps,
      });

      setNodes(nodes);
      setEdges(edges);

      setRerenderKey((prev) => prev + 1);
    }
  }, [
    executionId,
    mappedWorkflowApps,
    previousWorkflowData?.updatedAt,
    setEdges,
    setNodes,
    setRerenderKey,
    workflowData,
    workflowData?.updatedAt,
  ]);

  if (workflowAppsLoading) {
    return <Loader />;
  }

  return (
    <ErrorBoundary>
      <ReactFlow
        defaultNodes={defaults.nodes}
        defaultEdges={defaults.edges}
        proOptions={proOptions}
        fitView
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={fitViewOptions}
        onNodeDragStop={() => {
          takeSnapshot();
        }}
        minZoom={0.2}
        panOnScroll
        panOnDrag={panOnDrag}
        nodesDraggable={true}
        selectNodesOnDrag={true}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        snapGrid={[5, 10]}
        snapToGrid={true}
        deleteKeyCode={null}
        nodesConnectable={false}
        className="relative"
      >
        <MiniMap
          zoomable
          pannable
          className="hidden sm:block !bg-background rounded-lg [&>svg]:rounded-lg"
        />
        <Background gap={8} style={{ opacity: 0.25 }} />
        <WorkflowControls />
      </ReactFlow>
    </ErrorBoundary>
  );
}
