import { Navigate, Outlet, useParams } from 'react-router-dom';

import NavigationBar from '../../components/layouts/application-nav';
import { useApplicationSideNav } from '../../hooks/useApplicationSideNav';
import { useUser } from '../../hooks/useUser';
import { ErrorBoundary } from '../error-boundary/error-boundary';
import { Icons } from '../icons';
import { MobileUiPopup } from '../mobile-ui-popup';
import { OnboardingCard } from '../onboarda/OnboardingCard';
import { tours } from '../onboarda/OnboardingTours';
import Onborda from '../onboarda/Onborda';
import { OnbordaProvider } from '../onboarda/OnbordaContext';
import { Button } from '../ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable';
import { Tooltip } from '../ui/tooltip';

import { AgentSideNav } from './agent-side-nav';
import { ApplicationSideNav } from './application-side-nav';

export default function ApplicationLayout() {
  const { isCollapsed, setIsCollapsed } = useApplicationSideNav();
  const { agentId } = useParams();
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
            {agentId && <AgentSideNav />}

            {/* We would comment this out, but there's a weird bug where if the
            sidenav is collapsed in the agentSideNav view (agentId params) and then
            navigate to a non agent page, the application side nav is collapsed, but the 
            isCollapsed boolean is false. So I will render it, but add a class to hide it.*/}
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
                  <MobileUiPopup />
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
