import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useApiMutation from '../../../../api/use-api-mutation';
import { AlertDialog } from '../../../../components/ui/alert-dialog';
import { Button } from '../../../../components/ui/button';
import { DropdownMenu } from '../../../../components/ui/dropdown-menu';
import { useToast } from '../../../../hooks/useToast';
import { Workflow } from '../../../../models/workflow/workflow-model';

export function DataTableRowActions({ row }: { row: Row<Workflow> }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const rowData = row.original;

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useApiMutation({
    service: 'workflows',
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
        <DropdownMenu.Item
          onClick={() => {
            navigate(
              `/projects/${rowData.project.id!}/workflows/${rowData.id}`,
            );
          }}
        >
          Open
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <AlertDialog>
          <AlertDialog.Trigger asChild>
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              Delete
            </DropdownMenu.Item>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Delete Workflow</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete this workflow?
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
                        toast({ title: 'Workflow deleted' });
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
