import { useContext } from 'react';

import { ApplicationSideNavContext } from '../providers/application-side-nav-provider';

export const useApplicationSideNav = () =>
  useContext(ApplicationSideNavContext);
