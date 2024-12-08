import { CreateConnectionForm } from '@/components/forms/create-connection-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

import { ConnectionsTable } from './table/connections-table';

export default function ConnectionsPage() {
  return (
    <PageLayout
      title="Connections"
      subtitle="Manage your connections to different apps."
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.plus}
              iconPlacement="right"
            >
              New Connection
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreateConnectionForm />
          </Dialog.Content>
        </Dialog>,
      ]}
    >
      <ConnectionsTable />
    </PageLayout>
  );
}
