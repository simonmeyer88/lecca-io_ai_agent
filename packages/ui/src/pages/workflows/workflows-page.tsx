import { SelectProjectForWorkflowForm } from '@/components/forms/select-project-for-workflow-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

import WorkflowsTable from './components/table/workflows-table';

export default function WorkflowsPage() {
  return (
    <PageLayout
      title="Workflows"
      subtitle="Build workflow automations and tools"
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.plus}
              iconPlacement="right"
            >
              New Workflow
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForWorkflowForm />
          </Dialog.Content>
        </Dialog>,
      ]}
    >
      <WorkflowsTable />
    </PageLayout>
  );
}
