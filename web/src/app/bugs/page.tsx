import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { requireSession } from '@/lib/session';
import type { BugListResponse, Stats, Bug } from '@/lib/types';
import { SEV_CLASSES, STATUS_CLASSES } from '@/lib/badges';
import type { Severity, Status } from '@/lib/types';
import BugFilters from './BugFilters';

interface SearchParams {
  project?: string;
  severity?: string;
  status?: string;
  search?: string;
  page?: string;
}

async function getData(params: SearchParams, token: string) {
  const q = new URLSearchParams();
  if (params.project) q.set('project', params.project);
  if (params.severity) q.set('severity', params.severity);
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  q.set('page', params.page ?? '1');
  q.set('limit', '30');

  const [data, stats, projects] = await Promise.all([
    apiFetch<BugListResponse>(`/bugs?${q}`, { token }),
    apiFetch<Stats>('/stats', { token }),
    apiFetch<string[]>('/projects', { token }),
  ]);
  return { data, stats, projects };
}

export default async function BugsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const { data, stats, projects } = await getData(searchParams, session.apiToken);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Open', value: stats.byStatus.open ?? 0 },
          { label: 'In Progress', value: stats.byStatus['in-progress'] ?? 0 },
          { label: 'Resolved', value: stats.byStatus.resolved ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Bugs</h1>
        <Link href="/bugs/new" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Bug
        </Link>
      </div>

      <BugFilters projects={projects} current={searchParams} />

      {data.bugs.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-zinc-500">
          No bugs found.{' '}
          <Link href="/bugs/new" className="text-indigo-500 hover:underline">Log one?</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data.bugs.map((bug) => <BugCard key={bug._id} bug={bug} />)}
        </div>
      )}

      {data.total > data.limit && (
        <p className="text-xs text-gray-400 dark:text-zinc-500 text-center">
          Showing {data.bugs.length} of {data.total}
        </p>
      )}
    </div>
  );
}

function BugCard({ bug }: { bug: Bug }) {
  const date = new Date(bug.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <Link href={`/bugs/${bug._id}`} className="block bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 rounded-lg px-5 py-4 transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">{bug.title}</span>
            {bug.project && <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">{bug.project}</span>}
          </div>
          {bug.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {bug.tags.map((t) => <span key={t} className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded">{t}</span>)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${SEV_CLASSES[bug.severity as Severity]}`}>{bug.severity}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_CLASSES[bug.status as Status]}`}>{bug.status}</span>
          <span className="text-xs text-gray-400 dark:text-zinc-600">{date}</span>
        </div>
      </div>
    </Link>
  );
}
