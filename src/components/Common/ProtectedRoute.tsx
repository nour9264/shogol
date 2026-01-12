'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireFreelancer?: boolean;
  requireClient?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireFreelancer = false,
  requireClient = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isFreelancer, isClient, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login');
        return;
      }
      if (requireFreelancer && !isFreelancer) {
        router.push('/');
        return;
      }
      if (requireClient && !isClient) {
        router.push('/');
        return;
      }
    }
  }, [loading, isAuthenticated, isFreelancer, isClient, requireAuth, requireFreelancer, requireClient, router]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireFreelancer && !isFreelancer) {
    return null;
  }

  if (requireClient && !isClient) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

