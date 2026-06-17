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

const STAT_COLORS = [
  'text-gray-900 dark:text-white',
  'text-amber-600 dark:text-amber-400',
  'text-blue-600 dark:text-blue-400',
  'text-green-600 dark:text-green-400',
];

export default async function BugsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const { data, stats, projects } = await getData(searchParams, session.apiToken);

  const statItems = [
    { label: 'Total', value: stats.total },
    { label: 'Open', value: stats.byStatus.open ?? 0 },
    { label: 'In Progress', value: stats.byStatus['in-progress'] ?? 0 },
    { label: 'Resolved', value: stats.byStatus.resolved ?? 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Bugs</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-0.5">{stats.total} total logged</p>
        </div>
        <Link
          href="/bugs/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Bug
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((s, i) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-5 py-4">
            <div className={`text-3xl font-extrabold tracking-tight ${STAT_COLORS[i]}`}>{s.value}</div>
            <div className="text-xs font-medium text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <BugFilters projects={projects} current={searchParams} />

      {/* Bug list */}
      {data.bugs.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
          <p className="text-gray-400 dark:text-zinc-500">No bugs found.</p>
          <Link href="/bugs/new" className="text-indigo-500 hover:underline text-sm mt-1 inline-block">Log one?</Link>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
          {data.bugs.map((bug) => <BugRow key={bug._id} bug={bug} />)}
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

function BugRow({ bug }: { bug: Bug }) {
  const date = new Date(bug.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return (
    <Link
      href={`/bugs/${bug._id}`}
      className="flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
    >
      {/* title + meta */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
          {bug.title}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {bug.project && (
            <span className="text-xs text-gray-400 dark:text-zinc-500">{bug.project}</span>
          )}
          {bug.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* badges + date */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${SEV_CLASSES[bug.severity as Severity]}`}>
          {bug.severity}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_CLASSES[bug.status as Status]}`}>
          {bug.status}
        </span>
        <span className="text-xs text-gray-300 dark:text-zinc-600 w-14 text-right">{date}</span>
      </div>
    </Link>
  );
}
