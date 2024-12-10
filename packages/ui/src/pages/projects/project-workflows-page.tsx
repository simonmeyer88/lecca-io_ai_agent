import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { WorkflowDropdownMenu } from '../../components/dropdown-menus/workflow-dropdown-menu';
import { EmptyPlaceholder } from '../../components/empty-placeholder';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { GridLoader } from '../../components/loaders/grid-loader';
import { PageLoader } from '../../components/loaders/page-loader';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/useToast';
import { Workflow } from '../../models/workflow/workflow-model';
import { toLocaleDateStringOrUndefined } from '../../utils/dates';

import { NavProjectSelector } from './components/nav-selectors/nav-project-selector';

export function ProjectWorkflowsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { projectId } = useParams();

  const { data: project, isLoading: isLoadingProject } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: { id: projectId! },
  });

  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  if (isLoadingWorkflows || isLoadingProject) {
    return (
      <PageLoader>
        <GridLoader
          itemClassName="h-36"
          className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
        />
      </PageLoader>
    );
  }

  return (
    <PageLayout
      title={'Workflows'}
      actions={[
        <Button
          variant={'expandIcon'}
          Icon={Icons.arrowRight}
          iconPlacement="right"
          asChild
        >
          <Link to={`/projects/${projectId}/workflows/new`}>New Workflow</Link>
        </Button>,
      ]}
      breadcrumbs={[
        {
          href: '/projects',
          label: 'Projects',
        },
        {
          href: `/projects/${projectId}`,
          label: project?.name || 'Unknown Project Name',
          additionalButton: <NavProjectSelector />,
        },
      ]}
      className="space-y-6"
    >
      <Input
        type="search"
        placeholder="Search workflows..."
        className="py-2 w-[200px] lg:w-[250px] ml-1"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {workflows?.length ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {workflows
            ?.filter(
              (workflow) =>
                workflow.name
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase()) ||
                (workflow.description &&
                  workflow.description
                    .toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase())),
            )
            .map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                projectId={projectId!}
              />
            ))}
        </div>
      ) : (
        <EmptyPlaceholder
          buttonLabel="New Workflow"
          description="To create a new workflow, click below."
          title="No Workflows"
          icon={<Icons.workflow />}
          onClick={() => {
            navigate(`/projects/${projectId}/workflows/new`);
          }}
        />
      )}
    </PageLayout>
  );
}

function WorkflowCard({
  workflow,
  projectId,
}: {
  workflow: Workflow;
  projectId: string;
}) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const updateWorkflowMutation = useApiMutation({
    service: 'workflows',
    method: 'update',
    apiLibraryArgs: {
      id: workflow.id,
    },
  });

  return (
    <Card
      onClick={() => {
        navigate(`/projects/${projectId}/workflows/${workflow.id}`);
      }}
    >
      <Card.Header>
        <Card.Title className="flex justify-between space-x-4 items-start">
          <div className="flex flex-col space-y-1">
            <span>{workflow.name}</span>
            <span className="line-clamp-3 text-sm font-normal text-muted-foreground">
              {workflow.description}
            </span>
          </div>
          <WorkflowDropdownMenu
            projectId={projectId}
            workflowId={workflow.id}
          />
        </Card.Title>
      </Card.Header>
      <Card.Content></Card.Content>
      <Card.Footer className="text-muted-foreground text-xs flex justify-between">
        <span>
          Updated on {toLocaleDateStringOrUndefined(workflow.updatedAt)}
        </span>

        <div className="flex space-x-2 items-center">
          {isSaving ? (
            <Icons.spinner className="animate-spin mr-1" />
          ) : (
            <Switch
              onClick={(e) => {
                e.stopPropagation();
              }}
              checked={workflow.isActive}
              onCheckedChange={(checked) => {
                setIsSaving(true);
                updateWorkflowMutation.mutate(
                  {
                    data: { isActive: checked },
                  },
                  {
                    onSuccess: () => {
                      toast({ title: 'Workflow updated' });
                    },
                    onSettled: () => {
                      setIsSaving(false);
                    },
                  },
                );
              }}
            />
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}
