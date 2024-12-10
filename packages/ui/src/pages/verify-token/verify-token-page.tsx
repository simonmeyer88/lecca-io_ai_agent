import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { api } from '../../api/api-library';
import { Loader } from '../../components/loaders/loader';
import { useUser } from '../../hooks/useUser';

export function VerifyTokenPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { initializeUserContextData } = useUser();

  const handleLoggingInWithToken = useCallback(async () => {
    await api.auth.loginWithToken({ token: token ?? '' });
    await initializeUserContextData();
  }, [initializeUserContextData, token]);

  useEffect(() => {
    handleLoggingInWithToken();
  }, [handleLoggingInWithToken]);

  return <Loader title="Logging in..." />;
}
