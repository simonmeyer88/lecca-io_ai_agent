import React from 'react';

import { api } from '../../api/api-library';
import { useUser } from '../../hooks/useUser';

export default function LogoutPage() {
  const { logout } = useUser();

  React.useEffect(() => {
    api.auth.logout();
    logout();
  }, [logout]);

  return (
    <div className="h-32 w-32 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse flex items-center justify-center">
      Logging out...
    </div>
  );
}
