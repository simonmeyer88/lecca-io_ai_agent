import React from 'react';
import { Outlet } from 'react-router-dom';

import PageLayout from '../../components/layouts/page-layout';
import { PageSideNavLink } from '../../components/layouts/page-side-nav';

const leftRailNavigationItems: React.ReactNode[] = [
  <PageSideNavLink
    item={{ title: 'Account', to: '/workspace-user-account' }}
  />,
  // <PageSideNavLink
  //   item={{
  //     title: 'Notifications',
  //     to: '/workspace-user-notification-preferences',
  //   }}
  // />,
  <PageSideNavLink
    item={{ title: 'Preferences', to: '/workspace-user-preferences' }}
  />,
  <PageSideNavLink
    item={{ title: 'Invitations', to: '/workspace-invitations-received' }}
  />,
];

export default function LayoutComponent() {
  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your account settings and preferences."
      leftRailNavigationItems={[...leftRailNavigationItems]}
    >
      <Outlet />
    </PageLayout>
  );
}
