import { Link } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

import { HomeSummaryCard } from '../home-summary-card';

export function AgentSummaryCard() {
  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
  });

  return (
    <HomeSummaryCard
      title="Agents"
      value={agents?.length}
      Icon={Icons.agent}
      isLoading={isLoadingAgents}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/agents">View all agents</Link>
        </Button>
      }
    />
  );
}

export function AdminAgentSummaryCard() {
  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          includeType: ['all'],
        },
      },
    },
  });

  return (
    <HomeSummaryCard
      title="Agents"
      value={agents?.length}
      Icon={Icons.workflow}
      isLoading={isLoadingAgents}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/agents">View all agents</Link>
        </Button>
      }
    />
  );
}
