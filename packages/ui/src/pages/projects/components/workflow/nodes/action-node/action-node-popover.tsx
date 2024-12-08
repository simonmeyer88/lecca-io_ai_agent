import React from 'react';
import { Node, NodeProps } from 'reactflow';

import { Dialog } from '@/components/ui/dialog';
import { Drawer } from '@/components/ui/drawer';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

import { NodeStatus } from '../node-utils';

import { WorkflowNodeConfigForm } from './action-node-config-form';

export const WorkflowNodePopover = ({
  children,
  nodeStatus,
  projectId,
  executionId,
  agentId,
  workflowId,
  defaultOpen,
  noPopover,
  asChild,
  className,
  onSave,
  ...nodeProps
}: NodeProps & {
  children: React.ReactElement;
  type: string;
  nodeStatus: {
    status: NodeStatus;
    isComplete: boolean;
    messages: string[];
  };
  projectId: string;
  executionId: string | undefined;
  workflowId: string | undefined;
  agentId: string | undefined;
  defaultOpen: boolean;
  noPopover?: boolean;
  asChild?: boolean;
  className?: string;
  onSave?: () => void;
}) => {
  return window.innerWidth < 800 ? (
    <Drawer>
      <Drawer.Trigger asChild={asChild}>{children}</Drawer.Trigger>
      <Drawer.Content
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn('w-[100dvw] flex', className)}
      >
        <WorkflowNodeConfigForm
          nodeStatus={nodeStatus}
          projectId={projectId}
          executionId={executionId}
          workflowId={workflowId}
          agentId={agentId}
          noPopover={noPopover}
          currNode={nodeProps as unknown as Node}
          onSave={onSave}
        />
      </Drawer.Content>
    </Drawer>
  ) : window.innerWidth < 1400 || noPopover ? (
    <Dialog defaultOpen={defaultOpen}>
      <Dialog.Trigger
        className={cn('hover:shadow-md transition-all duration-75', className)}
        asChild={asChild}
      >
        {children}
      </Dialog.Trigger>
      <Dialog.Content
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[100dvw] max-w-[calc(100dvw-20px)] sm:max-w-[600px] flex"
      >
        <WorkflowNodeConfigForm
          projectId={projectId}
          nodeStatus={nodeStatus}
          executionId={executionId}
          workflowId={workflowId}
          agentId={agentId}
          noPopover={noPopover}
          currNode={nodeProps as unknown as Node}
          onSave={onSave}
        />
      </Dialog.Content>
    </Dialog>
  ) : (
    <Popover defaultOpen={defaultOpen}>
      <Popover.Trigger
        className={cn('hover:shadow-md transition-all duration-75', className)}
        asChild={asChild}
      >
        {children}
      </Popover.Trigger>
      <Popover.Content
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn('w-[500px] flex', {
          // 'w-[800px]': nodeProps.data.output,
        })}
        side="right"
        sideOffset={30}
      >
        <WorkflowNodeConfigForm
          projectId={projectId}
          nodeStatus={nodeStatus}
          executionId={executionId}
          workflowId={workflowId}
          agentId={agentId}
          noPopover={noPopover}
          currNode={nodeProps as unknown as Node}
          onSave={onSave}
        />
      </Popover.Content>
    </Popover>
  );
};
