import React from 'react';

import { Dialog } from '../../../../../../../components/ui/dialog';
import { Popover } from '../../../../../../../components/ui/popover';

export function CloseDialogOrPopoverButton({
  children,
  noPopover,
}: {
  noPopover: boolean | undefined;
  children: React.ReactNode;
}) {
  return window.innerWidth < 1400 || noPopover ? (
    <Dialog.Close asChild>{children}</Dialog.Close>
  ) : (
    <Popover.Close asChild>{children}</Popover.Close>
  );
}
