import React from 'react';

import { cn } from '../../../utils/cn';

export function HomeSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn('flex justify-center w-full px-4 sm:px-8', className, {
        'max-w-[1200px]': false,
      })}
    >
      {children}
    </section>
  );
}
