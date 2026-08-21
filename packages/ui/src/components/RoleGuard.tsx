import React from 'react';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  allowedRoles: string[];
  userRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  userRoles, 
  children,
  fallbackPath = '/unauthorized'
}) => {
  const isAuthorized = allowedRoles.some(role => userRoles.includes(role));

  if (!isAuthorized) {
    // If not authorized, you could return a "Not Authorized" component or redirect.
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
