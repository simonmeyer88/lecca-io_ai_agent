import React, { FC } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { Dialog } from './ui/dialog';

type EmptyPlaceholderProps = {
  title: string;
  description: string;
  buttonLabel?: string;
  onClick?: (...args: any) => any;
  isDialogTrigger?: boolean;
  icon?: React.ReactNode;
  /**
   * Add your own component as the button
   */
  buttonComponent?: FC;
  className?: string;
  bottomComponent?: React.ReactNode;
};

export function EmptyPlaceholder(props: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-4 h-[450px] shrink-0 items-center justify-center rounded-md border bg-secondary/40',
        props.className,
      )}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {props.icon}
        <h3 className="mt-4 text-lg font-semibold">{props.title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {props.description}
        </p>
        {props.onClick || props.buttonLabel || props.buttonComponent ? (
          props.isDialogTrigger ? (
            <Dialog.Trigger asChild>
              {props.buttonComponent ? (
                <props.buttonComponent />
              ) : (
                <Button onClick={props.onClick} variant={'outline'}>
                  {props.buttonLabel}
                </Button>
              )}
            </Dialog.Trigger>
          ) : props.buttonComponent ? (
            <props.buttonComponent />
          ) : (
            <Button onClick={props.onClick} variant={'outline'}>
              {props.buttonLabel}
            </Button>
          )
        ) : null}
      </div>
      {props.bottomComponent}
    </div>
  );
}
