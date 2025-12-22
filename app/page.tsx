'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { LoadingPage } from '@/components/ui/loading';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      if (user && isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted, user, isAuthenticated, router]);

  if (!mounted) {
    return <LoadingPage />;
  }

  return <LoadingPage />;
}

