'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Bug, Severity, Status } from '@/lib/types';
import { SEV_CLASSES, STATUS_CLASSES } from '@/lib/badges';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function patch(bugId: string, body: Partial<Bug>, token: string) {
  const res = await fetch(`${API}/bugs/${bugId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json() as Promise<Bug>;
}

interface Props {
  bugId: string;
  apiToken: string;
  bug?: Bug;
  mode?: 'toolbar' | 'inline' | 'notes';
}

export default function BugActions({ bugId, apiToken, bug, mode = 'toolbar' }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [notes, setNotes] = useState(bug?.notes ?? '');
  const [saving, setSaving] = useState(false);

  if (mode === 'toolbar') {
    return (
      <button
        onClick={async () => {
          if (!confirm('Delete this bug?')) return;
          await fetch(`${API}/bugs/${bugId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiToken}` },
          });
          startTransition(() => router.push('/bugs'));
        }}
        className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
      >
        Delete
      </button>
    );
  }

  if (mode === 'notes') {
    const save = async () => {
      setSaving(true);
      try {
        await patch(bugId, { notes }, apiToken);
        startTransition(() => router.refresh());
      } finally {
        setSaving(false);
      }
    };
    return (
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={save}
        rows={4}
        placeholder={saving ? 'Saving…' : 'Root cause, fix notes…'}
        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-gray-400 dark:focus:border-zinc-600 rounded-lg p-3 text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-y focus:outline-none transition-colors"
      />
    );
  }

  if (!bug) return null;

  const updateField = async (field: 'status' | 'severity', value: string) => {
    await patch(bugId, { [field]: value }, apiToken);
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-zinc-500">Status</span>
        <select
          defaultValue={bug.status}
          onChange={(e) => updateField('status', e.target.value)}
          className={`text-xs px-2 py-1 rounded font-medium bg-transparent border-0 cursor-pointer focus:outline-none ${STATUS_CLASSES[bug.status as Status]}`}
        >
          <option value="open">open</option>
          <option value="in-progress">in-progress</option>
          <option value="resolved">resolved</option>
          <option value="wontfix">wontfix</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-zinc-500">Severity</span>
        <select
          defaultValue={bug.severity}
          onChange={(e) => updateField('severity', e.target.value)}
          className={`text-xs px-2 py-1 rounded font-medium bg-transparent border-0 cursor-pointer focus:outline-none ${SEV_CLASSES[bug.severity as Severity]}`}
        >
          <option value="critical">critical</option>
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
      </div>
    </div>
  );
}
