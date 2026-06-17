import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CliApprove from './CliApprove';

export default async function CliAuthPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const { code } = searchParams;

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Invalid link</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">No auth code found. Try running <code className="font-mono">bug login</code> again.</p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/auth/signin?callbackUrl=/auth/cli?code=${code}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl mb-4">⌨️</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Authorize BugIt CLI</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Signed in as <span className="font-medium text-gray-700 dark:text-zinc-300">{session.user?.email}</span>
          </p>
        </div>
        <CliApprove code={code} apiToken={session.apiToken} />
      </div>
    </div>
  );
}
