import * as React from 'react';

import { cn } from '@/utils/cn';

const ListViewRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <div
      ref={ref}
      className={cn('w-full text-sm flex flex-col', className)}
      {...props}
    />
  </div>
));
ListViewRoot.displayName = 'ListView';

const ListViewHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 px-1 py-6', className)}
    {...props}
  />
));
ListViewHeader.displayName = 'ListViewHeader';

const ListViewTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
ListViewTitle.displayName = 'ListViewTitle';

const ListViewDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ListViewDescription.displayName = 'ListViewDescription';

const ListViewBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'border rounded-lg overflow-auto [&_div:last-child]:border-0',
      className,
    )}
    {...props}
  />
));
ListViewBody.displayName = 'ListViewBody';

const ListViewRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'border-b transition-colors p-4 bg-background',
      {
        'hover:bg-muted cursor-pointer': props.onClick,
      },
      className,
    )}
    {...props}
  />
));
ListViewRow.displayName = 'ListViewRow';

const ListViewFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-6', className)} {...props} />
));
ListViewFooter.displayName = 'ListViewFooter';

export const ListView = ListViewRoot as typeof ListViewRoot & {
  Body: typeof ListViewBody;
  Row: typeof ListViewRow;
  Header: typeof ListViewHeader;
  Title: typeof ListViewTitle;
  Description: typeof ListViewDescription;
  Footer: typeof ListViewFooter;
};

ListView.Body = ListViewBody;
ListView.Row = ListViewRow;
ListView.Header = ListViewHeader;
ListView.Title = ListViewTitle;
ListView.Description = ListViewDescription;
ListView.Footer = ListViewFooter;
