import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionQuery } from '../shared/auth';

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const { data: session, isPending } = useSessionQuery();

  if (isPending) {
    return <main className="auth-page">Verification de session...</main>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
