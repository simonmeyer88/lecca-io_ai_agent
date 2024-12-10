import { CreateVariableForm } from '../../components/forms/create-variable-form';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';

import { VariablesTable } from './components/table/variables-table';

export default function VariablesPage() {
  return (
    <PageLayout
      title="Variables"
      subtitle="Setup variables to quickly reuse in your workflows."
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.plus}
              iconPlacement="right"
            >
              New Variable
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreateVariableForm />
          </Dialog.Content>
        </Dialog>,
      ]}
    >
      <VariablesTable />
    </PageLayout>
  );
}
