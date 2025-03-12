import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfessional?: boolean;
  requireAssistant?: boolean;
}

export function AuthGuard({ 
  children, 
  requireProfessional,
  requireAssistant 
}: AuthGuardProps) {
  const { user, professional, assistant, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Remove the redirect to /unauthorized and just check the roles
  if (requireProfessional && !professional) {
    return <Navigate to="/" replace />;
  }

  if (requireAssistant && !assistant) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}