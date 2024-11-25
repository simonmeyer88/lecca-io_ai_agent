import { Link, Outlet } from 'react-router-dom';

import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';

export function OnboardingLayout() {
  return (
    <Tooltip.Provider delayDuration={0}>
      <div
        className={
          'relative h-full w-full flex justify-center items-center container'
        }
      >
        <div className="absolute space-x-2 right-4 top-4 md:right-8 md:top-8">
          <Button variant={'link'} asChild>
            <Link
              to="https://docs.lecca.io"
              target="_blank"
              className="space-x-2"
            >
              <span>Docs</span>
              <Icons.externalLink className="size-4" />
            </Link>
          </Button>
          <Button variant={'link'} asChild>
            <Link to="/logout">Logout </Link>
          </Button>
        </div>
        <Outlet />
      </div>
    </Tooltip.Provider>
  );
}
