import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { UploadFileKnowledgeForm } from '@/components/forms/upload-file-knowledge-form';
import { UploadRawTextKnowledgeForm } from '@/components/forms/upload-raw-text-knowledge-form';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

import { columns } from './vector-ref-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export function VectorRefTable({ knowledgeId }: { knowledgeId: string }) {
  return <Table knowledgeId={knowledgeId} />;
}

function Table(props: { knowledgeId: string }) {
  const { isLoading, data } = useApiQuery({
    service: 'knowledge',
    method: 'getVectorRefs',
    apiLibraryArgs: {
      knowledgeId: props.knowledgeId,
    },
  });

  return (
    <DataTable
      columns={columns}
      isLoading={isLoading}
      data={data}
      emptyPlaceholder={
        <EmptyPlaceholder
          icon={<Icons.knowledge />}
          title="No Data Available"
          buttonComponent={() => (
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
                    <UploadRawTextKnowledgeForm
                      knowledgeId={props.knowledgeId}
                    />
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
                    <UploadFileKnowledgeForm knowledgeId={props.knowledgeId} />
                  </Dialog.Content>
                </Dialog>
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
          description="Enter text or upload a text document"
        />
      }
    />
  );
}
