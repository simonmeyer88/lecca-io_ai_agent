import useApiQuery from '../../../../api/use-api-query';
import { SelectProjectForAgentForm } from '../../../../components/forms/select-project-for-agent-form';
import { SelectProjectForWorkflowForm } from '../../../../components/forms/select-project-for-workflow-form';
import { Icons } from '../../../../components/icons';
import { Card } from '../../../../components/ui/card';
import { Dialog } from '../../../../components/ui/dialog';

export function HomeSectionNoAgentOrWorkflow() {
  const { data: agents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: workflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {},
  });

  if (agents && workflows) {
    if (agents.length > 0 || workflows.length > 0) {
      return null;
    }
  }

  return (
    <div className="w-full flex flex-col space-y-6 my-8">
      <h2 className="text-2xl font-bold">Create your first automation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        <Dialog>
          <Dialog.Trigger>
            <Card
              onClick={() => {
                //To add hover effect
              }}
              className="h-full ring-2"
            >
              <Card.Header className="pb-2">
                <Card.Title className="flex space-x-2 items-center">
                  <Icons.agent className="h-6 w-6" />
                  <span className="text-xl">New Agent</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="text-left flex justify-between items-center">
                <span className="flex-[3]">
                  Create an AI Agent to perform tasks for you.
                </span>
                <Icons.plus className="flex-1 size-12 text-muted-foreground animate-pulse" />
              </Card.Content>
            </Card>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>
        <Dialog>
          <Dialog.Trigger>
            <Card
              onClick={() => {
                //To add hover effect
              }}
              className="h-full ring-2"
            >
              <Card.Header className="pb-2">
                <Card.Title className="flex space-x-2 items-center">
                  <Icons.workflow className="h-6 w-6" />
                  <span className="text-xl">New Workflow</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="text-left flex justify-between items-center">
                <span className="flex-[3]">
                  Create an automation with a trigger and actions.
                </span>
                <Icons.plus className="flex-1 size-12 text-muted-foreground animate-pulse" />
              </Card.Content>
            </Card>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForWorkflowForm />
          </Dialog.Content>
        </Dialog>
      </div>
    </div>
  );
}
