import PageLayout from '@/components/layouts/page-layout';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export default function AssetsPage() {
  return (
    <PageLayout
      title="Assets"
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Upload File</Button>
          </Dialog.Trigger>
          <Dialog.Content></Dialog.Content>
        </Dialog>,
      ]}
    >
      <div>No Assets</div>
    </PageLayout>
  );
}
