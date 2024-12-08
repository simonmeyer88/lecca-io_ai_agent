import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';

import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { Icons } from '@/components/icons';
import { ContextMenu } from '@/components/ui/context-menu';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useProjectWorkflow } from '@/hooks/useProjectWorkflow';
import { cn } from '@/utils/cn';

import { SelectNodeTypeForm } from '../../forms/select-node-type-form';
import { useGetNodeStatus } from '../../hooks/useGetNodeStatus';
import { useUpdateFlow } from '../../hooks/useUpdateFlow';
import '../node-types.css';

import { WorkflowNodePopover } from './action-node-popover';
import { CheckPollingTriggerNode } from './builder/check-polling-trigger-node';
import { ManuallyStartTriggerNode } from './manually-start-trigger-node';

const WorkflowNode = (nodeProps: NodeProps) => {
  const { mappedWorkflowApps } = useProjectWorkflow();
  const { projectId, executionId, agentId, workflowId } = useParams();
  const { setNodes, getEdges } = useReactFlow();
  const { deleteNode } = useUpdateFlow();

  const { workflowOrientation, hasRenderedInitialData } = useProjectWorkflow();

  const { nodeStatus } = useGetNodeStatus({
    node: nodeProps,
    executionId,
    projectId: projectId!,
  });

  const { saveWorkflow, saveAgent, rerenderKey } = useProjectWorkflow();
  const { appendNode } = useUpdateFlow();

  const handleSubmit = (args: {
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    appendNode({
      parentNodeId: nodeProps.id,
      appId: args.appId,
      actionId: args.actionId,
      triggerId: args.triggerId,
      replace: false,
    });

    if (agentId) {
      //We shouldn't ever get here, but it's a hacky protection and type check
      saveAgent?.();
    } else {
      //Any time we add a node, we update the workflow. (this will save the workflow and update the saveWorkflow function to update instead of create)
      //The reason I'm doing this, is because if the workflow isn't saved and then they click Save & Test
      //the workflow is saved twice, creating 2 new workflows
      saveWorkflow?.();
    }
  };

  const currentWorkflowApp = useMemo(() => {
    return mappedWorkflowApps?.[nodeProps.data.appId];
  }, [mappedWorkflowApps, nodeProps.data.appId]);

  const statusClass = useMemo(() => {
    let tempClass = '';
    switch (nodeStatus.status) {
      case 'good':
        tempClass = 'status-good';
        break;
      case 'warning':
        tempClass = 'status-warning';
        break;
      case 'error':
        tempClass = 'status-error';
        break;
      case 'needsInput':
        tempClass = 'status-warning';
        break;
      case 'scheduled':
        tempClass = 'status-warning';
        break;
      case 'running':
        tempClass = 'status-warning animate-pulse';
        break;
      case 'unknown':
        tempClass = 'status-unknown';
        break;
      default:
        tempClass = 'status-unknown';
    }

    if (!nodeStatus.isComplete) {
      tempClass += ' status-incomplete';
    }

    return tempClass;
  }, [nodeStatus.isComplete, nodeStatus.status]);

  const hasNextNode = useMemo(() => {
    const hasEdgesConnectedToNode = getEdges().some(
      (edge) => edge.source === nodeProps.id,
    );

    return hasEdgesConnectedToNode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEdges, nodeProps.id, rerenderKey]);

  const Icon = useMemo(() => {
    let icon: React.ReactElement | null = null;

    if (nodeProps.data.iconUrl) {
      icon = (
        <div className="size-14 bg-muted/70 rounded p-3 flex items-center justify-center hover:bg-muted">
          <img
            src={nodeProps.data.iconUrl}
            alt={nodeProps.data.name}
            className="dark:invert rounded p-1"
          />
        </div>
      );
    } else if (currentWorkflowApp?.logoUrl) {
      icon = (
        <img
          src={currentWorkflowApp.logoUrl}
          alt={nodeProps.data.name}
          className="size-14  bg-muted/70 rounded p-3 hover:bg-muted"
        />
      );
    }

    return icon;
  }, [
    currentWorkflowApp?.logoUrl,
    nodeProps.data.iconUrl,
    nodeProps.data.name,
  ]);

  useEffect(() => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((n) => {
        if (n.id === nodeProps.id) {
          const updatedNode = {
            ...n,
            data: {
              ...n.data,
              status: nodeStatus.status,
              isComplete: nodeStatus.isComplete,
              messages: nodeStatus.messages,
            },
          };

          return updatedNode;
        }
        return n;
      });

      return updatedNodes;
    });
  }, [nodeProps.id, nodeStatus, setNodes]);

  return (
    <ErrorBoundary>
      <WorkflowNodePopover
        {...nodeProps}
        nodeStatus={nodeStatus}
        executionId={executionId}
        workflowId={workflowId}
        agentId={agentId}
        projectId={projectId!}
        defaultOpen={hasRenderedInitialData}
      >
        <ContextMenu>
          <ContextMenu.Trigger>
            <div
              className={cn(`relative bg-background action-node`, statusClass)}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="flex">
                  <div className="">{Icon}</div>
                </div>
                {/* {nodeProps.data.description.length > 100 && (
                      <p className="text-[0.40rem] text-muted-foreground text-left pt-2 overflow-y-hidden overflow-x-auto">
                        {nodeProps.data.description}
                      </p>
                    )} */}
              </div>
              {nodeStatus.status === 'error' ||
              nodeStatus.status === 'warning' ? (
                <Icons.caution
                  className={`absolute bottom-1 right-1 size-2.5 ${nodeStatus.status === 'error' ? 'text-status-error' : 'text-status-warning'}`}
                />
              ) : nodeStatus.status === 'needsInput' ? (
                <Icons.pencilNotebook
                  className={`absolute bottom-1 right-1 size-2  ${'text-status-warning'}`}
                />
              ) : nodeStatus.status === 'scheduled' ? (
                <Icons.calendarClock
                  className={`absolute bottom-1 right-1 size-2  ${'text-status-warning'}`}
                />
              ) : nodeStatus.status === 'running' ? (
                <Icons.spinner
                  className={`absolute bottom-1 right-1 size-2  animate-spin ${'text-status-warning'}`}
                />
              ) : (
                <Icons.check
                  className={`absolute bottom-1 right-1 size-2.5 text-status-good`}
                />
              )}
              <Handle
                className={cn('workflow-handle', {
                  invisible: nodeProps.data.triggerId,
                })}
                type="target"
                position={
                  workflowOrientation === 'HORIZONTAL'
                    ? Position.Left
                    : Position.Top
                }
                isConnectable={false}
              />
              <Handle
                className={cn('workflow-handle', {
                  invisible: !hasNextNode,
                })}
                type="source"
                position={
                  workflowOrientation === 'HORIZONTAL'
                    ? Position.Right
                    : Position.Bottom
                }
                isConnectable={false}
              />
            </div>
            <div className="relative">
              <div className="absolute w-[170%] right-1/2 translate-x-1/2">
                <div className="flex flex-col items-center pt-1">
                  <h4 className="text-[0.5rem] font-bold line-clamp-3">
                    {nodeProps.data.name}
                  </h4>
                  <p className="text-[0.43rem] font-semibold text-muted-foreground">
                    {currentWorkflowApp?.name}
                  </p>
                  {/* {nodeProps.data.description.length < 100 && (
                      <p className="text-[0.40rem] text-muted-foreground text-left pt-1 max-w-28 overflow-y-hidden overflow-x-auto">
                        {nodeProps.data.description}
                      </p>
                    )} */}
                </div>
              </div>
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Item
              disabled={!!executionId}
              onClick={(e) => {
                e.stopPropagation();
                deleteNode({
                  nodeId: nodeProps.id,
                });
              }}
            >
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu>
      </WorkflowNodePopover>
      {nodeProps.data?.triggerId === 'flow-control_trigger_manual' && (
        <ManuallyStartTriggerNode
          nodeProps={nodeProps}
          projectId={projectId!}
          executionId={executionId}
        />
      )}
      {nodeProps.data?.strategy?.startsWith('poll.') && (
        <CheckPollingTriggerNode
          executionId={executionId}
          projectId={projectId!}
        />
      )}
      {!hasNextNode && !executionId && (
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <div className="absolute pb-1 top-1/2 -translate-y-1/2 left-full flex items-center group">
              <div className="border-t-[0.5px] w-2 border-muted-foreground"></div>
              <Icons.plusCircled className="size-3 text-muted-foreground group-hover:text-primary group-hover:shadow-md rounded-full" />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="min-w-[324px]"
            side="right"
            sideOffset={50}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <SelectNodeTypeForm
              placeholderType={'action'}
              onSubmit={handleSubmit}
              entity="workflow"
            />
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </ErrorBoundary>
  );
};

export default WorkflowNode;
