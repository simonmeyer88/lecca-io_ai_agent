import type React from 'react';

import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

export function PageLoader({ children }: { children?: React.ReactElement }) {
  return (
    <div className="flex flex-col h-full max-h-[calc(100%-15px)] m-4 sm:m-6 relative">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-10 w-52" />
        </div>
        <div className="flex space-x-6">
          <Skeleton className="h-10 w-20 hidden sm:block" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <Separator className="my-6" />
      {children}
    </div>
  );
}
