'Hey there! 👋 For the best experience, we recommend using this app on a desktop or laptop computer. Some features might not work as intended on mobile devices.';

import { useState } from 'react';

import { useIsMobile } from '../hooks/useIsMobile';

import { AlertDialog } from './ui/alert-dialog';

export const MobileUiPopup = () => {
  const [open, setOpen] = useState(() => {
    // Check localStorage on initial render
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mobilePopupShown') !== 'true';
    }
    return true;
  });

  const handleClose = () => {
    setOpen(false);
    // Save to localStorage when dialog is closed
    localStorage.setItem('mobilePopupShown', 'true');
  };

  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialog.Content className="max-w-[90dvw]">
        <AlertDialog.Header>
          Hey there!{' '}
          <span role="img" aria-label="Waving hand">
            👋{' '}
          </span>
          For the best experience, we recommend using this app on a desktop or
          laptop computer. Some features might not work as intended on mobile
          devices.
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Action onClick={handleClose}>Got it!</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
