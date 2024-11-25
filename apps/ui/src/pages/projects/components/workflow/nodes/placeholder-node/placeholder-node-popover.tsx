import React from 'react';
import { Edge, NodeProps, useReactFlow } from 'reactflow';

import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useProjectWorkflow } from '@/hooks/useProjectWorkflow';

import { SelectNodeTypeForm } from '../../forms/select-node-type-form';
import { useUpdateFlow } from '../../hooks/useUpdateFlow';

const canDelete = (id: string, edges: Edge[]) => {
  return edges.some((edge: Edge) => edge.source === id);
};

export const PlaceholderNodePopover = ({
  children,
  id,
  placeholderType,
}: NodeProps & {
  children: React.ReactElement;
  placeholderType: 'trigger' | 'action';
}) => {
  const { saveWorkflow, hasRenderedInitialData } = useProjectWorkflow();
  const { getEdges } = useReactFlow();
  const { replacePlaceholder, deleteNode } = useUpdateFlow();

  const handleSubmit = (args: {
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    replacePlaceholder({
      nodeId: id,
      appId: args.appId,
      actionId: args.actionId,
      triggerId: args.triggerId,
    });

    //Any time we add a node, we update the workflow. (this will save the workflow and update the saveWorkflow function to update instead of create)
    //The reason I'm doing this, is because if the workflow isn't saved and then they click Save & Test
    //the workflow is saved twice, creating 2 new workflows
    saveWorkflow?.();
  };

  const handleDelete = () => {
    deleteNode({ nodeId: id });
  };

  return (
    <DropdownMenu
      defaultOpen={hasRenderedInitialData || placeholderType === 'trigger'}
    >
      <DropdownMenu.Trigger>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="min-w-[324px]"
        alignOffset={-30}
        sideOffset={-240}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <SelectNodeTypeForm
          placeholderType={placeholderType}
          onSubmit={handleSubmit}
          onDelete={canDelete(id, getEdges()) ? handleDelete : undefined}
          entity="workflow"
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
