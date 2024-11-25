import { Navigate, Outlet } from 'react-router-dom';

import NavigationBar from '@/components/layouts/application-nav';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useApplicationSideNav } from '@/hooks/useApplicationSideNav';
import { useUser } from '@/hooks/useUser';

import { ErrorBoundary } from '../error-boundary/error-boundary';
import { Icons } from '../icons';
import { OnboardingCard } from '../onboarda/OnboardingCard';
import { tours } from '../onboarda/OnboardingTours';
import Onborda from '../onboarda/Onborda';
import { OnbordaProvider } from '../onboarda/OnbordaContext';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';

import { ApplicationSideNav } from './application-side-nav';

export default function ApplicationLayout() {
  const { isCollapsed, setIsCollapsed } = useApplicationSideNav();
  const { workspaceUser: user, workspace } = useUser();

  if (user?.roles.includes('OWNER') && !workspace?.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <Tooltip.Provider delayDuration={0}>
      <OnbordaProvider>
        <Onborda
          tours={tours}
          cardComponent={OnboardingCard}
          shadowRgb={'0, 0, 0'}
          shadowOpacity=".5"
        >
          <ResizablePanelGroup direction={'horizontal'}>
            <ApplicationSideNav />
            <div className="relative w-[1px] hidden sm:block h-full bg-[hsl(var(--border))]">
              <Button
                variant="outline"
                className="absolute z-[1] top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 bg-background border text-muted-foreground p-1 size-6"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <Icons.chevronRight className="size-5" />
                ) : (
                  <Icons.chevronLeft className="size-5" />
                )}
              </Button>
            </div>
            <ResizableHandle className="hidden" />
            <ResizablePanel
              minSize={50}
              collapsible={false}
              className="h-full flex flex-col"
            >
              <NavigationBar />
              <div className="relative flex flex-col flex-1 space-y-4 h-full max-h-full">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </div>
            </ResizablePanel>
            {/* <ApplicationRightRail /> */}
          </ResizablePanelGroup>
        </Onborda>
      </OnbordaProvider>
    </Tooltip.Provider>
  );
}
