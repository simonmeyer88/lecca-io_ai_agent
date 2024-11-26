import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';

import useApiMutation from '@/api/use-api-mutation';
import { UpdateConnectionForm } from '@/components/forms/update-connection-form';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { Connection } from '@/models/connections-model';

export function DataTableRowActions({ row }: { row: Row<Connection> }) {
  const { toast } = useToast();
  const rowData = row.original;

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useApiMutation({
    service: 'connections',
    method: 'delete',
    apiLibraryArgs: {
      id: rowData.id!,
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
              Update
            </DropdownMenu.Item>
          </Dialog.Trigger>
          <Dialog.Content>
            <UpdateConnectionForm connectionId={row.original.id} />
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
              <AlertDialog.Title>Delete Connection</AlertDialog.Title>
              <AlertDialog.Description>
                Deleting a connection will effect all workflows currently using
                this connection. Are you sure?
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
                        toast({ title: 'Connection deleted' });
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
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
