import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ListView } from '@/components/ui/list-view';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';

type Props = {
  app: WorkflowApp;
  showConnectionForm?: () => void;
};

export function AppOverviewContent({ app, showConnectionForm }: Props) {
  return (
    <div className="px-2 pb-2">
      <ListView.Header>
        <ListView.Title className="px-4 flex space-x-2 items-center font-semibold">
          <img
            src={app.logoUrl}
            alt={app.name}
            className="size-6 bg-white rounded-sm p-0.5"
          />
          <span>{app.name}</span>
        </ListView.Title>
      </ListView.Header>

      <ScrollArea className="max-h-[calc(80vh-100px)] overflow-y-auto px-2">
        {app.triggers.length === 0 && app.actions.length === 0 && (
          <ListView.Description className="text-center py-6">
            Triggers & actions coming soon...
          </ListView.Description>
        )}

        {app.triggers.length !== 0 && (
          <ListView>
            <ListView.Title className="p-4">Triggers</ListView.Title>
            <ListView.Body>
              {app.triggers.map((trigger) => (
                <ListView.Row key={trigger.id}>
                  <ListView.Title>{trigger.name}</ListView.Title>
                  <ListView.Description>
                    {trigger.description}
                  </ListView.Description>
                </ListView.Row>
              ))}
            </ListView.Body>
          </ListView>
        )}

        {app.actions.length !== 0 && (
          <ListView>
            <ListView.Title className="p-4">Actions</ListView.Title>
            <ListView.Body>
              {app.actions.map((action) => (
                <ListView.Row key={action.id}>
                  <ListView.Title>{action.name}</ListView.Title>
                  <ListView.Description>
                    {action.description}
                  </ListView.Description>
                </ListView.Row>
              ))}
            </ListView.Body>
          </ListView>
        )}
      </ScrollArea>
      <div className="flex justify-end mt-4 mb-2 mx-2">
        {(app.actions?.some((action) => action.needsConnection) ||
          app.triggers?.some((trigger) => trigger.needsConnection)) &&
          showConnectionForm && (
            <Button
              variant={'expandIcon'}
              Icon={Icons.arrowRight}
              iconPlacement="right"
              onClick={showConnectionForm}
            >
              Add Connection
            </Button>
          )}
      </div>
    </div>
  );
}
