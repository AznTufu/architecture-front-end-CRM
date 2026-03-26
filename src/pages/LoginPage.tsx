import { Navigate } from 'react-router-dom';
import { AuthByPasswordForm } from '../features/auth-by-password';
import { useSessionQuery } from '../shared/auth';

export function LoginPage() {
  const { data: session, isPending } = useSessionQuery();

  if (isPending) {
    return <main className="auth-page">Verification de session...</main>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="auth-page">
      <AuthByPasswordForm />
    </main>
  );
}
