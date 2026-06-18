import { requireSession } from '@/lib/session';
import { apiFetch } from '@/lib/api';
import NewBugForm from './NewBugForm';

export default async function NewBugPage() {
  const session = await requireSession();
  const projects = await apiFetch<string[]>('/projects', { token: session.apiToken }).catch(() => []);
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Log a Bug</h1>
      <NewBugForm projects={projects} apiToken={session.apiToken} />
    </div>
  );
}
