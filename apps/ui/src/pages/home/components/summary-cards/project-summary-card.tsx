import { Link } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

import { HomeSummaryCard } from '../home-summary-card';

export function ProjectSummaryCard() {
  const { data: projects, isLoading: isLoadingProjects } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  return (
    <HomeSummaryCard
      title="Projects"
      isLoading={isLoadingProjects}
      value={projects?.length}
      Icon={Icons.project}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/projects">View all projects</Link>
        </Button>
      }
    />
  );
}

export function AdminProjectSummaryCard() {
  const { data: projects, isLoading: isLoadingProjects } = useApiQuery({
    service: 'projects',
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
      title="Projects"
      isLoading={isLoadingProjects}
      value={projects?.length}
      Icon={Icons.project}
      summary={
        <Button variant={'link'} size="sm" className="p-0 h-2">
          <Link to="/projects">View all projects</Link>
        </Button>
      }
    />
  );
}
