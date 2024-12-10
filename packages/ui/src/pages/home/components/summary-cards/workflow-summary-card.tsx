import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { Icons } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { HomeSummaryCard } from '../home-summary-card';

export function WorkflowSummaryCard() {
  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const activeWorkflows = useMemo(() => {
    if (workflows) {
      return workflows.filter((workflow) => workflow.isActive);
    }
  }, [workflows]);

  return (
    <HomeSummaryCard
      title="Active Workflows"
      value={activeWorkflows?.length}
      Icon={Icons.workflow}
      isLoading={isLoadingWorkflows}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/workflows">View all workflows</Link>
        </Button>
      }
    />
  );
}

export function AdminWorkflowSummaryCard() {
  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          includeType: ['all'],
        },
      },
    },
  });

  const activeWorkflows = useMemo(() => {
    if (workflows) {
      return workflows.filter((workflow) => workflow.isActive);
    }
  }, [workflows]);

  return (
    <HomeSummaryCard
      title="Active Workflows"
      value={activeWorkflows?.length}
      Icon={Icons.workflow}
      isLoading={isLoadingWorkflows}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/workflows">View all workflows</Link>
        </Button>
      }
    />
  );
}
