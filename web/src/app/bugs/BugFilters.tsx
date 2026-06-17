'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';

interface Props {
  projects: string[];
  current: {
    project?: string;
    severity?: string;
    status?: string;
    search?: string;
  };
}

export default function BugFilters({ projects, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams({
        ...(current.project ? { project: current.project } : {}),
        ...(current.severity ? { severity: current.severity } : {}),
        ...(current.status ? { status: current.status } : {}),
        ...(current.search ? { search: current.search } : {}),
      });
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [current, pathname, router],
  );

  const selectCls = 'bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="flex gap-3 flex-wrap">
      <input
        type="search"
        placeholder="Search bugs…"
        defaultValue={current.search ?? ''}
        onChange={(e) => update('search', e.target.value)}
        className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-100 text-sm rounded-lg px-3 py-2 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-48"
      />
      <select value={current.project ?? ''} onChange={(e) => update('project', e.target.value)} className={selectCls}>
        <option value="">All projects</option>
        {projects.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={current.severity ?? ''} onChange={(e) => update('severity', e.target.value)} className={selectCls}>
        <option value="">All severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select value={current.status ?? ''} onChange={(e) => update('status', e.target.value)} className={selectCls}>
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="wontfix">Won&apos;t Fix</option>
      </select>
    </div>
  );
}
