import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { requireSession } from '@/lib/session';
import type { Bug, Comment } from '@/lib/types';
import { SEV_CLASSES, STATUS_CLASSES } from '@/lib/badges';
import type { Severity, Status } from '@/lib/types';
import BugActions from './BugActions';
import CommentSection from './CommentSection';

async function getBug(id: string, token: string) {
  try {
    const [bug, comments] = await Promise.all([
      apiFetch<Bug>(`/bugs/${id}`, { token }),
      apiFetch<Comment[]>(`/bugs/${id}/comments`, { token }),
    ]);
    return { bug, comments };
  } catch {
    return null;
  }
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <span className="w-28 shrink-0 text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-gray-700 dark:text-zinc-300">{children}</span>
    </div>
  );
}

export default async function BugDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const result = await getBug(params.id, session.apiToken);
  if (!result) notFound();

  const { bug, comments } = result;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/bugs" className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
          ← Back
        </Link>
        <BugActions bugId={bug._id} apiToken={session.apiToken} />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{bug.title}</h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded font-medium ${SEV_CLASSES[bug.severity as Severity]}`}>{bug.severity}</span>
          <span className={`text-xs px-2.5 py-1 rounded font-medium ${STATUS_CLASSES[bug.status as Status]}`}>{bug.status}</span>
        </div>
        {bug.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {bug.tags.map((t) => (
              <span key={t} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 divide-y-0">
        {bug.project     && <MetaRow label="Project">{bug.project}</MetaRow>}
        {bug.environment && <MetaRow label="Environment">{bug.environment}</MetaRow>}
        <MetaRow label="Source">{bug.source}</MetaRow>
        <MetaRow label="Created">{new Date(bug.createdAt).toLocaleString()}</MetaRow>
        <MetaRow label="Updated">{new Date(bug.updatedAt).toLocaleString()}</MetaRow>
        <MetaRow label="ID"><span className="font-mono text-xs text-gray-400 dark:text-zinc-500">{bug._id}</span></MetaRow>
      </div>

      <BugActions bugId={bug._id} bug={bug} mode="inline" apiToken={session.apiToken} />

      {bug.description && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Description</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 font-mono">{bug.description}</pre>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Notes</h2>
        <BugActions bugId={bug._id} bug={bug} mode="notes" apiToken={session.apiToken} />
      </section>

      {Object.keys(bug.metadata ?? {}).length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Metadata</h2>
          <pre className="text-xs text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 overflow-auto">{JSON.stringify(bug.metadata, null, 2)}</pre>
        </section>
      )}

      <CommentSection bugId={bug._id} initialComments={comments} apiToken={session.apiToken} />
    </div>
  );
}
