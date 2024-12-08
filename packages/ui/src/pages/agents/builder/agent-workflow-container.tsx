import { Agent } from '@/models/agent/agent-model';
import { AgentWorkflow } from '@/pages/projects/components/agent/agent-workflow';

export function AgentWorkflowContainer({
  agent,
}: {
  agent: Agent | undefined;
}) {
  return (
    <div className="flex h-[calc(100dvh-155px)] w-full space-x-6 border">
      <AgentWorkflow agent={agent} />
    </div>
  );
}
