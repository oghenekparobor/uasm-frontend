'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-services';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to send password reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-black text-white text-2xl font-bold">
              U
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <p className="font-medium mb-1">Check your email</p>
              <p>
                If an account with that email exists, a password reset link has been sent.
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-lg bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                placeholder="you@example.com"
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
              className="w-full rounded-lg bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <a
                href="/login"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Back to Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

