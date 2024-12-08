import { useCallback } from 'react';
import { ControlButton, Panel, useReactFlow } from 'reactflow';

import { Icons } from '@/components/icons';

import './workflow-controls.css';

export const AgentWorkflowControls = () => {
  const ANIMATION_DURATION = 300;
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const panToCenter = useCallback(() => {
    fitView({ duration: 200, padding: 0.2 });
  }, [fitView]);

  return (
    <Panel position="bottom-left" className="Workflow-Controls !shadow-md">
      <div className="Workflow-Controls-content ">
        <ControlButton
          onClick={panToCenter}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Icons.center className="text-muted-foreground" />
        </ControlButton>
        <ControlButton
          onClick={() => zoomOut({ duration: ANIMATION_DURATION })}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Icons.zoomOut className="text-muted-foreground" />
        </ControlButton>
        <ControlButton
          onClick={() => zoomIn({ duration: ANIMATION_DURATION })}
          className="Workflow-Controls-button !bg-muted/50 hover:!bg-muted"
        >
          <Icons.zoomIn className="text-muted-foreground" />
        </ControlButton>
      </div>
    </Panel>
  );
};
