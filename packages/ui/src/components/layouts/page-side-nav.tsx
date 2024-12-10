import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '../../utils/cn';
import { buttonVariants } from '../ui/button';

interface PageSideNavProps extends React.HTMLAttributes<HTMLElement> {
  items: React.ReactNode[];
}

export function PageSideNav({ className, items, ...props }: PageSideNavProps) {
  return (
    <nav
      className={cn(
        'flex flex-wrap gap-1 space-x-2 lg:flex-col lg:space-x-0',
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{item}</React.Fragment>
      ))}
    </nav>
  );
}

export function PageSideNavLink({
  item,
}: {
  item: { title: string; to: string };
}) {
  const location = useLocation();

  return (
    <Link
      key={item.to}
      to={item.to}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        location.pathname === item.to
          ? 'bg-muted hover:bg-muted'
          : 'hover:bg-transparent hover:underline text-muted-foreground',
        'justify-start max-w-96 text-[12px]',
      )}
    >
      {item.title}
    </Link>
  );
}
