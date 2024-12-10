import { Handle, Position } from 'reactflow';

import { ContextMenu } from '../../../../../components/ui/context-menu';

export const RootAgentNode = () => {
  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <div
          className={`workflow-placeholder bg-background hover:bg-muted relative`}
        >
          <Handle
            className={'workflow-handle'}
            type="source"
            position={Position.Bottom}
            isConnectable={false}
          />
          <div className="absolute text-[10px] -translate-x-1/2 -bottom-10 left-1/2 w-56 py-4">
            ROOT AGENT
          </div>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          TODO
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
};
