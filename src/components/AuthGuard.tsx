import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LoadingSpinner } from './ui/LoadingSpinner';

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
    return <LoadingSpinner fullPage size="medium" />;
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