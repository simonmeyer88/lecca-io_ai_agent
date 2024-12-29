import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/cn';

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 rounded-full', className)}
    {...props}
  />
));
AvatarRoot.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      'aspect-square object-cover h-full w-full rounded-full',
      className,
    )}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => {
  // const bgColor = React.useMemo(() => {
  //   //Random colors for a background
  //   const colors = [
  //     '#F87171',
  //     '#FBBF24',
  //     '#34D399',
  //     '#60A5FA',
  //     '#818CF8',
  //     '#F472B6',
  //     '#818CF8',
  //     '#34D399',
  //   ];

  //   return colors[Math.floor(Math.random() * colors.length)];
  // }, []);

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        `flex h-full w-full items-center justify-center rounded-full text-xs bg-muted`,
        className,
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const avatarBadgeVariants = cva(
  'absolute w-4 h-4 rounded-full bg-background flex items-stretch justify-stretch [&>*]:grow [&>*]:rounded-full',
  {
    variants: {
      position: {
        bottomLeft: 'bottom-0 -left-1',
        bottomRight: 'bottom-0 -right-1',
        topLeft: 'top-0 -left-1',
        topRight: 'top-0 -right-1',
      },
    },
    defaultVariants: {
      position: 'bottomLeft',
    },
  },
);

export interface AvatarBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarBadgeVariants> {
  children?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | null
    | never[];
}

const AvatarBadge = ({ className, position, ...props }: AvatarBadgeProps) => (
  <div
    className={cn(avatarBadgeVariants({ position }), className)}
    {...props}
  />
);

type AvatarGroupContextValue = {
  count?: number;
  limit?: number;
  setCount?: React.Dispatch<React.SetStateAction<number>>;
};

const AvatarGroupContext = React.createContext<AvatarGroupContextValue>({});

const AvatarGroupProvider = ({
  children,
  limit,
}: {
  children?: React.ReactNode;
  limit?: number;
}) => {
  const [count, setCount] = React.useState<number>(0);

  return (
    <AvatarGroupContext.Provider
      value={{
        count,
        setCount,
        limit,
      }}
    >
      {children}
    </AvatarGroupContext.Provider>
  );
};

const useAvatarGroupContext = () => React.useContext(AvatarGroupContext);

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, className, limit, ...props }, ref) => {
    return (
      <AvatarGroupProvider limit={limit}>
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-end -space-x-3 relative',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </AvatarGroupProvider>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

const AvatarGroupList = ({ children }: { children?: React.ReactNode }) => {
  const { limit, count, setCount } = useAvatarGroupContext();

  React.useEffect(() => {
    if (setCount) {
      setCount(React.Children.count(children));
    }
  }, [children, count, setCount]);

  return limit ? React.Children.toArray(children).slice(0, limit) : children;
};

export type AvatarOverflowIndicatorProps =
  React.HTMLAttributes<HTMLSpanElement>;

const AvatarOverflowIndicator = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & AvatarOverflowIndicatorProps
>(({ className, ...props }, ref) => {
  const { limit, count } = useAvatarGroupContext();
  if (!limit || !count || count <= limit) return null;
  return (
    <span
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs cursor-default',
        className,
      )}
      {...props}
    >
      +{count! - limit!}
    </span>
  );
});
AvatarOverflowIndicator.displayName = 'AvatarOverflowIndicator';

export const Avatar = AvatarRoot as typeof AvatarRoot & {
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
  Badge: typeof AvatarBadge;
  Group: typeof AvatarGroup;
  GroupList: typeof AvatarGroupList;
  OverflowIndicator: typeof AvatarOverflowIndicator;
};

Avatar.Image = AvatarImage;
Avatar.Fallback = AvatarFallback;
Avatar.Badge = AvatarBadge;
Avatar.Group = AvatarGroup;
Avatar.GroupList = AvatarGroupList;
Avatar.OverflowIndicator = AvatarOverflowIndicator;
