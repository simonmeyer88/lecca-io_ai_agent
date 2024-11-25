import { cn } from '@/utils/cn';

export function Loader({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'absolute z-[1] w-full h-full bg-background/80 flex items-center justify-center',
        className,
      )}
    >
      <div className="animate-pulse text-muted-foreground">
        {title ?? 'Loading...'}
      </div>
    </div>
  );
}
