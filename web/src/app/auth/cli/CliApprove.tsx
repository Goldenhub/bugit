'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function CliApprove({
  code,
  apiToken,
}: {
  code: string;
  apiToken: string;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function approve() {
    setState('loading');
    try {
      const res = await fetch(`${API}/auth/cli/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error();
      setState('done');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="text-center space-y-2">
        <div className="text-3xl">✅</div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">CLI authorized</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400">You can close this window and return to the terminal.</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-center space-y-2">
        <div className="text-3xl">❌</div>
        <p className="text-sm text-gray-700 dark:text-zinc-300">Authorization failed. The link may have expired.</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400">Run <code className="font-mono">bug login</code> again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
        This will allow the <code className="font-mono text-indigo-500">bug</code> CLI to access your bugs.
      </p>
      <button
        onClick={approve}
        disabled={state === 'loading'}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {state === 'loading' ? 'Authorizing…' : 'Authorize CLI'}
      </button>
    </div>
  );
}
