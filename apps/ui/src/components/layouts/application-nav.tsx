import React from 'react';
import { Link } from 'react-router-dom';

import { NavigationMenu } from '@/components/ui/navigation-menu';
import { cn } from '@/utils/cn';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet } from '../ui/sheet';

import {
  AdditionalSideNavContent,
  Credits,
  MainSideNavContent,
  UserSettings,
} from './application-side-nav';

export default function ApplicationNav() {
  return (
    <nav>
      <div className="sm:hidden flex items-center justify-between space-x-2 px-2 sm:px-3 py-1.5">
        <Sheet>
          <Sheet.Trigger asChild>
            <Button variant={'outline'} className="px-3 block sm:hidden">
              <Icons.menu className="size-4" />
            </Button>
          </Sheet.Trigger>
          <Sheet.Content className="flex flex-col p-0 pt-10" side={'left'}>
            <ScrollArea>
              <MainSideNavContent isCollapsed={false} isSheet />
            </ScrollArea>
            <Separator />
            <ScrollArea>
              <Credits isCollapsed={false} />
              <UserSettings isCollapsed={false} />
              <AdditionalSideNavContent isCollapsed={false} isSheet />
            </ScrollArea>
          </Sheet.Content>
        </Sheet>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef(
   
  ({ className, title, children, ...props }: any, ref) => {
    return (
      <li>
        <NavigationMenu.Item asChild>
          <Link
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenu.Item>
      </li>
    );
  },
);
ListItem.displayName = 'ListItem';
