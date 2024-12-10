import { useParams } from 'react-router-dom';

import useApiQuery from '../../../api/use-api-query';
import { UploadFileKnowledgeForm } from '../../../components/forms/upload-file-knowledge-form';
import { UploadRawTextKnowledgeForm } from '../../../components/forms/upload-raw-text-knowledge-form';
import { Icons } from '../../../components/icons';
import PageLayout from '../../../components/layouts/page-layout';
import { Loader } from '../../../components/loaders/loader';
import { Button } from '../../../components/ui/button';
import { Dialog } from '../../../components/ui/dialog';
import { DropdownMenu } from '../../../components/ui/dropdown-menu';
import { NavKnowledgeSelector } from '../../projects/components/nav-selectors/nav-knowledge-selector';

import { VectorRefTable } from './components/table/vector-ref-table';

export function KnowledgeDetailsPage() {
  const { knowledgeId } = useParams();

  const { data: knowledge, isLoading: knowledgeIsLoading } = useApiQuery({
    service: 'knowledge',
    method: 'getById',
    apiLibraryArgs: {
      id: knowledgeId!,
    },
  });

  if (knowledgeIsLoading) {
    return <Loader />;
  }

  if (!knowledge) {
    return <div>Knowledge not found</div>;
  }

  return (
    <PageLayout
      title={knowledge.name}
      breadcrumbs={[{ label: 'Knowledge Notebooks', href: '/knowledge' }]}
      titleButton={<NavKnowledgeSelector />}
      actions={[
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button className="space-x-2">
              <span>Add Data</span>
              <Icons.plus className="size-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <Dialog>
              <Dialog.Trigger asChild>
                <DropdownMenu.Item
                  onSelect={(e) => e.preventDefault()}
                  className="space-x-2"
                >
                  <span>Enter Text</span>
                </DropdownMenu.Item>
              </Dialog.Trigger>
              <Dialog.Content>
                <UploadRawTextKnowledgeForm knowledgeId={knowledgeId!} />
              </Dialog.Content>
            </Dialog>
            <Dialog>
              <Dialog.Trigger asChild>
                <DropdownMenu.Item
                  onSelect={(e) => e.preventDefault()}
                  className="space-x-2"
                >
                  <span>Upload File</span>
                </DropdownMenu.Item>
              </Dialog.Trigger>
              <Dialog.Content>
                <UploadFileKnowledgeForm knowledgeId={knowledgeId!} />
              </Dialog.Content>
            </Dialog>
          </DropdownMenu.Content>
        </DropdownMenu>,
      ]}
    >
      <VectorRefTable knowledgeId={knowledgeId!} />
    </PageLayout>
  );
}
