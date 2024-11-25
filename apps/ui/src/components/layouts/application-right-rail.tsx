import { Link, useLocation } from 'react-router-dom';

import { ResizablePanel } from '@/components/ui/resizable';
import { Tooltip } from '@/components/ui/tooltip';
import { useApplicationSideNav } from '@/hooks/useApplicationSideNav';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/utils/cn';

import { Icons } from '../icons';
import { Button, buttonVariants } from '../ui/button';
import { Separator } from '../ui/separator';

export function ApplicationRightRail() {
  const { rightRailIsCollapsed } = useApplicationSideNav();

  return (
    <ResizablePanel
      collapsible={true}
      className={cn(
        'transition-all duration-500 ease-in-out hidden sm:flex flex-col justify-between border-l',
        `${rightRailIsCollapsed ? 'max-w-[0px]' : 'max-w-[44px]'}`,
      )}
    >
      <MainRightRailContent />
    </ResizablePanel>
  );
}

export function MainRightRailContent() {
  const { enabledFeatures } = useUser();
  const { setRightRailIsCollapsed, rightRailIsCollapsed } =
    useApplicationSideNav();

  return (
    <div
      className={cn('mt-1 flex items-center justify-center flex-col', {
        hidden: !enabledFeatures.AGENTS,
      })}
    >
      {!rightRailIsCollapsed && (
        <Button
          variant={'ghost'}
          size="icon"
          onClick={() => setRightRailIsCollapsed(true)}
          className="p-2 text-muted-foreground hover:text-primary mb-3 mt-0.5"
        >
          <Icons.panelRightClose className="size-5" />
        </Button>
      )}
      <Rail
        items={
          [
            //We'll put favorites here once we're ready to implement.
            // {
            //   title: 'Overview',
            //   to: '/',
            //   icon: Icons.agent,
            // },
             
          ].filter(Boolean) as any
        }
      />
      <div className="w-full px-1.5 mb-3">
        <Separator />
      </div>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Link
            to={'/#'}
            className={cn(
              buttonVariants({
                variant: 'ghost',
                size: 'icon',
              }),
              'size-7 rounded-full bg-muted text-muted-foreground',
            )}
          >
            <Icons.plus className="size-4" />
            <span className="sr-only">{'Add Favorite'}</span>
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Content side="right" className="flex items-center gap-4">
          Add Favorite
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

interface RailProps {
  items: {
    title: string;
    to: string;
  }[];
  className?: string;
}

export function Rail({ items, className }: RailProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center py-2">
      <nav className={cn('', className)}>
        {items.map((item, index) => {
          return (
            <Tooltip key={index} delayDuration={0}>
              <Tooltip.Trigger asChild>
                <Link
                  to={item.to}
                  target={item.to ? '_blank' : undefined}
                  className={cn(
                    buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                    }),
                    'size-7 rounded-full',
                    {
                      'bg-muted': location.pathname === item.to,
                    },
                    {
                      'text-muted-foreground': location.pathname !== item.to,
                    },
                  )}
                >
                  {/* <item.icon className="h-4 w-4" /> */}
                  <span className="sr-only">{item.title}</span>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content side="right" className="flex items-center gap-4">
                {item.title}
              </Tooltip.Content>
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
}
