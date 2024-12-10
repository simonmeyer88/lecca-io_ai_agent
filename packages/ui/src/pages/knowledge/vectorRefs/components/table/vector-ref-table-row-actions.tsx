import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import useApiMutation from '../../../../../api/use-api-mutation';
import { AlertDialog } from '../../../../../components/ui/alert-dialog';
import { Button } from '../../../../../components/ui/button';
import { Dialog } from '../../../../../components/ui/dialog';
import { DropdownMenu } from '../../../../../components/ui/dropdown-menu';
import { useToast } from '../../../../../hooks/useToast';
import { KnowledgeVectorRef } from '../../../../../models/knowledge-vector-ref-model';
import { ViewVectorRefDataContent } from '../view-vector-ref-data-content';

export function DataTableRowActions({ row }: { row: Row<KnowledgeVectorRef> }) {
  const { knowledgeId } = useParams();
  const { toast } = useToast();
  const rowData = row.original;

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useApiMutation({
    service: 'knowledge',
    method: 'deleteVectorRef',
    apiLibraryArgs: {
      knowledgeId: knowledgeId,
      vectorRefId: rowData.id!,
    },
  });

  const deleteBatchMutation = useApiMutation({
    service: 'knowledge',
    method: 'deleteVectorRefGroupByVectorRefId',
    apiLibraryArgs: {
      knowledgeId: knowledgeId,
      vectorRefId: rowData.id!,
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <Dialog>
          <Dialog.Trigger className="cursor-pointer" asChild>
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              View Data
            </DropdownMenu.Item>
          </Dialog.Trigger>
          <Dialog.Content>
            <ViewVectorRefDataContent vectorRefId={row.original.id} />
          </Dialog.Content>
        </Dialog>
        <DropdownMenu.Separator />
        <AlertDialog>
          <AlertDialog.Trigger asChild>
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              Delete
            </DropdownMenu.Item>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Delete Data</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete this data?
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action
                loading={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteMutation.mutateAsync(
                    {},
                    {
                      onSuccess: () => {
                        toast({ title: 'Data deleted' });
                      },
                      onSettled: () => {
                        setIsDeleting(false);
                      },
                    },
                  );
                }}
              >
                Delete
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
        {row.original.part && (
          <AlertDialog>
            <AlertDialog.Trigger asChild>
              <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                Delete Batch
              </DropdownMenu.Item>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Delete Data</AlertDialog.Title>
                <AlertDialog.Description>
                  This will delete all the data associated with this batch.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action
                  loading={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);

                    await deleteBatchMutation.mutateAsync(
                      {},
                      {
                        onSuccess: () => {
                          toast({ title: 'Batch data deleted' });
                        },
                        onSettled: () => {
                          setIsDeleting(false);
                        },
                      },
                    );
                  }}
                >
                  Delete
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
