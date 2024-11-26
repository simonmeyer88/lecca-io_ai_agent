import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Credit } from '@/models/credits-model';

import { CreditDetailsDialogContent } from '../credit-details-dialog-content';

export function DataTableRowActions({ row }: { row: Row<Credit> }) {
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
              View Details
            </DropdownMenu.Item>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreditDetailsDialogContent creditId={row.original.id} />
          </Dialog.Content>
        </Dialog>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
