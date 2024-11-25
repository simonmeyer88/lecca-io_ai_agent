import { Skeleton } from '../ui/skeleton';

type TableLoaderProps = {
  exactLength?: number;
};

export function TableLoader(props: TableLoaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between mb-4">
        <div>
          <Skeleton className="h-8 w-52" />
        </div>
        <div className="flex sm:space-x-6">
          <Skeleton className="h-8 w-20 hidden sm:block" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      {Array.from({ length: props.exactLength ?? Math.random() * 100 }).map(
        (_, index) => (
          <div key={index} className="flex space-x-4 sm:space-x-20 w-full">
            <Skeleton className="h-10 hidden sm:block" style={{ flex: '3' }} />
            <Skeleton className="h-10" style={{ flex: '1' }} />
            <Skeleton className="h-10 hidden sm:block" style={{ flex: '1' }} />
            <Skeleton className="h-10 hidden sm:block" style={{ flex: '2' }} />
          </div>
        ),
      )}
    </div>
  );
}
