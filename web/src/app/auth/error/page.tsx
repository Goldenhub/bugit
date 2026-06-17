'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ERRORS: Record<string, string> = {
  Verification: 'The sign-in link has expired or already been used.',
  Default: 'Something went wrong. Please try again.',
};

function ErrorMessage() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Default';
  return (
    <p className="text-sm text-gray-500 dark:text-zinc-400">
      {ERRORS[error] ?? ERRORS.Default}
    </p>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sign-in failed</h1>
        <Suspense>
          <ErrorMessage />
        </Suspense>
        <Link
          href="/auth/signin"
          className="inline-block text-sm text-indigo-500 hover:underline"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
