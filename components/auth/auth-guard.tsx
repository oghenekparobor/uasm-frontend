'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Don't run checks until mounted and loading is complete
    if (!isMounted || isLoading) return;

    // Check authentication
    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    // Check role if required
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isMounted, isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Show loading during mount or auth loading
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}

