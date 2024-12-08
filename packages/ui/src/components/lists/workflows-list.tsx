import { Link, useNavigate } from 'react-router-dom';

import { Workflow } from '@/models/workflow/workflow-model';
import { cn } from '@/utils/cn';

import { WorkflowDropdownMenu } from '../dropdown-menus/workflow-dropdown-menu';
import { EmptyPlaceholder } from '../empty-placeholder';
import { Icons } from '../icons';
import { ListViewLoader } from '../loaders/list-view-loader';
import { Button } from '../ui/button';
import { ListView } from '../ui/list-view';

type WorkflowsListProps = {
  projectId: string;
  data?: Workflow[];
  isLoading: boolean;
  title: string;
  description: string;
  className?: string;
};

export function WorkflowsList(props: WorkflowsListProps) {
  const navigate = useNavigate();

  if (props.isLoading) {
    return <ListViewLoader numberOfItems={5} withTitle />;
  }

  if (!props.data) {
    return null;
  }

  return (
    <ListView className={cn(props.className)}>
      <ListView.Header>
        <ListView.Title>{props.title}</ListView.Title>
        <ListView.Description>{props.description}</ListView.Description>
      </ListView.Header>
      <ListView.Body>
        {props.data.length === 0 ? (
          <EmptyPlaceholder
            buttonLabel="New Workflow"
            description="To create a new workflow, click below."
            title="No Workflows"
            icon={<Icons.workflow />}
            onClick={() => {
              navigate(`/projects/${props.projectId}/workflows/new`);
            }}
          />
        ) : (
          props.data.map((item) => (
            <ListView.Row key={item.id}>
              <div className="flex justify-between">
                <div>
                  <ListView.Title>{item.name}</ListView.Title>
                  <ListView.Description>
                    {item.description}
                  </ListView.Description>
                </div>
                <WorkflowDropdownMenu
                  projectId={props.projectId}
                  workflowId={item.id}
                />
              </div>
            </ListView.Row>
          ))
        )}
      </ListView.Body>
      {props.data.length === 0 ? null : (
        <ListView.Footer className="flex justify-end space-x-2">
          <Button
            variant="expandIconOutline"
            Icon={Icons.arrowRight}
            iconPlacement="right"
            asChild
          >
            <Link to={`/projects/${props.projectId}/workflows`}>
              View all workflows
            </Link>
          </Button>
        </ListView.Footer>
      )}
    </ListView>
  );
}
