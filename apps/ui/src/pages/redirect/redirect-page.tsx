import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

export function RedirectPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  return <Navigate to={redirect ?? '/'} replace />;
}
