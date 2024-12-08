import React from 'react';
import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { CreateConnectionForm } from '@/components/forms/create-connection-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { PageSideNavLink } from '@/components/layouts/page-side-nav';
import { PageLoader } from '@/components/loaders/page-loader';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export const AppDetailsLayout = () => {
  const { appId } = useParams();
  const { data: app, isLoading: isLoadingApp } = useApiQuery({
    service: 'workflowApps',
    method: 'getById',
    apiLibraryArgs: {
      id: appId!,
    },
  });

  const { data: connections, isLoading: isLoadingConnections } = useApiQuery({
    service: 'connections',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const isConnected = useMemo(() => {
    if (!connections || !app) {
      return false;
    }

    return connections.some(
      (connection) => connection.workflowApp?.id === app.id,
    );
  }, [app, connections]);

  const leftRailNavigationItems: React.ReactNode[] = useMemo(() => {
    if (!app) {
      return [];
    }

    return [
      <PageSideNavLink
        item={{
          title: `Overview`,
          to: `/apps/${appId}`,
        }}
      />,
      <PageSideNavLink
        item={{
          title: `Actions (${app.actions.length})`,
          to: `/apps/${appId}/actions`,
        }}
      />,
      <PageSideNavLink
        item={{
          title: `Triggers (${app.triggers.length})`,
          to: `/apps/${appId}/triggers`,
        }}
      />,
      <PageSideNavLink
        item={{
          title: `Connections (${app.connections.length})`,
          to: `/apps/${appId}/connections`,
        }}
      />,
    ];
  }, [app, appId]);

  if (isLoadingApp) {
    return <PageLoader />;
  }

  if (!app) {
    return <div>App not found</div>;
  }

  return (
    <PageLayout
      title={app.name}
      breadcrumbs={[
        {
          label: 'Apps',
          href: `/apps${app.isPublished ? '' : '?tab=private'}`,
        },
      ]}
      actions={[
        isLoadingConnections ? null : (
          <Dialog>
            <Dialog.Trigger asChild>
              <Button
                variant={isConnected ? 'expandIconOutline' : 'expandIcon'}
                Icon={Icons.plus}
                iconPlacement="right"
              >
                {isConnected ? 'Connected' : 'Connect'}
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <CreateConnectionForm workflowApp={app} />
            </Dialog.Content>
          </Dialog>
        ),
      ]}
      leftRailNavigationItems={leftRailNavigationItems}
    >
      <Outlet />
    </PageLayout>
  );
};
