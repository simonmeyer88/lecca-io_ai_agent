import { Navigate, Outlet } from 'react-router-dom';

import { Loader } from '../components/loaders/loader';
import { useUser } from '../hooks/useUser';

export const UnauthenticatedRoute = () => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
