'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api-services';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      errors.push('Password must contain at least one special character');
    }
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      setPasswordErrors(validatePassword(value));
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setError('Please fix the password requirements');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600">Enter your new password</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <p className="font-medium mb-1">Password Reset Successful</p>
              <p>
                Your password has been reset successfully. You will be redirected to the login page shortly.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-lg bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                placeholder="••••••••"
              />
              {passwordErrors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-1">
                  {passwordErrors.map((err, idx) => (
                    <li key={idx}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                placeholder="••••••••"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="space-y-1">
                <li>• At least 8 characters long</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one lowercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full rounded-lg bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

