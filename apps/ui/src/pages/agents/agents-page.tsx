import { SelectProjectForAgentForm } from '@/components/forms/select-project-for-agent-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

import { AgentsTableWithData } from './components/table/agents-table';

export default function AgentsPage() {
  return (
    <PageLayout
      title="Agents"
      subtitle="Build agents to perform tasks for you."
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.plus}
              iconPlacement="right"
            >
              New Agent
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>,
      ]}
    >
      <AgentsTableWithData />
    </PageLayout>
  );
}
