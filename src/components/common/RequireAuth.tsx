import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Wraps any page/component that requires the user to be authenticated.
 * While loading the session it shows nothing (or a spinner if you prefer).
 * Once resolved: if user is logged in → renders children; otherwise → redirects to /login.
 */
export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    // Full-screen loading state so layout doesn't flash
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
