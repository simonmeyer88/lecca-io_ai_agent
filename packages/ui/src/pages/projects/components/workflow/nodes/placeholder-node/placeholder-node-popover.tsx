import React from 'react';
import { NodeProps } from 'reactflow';

import { DropdownMenu } from '../../../../../../components/ui/dropdown-menu';
import { useProjectWorkflow } from '../../../../../../hooks/useProjectWorkflow';
import { SelectNodeTypeForm } from '../../forms/select-node-type-form';
import { useUpdateFlow } from '../../hooks/useUpdateFlow';

export const PlaceholderNodePopover = ({
  children,
  id,
  placeholderType,
}: NodeProps & {
  children: React.ReactElement;
  placeholderType: 'trigger' | 'action';
}) => {
  const { saveWorkflow, hasRenderedInitialData } = useProjectWorkflow();
  const { replacePlaceholder } = useUpdateFlow();

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
          entity="workflow"
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
