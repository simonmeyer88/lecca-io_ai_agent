import { useMemo } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';

import { Icons } from '../../../../../../components/icons';
import { ContextMenu } from '../../../../../../components/ui/context-menu';
import { useProjectWorkflow } from '../../../../../../hooks/useProjectWorkflow';
import { cn } from '../../../../../../utils/cn';
import { useUpdateFlow } from '../../hooks/useUpdateFlow';
import '../node-types.css';

import { PlaceholderNodePopover } from './placeholder-node-popover';

const PlaceholderNode = (nodeProps: NodeProps) => {
  const { workflowOrientation } = useProjectWorkflow();
  const { getEdges } = useReactFlow();
  const { deleteNode } = useUpdateFlow();
  const placeholderType = useMemo(
    () => nodeProps.data?.placeholderType ?? 'action',
    [nodeProps.data?.placeholderType],
  );

  const hasConnection = useMemo(() => {
    //use getEdges and check the source if it's the nodeProps.id
    const edges = getEdges();
    const connectedEndEdge = edges.find((edge) => edge.source === nodeProps.id);
    return connectedEndEdge;
  }, [getEdges, nodeProps.id]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <PlaceholderNodePopover
          {...nodeProps}
          placeholderType={placeholderType}
        >
          <div
            className={cn(
              `border-dashed bg-background hover:bg-muted relative flex items-center justify-center border rounded-sm`,
              {
                'h-[56px] w-[56px]': placeholderType === 'trigger',
              },
              {
                'size-4': placeholderType === 'action',
              },
            )}
          >
            <Handle
              className={cn('workflow-handle', {
                invisible: true,
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
                invisible: placeholderType === 'trigger' || !hasConnection,
              })}
              type="source"
              position={
                workflowOrientation === 'HORIZONTAL'
                  ? Position.Right
                  : Position.Bottom
              }
              isConnectable={false}
            />
            <Icons.plus className="text-muted-foreground" />
            {placeholderType === 'trigger' && (
              <div className="text-muted-foreground absolute text-[10px] -translate-x-1/2 -bottom-10 left-1/2 w-56 py-4">
                Select a trigger...
              </div>
            )}
          </div>
        </PlaceholderNodePopover>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
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
  );
};

export default PlaceholderNode;
