'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';
import type { LoginCredentials } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', credentials);
      setAuth(response.data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-black text-white text-2xl font-bold">
              U
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">UAMS</h1>
          <p className="text-sm sm:text-base text-gray-600">Urban Alternative Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-black focus:outline-none focus:ring-2 focus:ring-black touch-manipulation"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full min-h-[44px] rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-black focus:outline-none focus:ring-2 focus:ring-black touch-manipulation"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] rounded-lg bg-black px-4 py-3 text-base text-white font-medium hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}
