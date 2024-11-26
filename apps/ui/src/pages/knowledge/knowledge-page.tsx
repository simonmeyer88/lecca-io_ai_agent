import { CreateKnowledgeForm } from '@/components/forms/create-knowledge-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

import { KnowledgeTable } from './components/table/knowledge-table';

export function KnowledgePage() {
  return (
    <PageLayout
      title="Knowledge Notebooks"
      subtitle="Create knowledge notebooks that can be accessed by your AI Agents"
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.plus}
              iconPlacement="right"
            >
              New Notebook
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreateKnowledgeForm />
          </Dialog.Content>
        </Dialog>,
      ]}
    >
      <KnowledgeTable />
    </PageLayout>
  );
}
