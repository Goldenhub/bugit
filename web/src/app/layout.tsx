import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ThemeToggle from './ThemeToggle';
import Providers from './Providers';
import UserMenu from './UserMenu';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bugit-dev.vercel.app'),
  title: {
    default: 'BugIt — Terminal-first bug tracker',
    template: '%s | BugIt',
  },
  description:
    'Log bugs from your terminal without breaking your flow. Capture with one command, review and triage in the browser.',
  keywords: ['bug tracker', 'cli', 'developer tools', 'terminal', 'issue tracker'],
  authors: [{ name: 'Goldenhub', url: 'https://github.com/goldenhub' }],
  openGraph: {
    type: 'website',
    url: 'https://bugit-dev.vercel.app',
    siteName: 'BugIt',
    title: 'BugIt — Terminal-first bug tracker',
    description:
      'Log bugs from your terminal without breaking your flow. Capture with one command, review in the browser.',
  },
  twitter: {
    card: 'summary',
    title: 'BugIt — Terminal-first bug tracker',
    description: 'Log bugs from your terminal without breaking your flow.',
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var s = localStorage.getItem('theme');
            var d = s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (d) document.documentElement.classList.add('dark');
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 antialiased transition-colors">
        <Providers>
          <nav className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Bug<span className="text-indigo-500">It</span>
              </span>
              <span className="text-gray-400 dark:text-zinc-600 text-sm hidden sm:block">personal bug tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {session ? (
                <UserMenu email={session.user?.email ?? ''} />
              ) : (
                <a href="/auth/signin" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors">
                  Sign in
                </a>
              )}
            </div>
          </nav>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
