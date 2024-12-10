import { useMemo } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../ui/skeleton';

export function GridLoader({
  itemClassName,
  className,
}: {
  itemClassName?: string;
  className?: string;
}) {
  const RANDOM_LENGTH = useMemo(() => Math.random() * 30, []);

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {Array.from({ length: RANDOM_LENGTH }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-20', itemClassName)}
          style={{ flex: '1' }}
        />
      ))}
    </div>
  );
}
