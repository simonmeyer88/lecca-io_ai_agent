import { useCallback } from 'react';
import { ControlButton, Panel, useReactFlow } from 'reactflow';

import { Icons } from '../../../../../components/icons';
import { Tooltip } from '../../../../../components/ui/tooltip';
import { useProjectWorkflow } from '../../../../../hooks/useProjectWorkflow';
import { useLayoutDagre } from '../hooks/useLayoutDagre';

import './workflow-controls.css';

export const WorkflowControls = () => {
  const ANIMATION_DURATION = 300;
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { takeSnapshot } = useProjectWorkflow();

  const panToCenter = useCallback(() => {
    fitView({ duration: 200, padding: 0.2 });
  }, [fitView]);

  const { fixLayout } = useLayoutDagre({
    orientation: 'HORIZONTAL',
  });

  return (
    <Panel position="bottom-left" className="Workflow-Controls !shadow-md">
      <div className="Workflow-Controls-content ">
        <ControlButton
          onClick={panToCenter}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.center className="text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>Center View</Tooltip.Content>
          </Tooltip>
        </ControlButton>
        <ControlButton
          onClick={() => zoomOut({ duration: ANIMATION_DURATION })}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.zoomOut className="text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>Zoom Out</Tooltip.Content>
          </Tooltip>
        </ControlButton>
        <ControlButton
          onClick={() => zoomIn({ duration: ANIMATION_DURATION })}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.zoomIn className="text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>Zoom In</Tooltip.Content>
          </Tooltip>
        </ControlButton>
        <ControlButton
          onClick={() => {
            fixLayout();
            takeSnapshot();
          }}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.scan className="text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>Fix Layout</Tooltip.Content>
          </Tooltip>
        </ControlButton>
        {/* NOT QUITE WORKING, BUT DONT HAVE TIME FOR THIS ATM */}
        {/* <ControlButton
          onClick={() => {
            canUndo && undo();
          }}
          className={cn('Workflow-Controls-button', {
            '!bg-muted/50 hover:!bg-muted': canUndo,
          })}
        >
          <Icons.chevronLeft
            className={cn({
              'text-muted-foreground': canUndo,
              'text-muted': !canUndo,
            })}
          />
        </ControlButton>
        <ControlButton
          onClick={() => {
            canRedo && redo();
          }}
          className={cn('Workflow-Controls-button', {
            '!bg-muted/50 hover:!bg-muted': canRedo,
          })}
        >
          <Icons.chevronRight
            className={cn({
              'text-muted-foreground': canRedo,
              'text-muted': !canRedo,
            })}
          />
        </ControlButton> */}
        {/* <ControlButton
          onClick={() => {
            setWorkflowOrientation(
              workflowOrientation === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL',
            );
            setTimeout(() => {
              panToCenter();
            }, 300);
          }}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          {workflowOrientation === 'HORIZONTAL' ? (
            <Icons.rectangleVertical className="text-muted-foreground" />
          ) : (
            <Icons.rectangleHorizontal className="text-muted-foreground" />
          )}
        </ControlButton> */}
      </div>
    </Panel>
  );
};
