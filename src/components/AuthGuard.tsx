import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  requireProfessional?: boolean;
  requireAssistant?: boolean;
  requireAdmin?: boolean;
}

export function AuthGuard({ 
  children, 
  requireProfessional,
  requireAssistant,
  requireAdmin
}: AuthGuardProps) {
  const { user, professional, assistant, admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage size="medium" />;
  }

  if (!user) {
    if (requireAdmin) {
      return <Navigate to="/admin/giris" state={{ from: location }} replace />;
    }
    return <Navigate to="/giris" state={{ from: location }} replace />;
  }

  if (requireAdmin && !admin) {
    return <Navigate to="/" replace />;
  }

  if (requireProfessional && !professional) {
    return <Navigate to="/" replace />;
  }

  if (requireAssistant && !assistant) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}