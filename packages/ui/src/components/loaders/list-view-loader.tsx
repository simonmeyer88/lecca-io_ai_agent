import { useMemo } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../ui/skeleton';

export function ListViewLoader({
  itemClassName,
  className,
  numberOfItems,
  withTitle,
}: {
  itemClassName?: string;
  className?: string;
  numberOfItems?: number;
  withTitle?: boolean;
}) {
  const RANDOM_LENGTH = useMemo(
    () => numberOfItems ?? Math.random() * 30,
    [numberOfItems],
  );

  return (
    <div className={cn('relative w-full overflow-auto space-y-2', className)}>
      {withTitle && <Skeleton className="h-10 w-1/3" />}
      {Array.from({ length: RANDOM_LENGTH }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-16', itemClassName)}
          style={{ flex: '1' }}
        />
      ))}
    </div>
  );
}
