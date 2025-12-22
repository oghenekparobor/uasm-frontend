'use client';

import { useRouter } from 'next/navigation';

export function AccessRestricted() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

