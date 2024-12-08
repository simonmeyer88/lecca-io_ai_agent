import { Execution } from '@/models/execution-model';
import { cn } from '@/utils/cn';

import { WorkflowDropdownMenu } from '../dropdown-menus/workflow-dropdown-menu';
import { EmptyPlaceholder } from '../empty-placeholder';
import { Icons } from '../icons';
import { ListViewLoader } from '../loaders/list-view-loader';
import { ListView } from '../ui/list-view';

type ExecutionsListProp = {
  projectId: string;
  data?: Execution[];
  isLoading: boolean;
  title: string;
  description: string;
  className?: string;
};

export function ExecutionsList(props: ExecutionsListProp) {
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
            title="No Executions"
            description="When your workflows run, you'll see them here."
            icon={<Icons.workflow />}
          />
        ) : (
          props.data.map((item) => (
            <ListView.Row key={item.id}>
              <div className="flex justify-between">
                <div>
                  <ListView.Title>{item.workflow?.name}</ListView.Title>
                  <ListView.Description>
                    #{item.executionNumber}
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
      {/* {props.data.length === 0 ? null : (
        <ListView.Footer className="flex justify-end space-x-2">
          <Button
            variant="expandIconOutline"
            Icon={Icons.arrowRight}
            iconPlacement="right"
            asChild
          >
            <Link to={`/projects/${props.projectId}/executions`}>
              View all executions
            </Link>
          </Button>
        </ListView.Footer>
      )} */}
    </ListView>
  );
}
