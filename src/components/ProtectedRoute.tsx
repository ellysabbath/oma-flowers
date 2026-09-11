// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Role = 'admin' | 'distributor' | 'customer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const homeFor = (role: string | null): string => {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return '/admin';
    case 'distributor':
      return '/distributor';
    default:
      return '/';
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  // Wait for AuthContext to finish restoring the session
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch → send to their own home
  if (allowedRoles && allowedRoles.length > 0) {
    const role = (userType || 'customer').toLowerCase() as Role;
    if (!allowedRoles.includes(role)) {
      return <Navigate to={homeFor(userType)} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;