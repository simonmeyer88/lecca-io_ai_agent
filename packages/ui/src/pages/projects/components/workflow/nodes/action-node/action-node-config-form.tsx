import { useMemo, useState } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { v4 } from 'uuid';

import { Icons } from '../../../../../../components/icons';
import { Button } from '../../../../../../components/ui/button';
import { ComboBox } from '../../../../../../components/ui/combo-box';
import { Form } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { Tooltip } from '../../../../../../components/ui/tooltip';
import { useProjectWorkflow } from '../../../../../../hooks/useProjectWorkflow';
import { useUpdateFlow } from '../../hooks/useUpdateFlow';
import {
  NodeStatus,
  calculateValueFromRaw,
  setActionNodeData,
  setTriggerNodeData,
} from '../node-utils';

import { ActionNodeConfigFormBuilder } from './builder/action-node-config-form-builder';
import { CloseDialogOrPopoverButton } from './builder/close-dialog-popover-button';
import { ActionNodeOutputView } from './output/action-node-output-view';

export const WorkflowNodeConfigForm = ({
  currNode,
  prevNode,
  nodeStatus,
  noPopover,
  projectId,
  executionId,
  workflowId,
  agentId,
}: {
  currNode: Node;
  prevNode?: Node;
  nodeStatus: {
    status: NodeStatus;
    isComplete: boolean;
    messages: string[];
  };
  noPopover: boolean | undefined;
  projectId: string;
  executionId: string | undefined;
  workflowId: string | undefined;
  agentId: string | undefined;
  onSave?: () => void;
}) => {
  const { mappedWorkflowApps, saveWorkflow, saveAgent, setRerenderKey } =
    useProjectWorkflow();
  const { setNodes, setEdges } = useReactFlow();
  const [editingNodeLabel, setEditingNodeLabel] = useState(false);
  const [editingNodeDescription, setEditingNodeDescription] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState(currNode.data.name);
  const [newNodeDescription, setNewNodeDescription] = useState(
    currNode.data.description,
  );

  const { deleteNode } = useUpdateFlow();
  const [currentView, setCurrentView] = useState<'config' | 'output'>('config');

  const currentWorkflowApp = useMemo(() => {
    return mappedWorkflowApps?.[currNode.data.appId];
  }, [mappedWorkflowApps, currNode.data.appId]);

  const handleTypeChange = (triggerOrActionId: string | null) => {
    if (triggerOrActionId === null) return;

    const newNodeId = v4();
    //We'll clear the value, output, raw and change the node id
    //Changing the node id will trigger references to fail forcing the user to reconfigure their references.

    setNodes((nodes) => {
      return nodes.map((n) => {
        const workflowApp = mappedWorkflowApps?.[currNode.data.appId];

        if (!workflowApp) {
          throw new Error(
            `Could not find workflow app: ${currNode.data.appId}`,
          );
        }

        if (n.id === currNode.id) {
          if (n.type === 'trigger') {
            const workflowTrigger = workflowApp?.triggers.find(
              (trigger) => trigger.id === triggerOrActionId,
            );

            if (!workflowApp || !workflowTrigger) {
              return n;
            }

            setNewNodeLabel(workflowTrigger.name);
            setNewNodeDescription(workflowTrigger.description);
            return setTriggerNodeData({
              workflowApp,
              workflowTrigger,
              node: {
                id: newNodeId,
                position: n.position,
              } as any, //Without this the name, description, and all data will not reset
              clearOutput: true,
              clearValue: true,
            }) as Node;
          } else {
            const workflowAction = workflowApp?.actions.find(
              (action) => action.id === triggerOrActionId,
            );

            if (!workflowApp || !workflowAction) {
              return n;
            }

            setNewNodeLabel(workflowAction.name);
            setNewNodeDescription(workflowAction.description);
            return setActionNodeData({
              workflowApp,
              workflowAction,
              node: {
                id: newNodeId,
                position: n.position,
              } as any, //Without this the name, description, and all data will not reset
              clearOutput: true,
              clearValue: true,
            }) as Node;
          }
        }

        return n;
      });
    });

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.target === currNode.id) {
          return {
            ...edge,
            target: newNodeId,
          };
        }

        if (edge.source === currNode.id) {
          return {
            ...edge,
            source: newNodeId,
          };
        }
        return edge;
      }),
    );

    setRerenderKey((key) => key + 1); //To trigger useGetNodeStatus
  };

  const handleConfigChange = async (formValues: any) => {
    setNodes((nodes) => {
      return nodes.map((n) => {
        if (n.id === currNode.id) {
          const { value } = calculateValueFromRaw(formValues);

          const updatedNode = {
            ...n,
            data: {
              ...n.data,
              raw: formValues,
              value: value,
            },
          };

          return updatedNode;
        }

        return n;
      });
    });

    if (agentId) {
      if (saveAgent) {
        return await saveAgent();
      }
      throw new Error('Save agent function not found');
    } else {
      if (saveWorkflow) {
        return await saveWorkflow();
      }

      throw new Error('Save workflow function not found');
    }
  };

  const handleLabelChange = () => {
    if (!newNodeLabel) {
      setNewNodeLabel(currNode.data.name);
      setEditingNodeLabel(false);
      return;
    }

    setNodes((nodes) => {
      return nodes.map((n) => {
        if (n.id === currNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              name: newNodeLabel,
            },
          };
        }
        return n;
      });
    });

    setEditingNodeLabel(false);
  };

  const handleDescriptionChange = () => {
    if (!newNodeDescription) {
      setNewNodeDescription(currNode.data.description);
      setEditingNodeDescription(false);
      return;
    }

    setNodes((nodes) => {
      return nodes.map((n) => {
        if (n.id === currNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              description: newNodeDescription,
            },
          };
        }
        return n;
      });
    });

    setEditingNodeDescription(false);
  };

  return (
    <div className="relative flex flex-col w-full">
      <Form.Header className="py-3 border-b flex flex-row justify-between mr-4">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center space-x-2">
            {currentWorkflowApp!.logoUrl ? (
              <div className="bg-white rounded">
                <img
                  src={currentWorkflowApp!.logoUrl}
                  alt={currentWorkflowApp!.name}
                  className="size-5 p-0.5"
                />
              </div>
            ) : null}
            <ComboBox
              className="px-1"
              variant={'ghost'}
              toggle={false}
              disabled={!!executionId}
              onChange={handleTypeChange}
              searchLabel={
                currentWorkflowApp?.name
                  ? `Search ${currentWorkflowApp?.name} ${currNode.type === 'trigger' ? 'Triggers' : 'Actions'}`
                  : undefined
              }
              defaultSelectedItem={{
                label:
                  currNode.type === 'trigger'
                    ? (currentWorkflowApp?.triggers.find(
                        (trigger) => trigger.id === currNode.data.triggerId,
                      )?.name ?? 'Unknown')
                    : (currentWorkflowApp?.actions.find(
                        (action) => action.id === currNode.data.actionId,
                      )?.name ?? 'Unknown'),
                value:
                  currNode.type === 'trigger'
                    ? currNode.data.triggerId
                    : currNode.data.actionId,
              }}
              items={Object.values(
                currNode.type === 'trigger'
                  ? (currentWorkflowApp?.triggers ?? {})
                  : (currentWorkflowApp?.actions ?? {}),
              ).map((value) => ({ value: value.id, label: value.name }))}
            />
          </div>
          {editingNodeLabel ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newNodeLabel}
                autoFocus
                onFocus={(e) => e.target.select()}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLabelChange();
                  }
                }}
              />
              <Button
                onClick={handleLabelChange}
                className="size-6 p-1"
                variant="ghost"
              >
                <Icons.check />
              </Button>
            </div>
          ) : (
            <div className="font-bold text-2xl space-x-2 group">
              <span>{newNodeLabel}</span>
              {!executionId && (
                <Button
                  onClick={() => setEditingNodeLabel(true)}
                  className="size-6 p-1 hidden group-hover:inline"
                  variant="ghost"
                >
                  <Icons.pencil />
                </Button>
              )}
            </div>
          )}
          {editingNodeDescription ? (
            <div className="flex items-center space-x-2 w-full">
              <Input
                value={newNodeDescription}
                autoFocus
                className="w-96"
                onFocus={(e) => e.target.select()}
                onChange={(e) => setNewNodeDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDescriptionChange();
                  }
                }}
              />
              <Button
                onClick={handleDescriptionChange}
                className="size-6 p-1"
                variant="ghost"
              >
                <Icons.check />
              </Button>
            </div>
          ) : (
            <div className="text-xs space-x-2 group flex items-center">
              <span className="line-clamp-2">{newNodeDescription}</span>
              {!executionId && (
                <Button
                  onClick={() => setEditingNodeDescription(true)}
                  className="size-6 p-1 invisible group-hover:visible"
                  variant="ghost"
                >
                  <Icons.pencil />
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="absolute top-2.5 right-11 space-x-3">
          {!executionId && (
            <Tooltip delayDuration={1000}>
              <Tooltip.Trigger>
                <CloseDialogOrPopoverButton noPopover={noPopover}>
                  <Icons.trash
                    className={`size-4 text-muted-foreground`}
                    onClick={() => {
                      deleteNode({ nodeId: currNode.id });
                      if (workflowId) {
                        saveWorkflow?.();
                      } else if (agentId) {
                        saveAgent?.();
                      }
                    }}
                  />
                </CloseDialogOrPopoverButton>
              </Tooltip.Trigger>
              <Tooltip.Content>Delete</Tooltip.Content>
            </Tooltip>
          )}
          {!agentId && (
            <Tooltip>
              <Tooltip.Trigger>
                {nodeStatus.status === 'error' ||
                nodeStatus.status === 'warning' ? (
                  <Icons.caution
                    className={`size-4 ${nodeStatus.status === 'error' ? 'text-status-error' : 'text-status-warning'}`}
                  />
                ) : nodeStatus.status === 'needsInput' ? (
                  <Icons.pencilNotebook
                    className={`size-4 ${'text-status-warning'}`}
                  />
                ) : nodeStatus.status === 'scheduled' ? (
                  <Icons.calendarClock
                    className={`size-4 ${'text-status-warning'}`}
                  />
                ) : (
                  <Icons.check className={`size-4 text-status-good`} />
                )}
              </Tooltip.Trigger>
              <Tooltip.Content className="max-w-96">
                {nodeStatus.messages.length ? (
                  nodeStatus.messages.map((message, index) => (
                    <p key={index}>{message}</p>
                  ))
                ) : (
                  <p>Ready</p>
                )}
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </Form.Header>
      {currentView === 'config' ? (
        <ActionNodeConfigFormBuilder
          noPopover={noPopover}
          onSubmit={(values) => handleConfigChange(values)}
          currentNode={currNode}
          previousNode={prevNode}
          viewOutput={() => setCurrentView('output')}
          projectId={projectId}
          agentId={agentId}
          executionId={executionId}
          workflowId={workflowId}
        />
      ) : currentView === 'output' ? (
        <ActionNodeOutputView
          data={currNode.data?.output}
          viewBuilder={() => setCurrentView('config')}
        />
      ) : null}
    </div>
  );
};
