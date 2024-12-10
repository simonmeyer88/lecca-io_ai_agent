import { useParams } from 'react-router-dom';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSimpleBezierPath,
} from 'reactflow';

import { Icons } from '../../../../../../components/icons';
import { DropdownMenu } from '../../../../../../components/ui/dropdown-menu';
import { useProjectWorkflow } from '../../../../../../hooks/useProjectWorkflow';
import { SelectNodeTypeForm } from '../../forms/select-node-type-form';
import { useUpdateFlow } from '../../hooks/useUpdateFlow';
import '../edge-types.css';

function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  markerEnd,
}: EdgeProps) {
  const { executionId } = useParams();
  const { saveWorkflow } = useProjectWorkflow();
  const { insertNode, splitPath } = useUpdateFlow();

  const handleInsert = (args: {
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    insertNode({
      parentNodeId: source,
      childNodeId: target,
      appId: args.appId,
      actionId: args.actionId,
      triggerId: args.triggerId,
    });

    //Any time we add a node, we update the workflow. (this will save the workflow and update the saveWorkflow function to update instead of create)
    //The reason I'm doing this, is because if the workflow isn't saved and then they click Save & Test
    //the workflow is saved twice, creating 2 new workflows
    saveWorkflow?.();
  };

  const handleSplit = (args: {
    appId: string;
    actionId?: string;
    triggerId?: string;
  }) => {
    splitPath({
      parentNodeId: source,
      appId: args.appId,
      actionId: args.actionId,
      triggerId: args.triggerId,
    });

    //Any time we add a node, we update the workflow. (this will save the workflow and update the saveWorkflow function to update instead of create)
    //The reason I'm doing this, is because if the workflow isn't saved and then they click Save & Test
    //the workflow is saved twice, creating 2 new workflows
    saveWorkflow?.();
  };

  const [edgePath, edgeCenterX, edgeCenterY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          fill: 'none',
        }}
      />
      {!executionId && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(${edgeCenterX - 6}px, ${edgeCenterY - 6}px)`,
            }}
            className={`workflow-edgeButton duration-100 size-3 rounded-full border-1 border-background hover:shadow-md bg-muted group`}
          >
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <div className="workflow-edgeButtonTrigger bg-background opacity-50 group-hover:opacity-100">
                  <Icons.plusCircled className={`size-3  `} />
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content sideOffset={-10} className="w-52">
                <DropdownMenu.Label>Options</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger>
                    <span>Insert Action</span>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="min-w-[324px]"
                      sideOffset={10}
                    >
                      <SelectNodeTypeForm
                        placeholderType={'action'}
                        onSubmit={handleInsert}
                        entity="workflow"
                      />
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger>
                    <span>Split Path</span>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="min-w-[324px]"
                      sideOffset={10}
                    >
                      <SelectNodeTypeForm
                        placeholderType={'action'}
                        onSubmit={handleSplit}
                        entity="workflow"
                      />
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default CustomEdge;
