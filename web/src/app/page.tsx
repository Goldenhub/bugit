import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function TerminalLine({ children }: { children: string }) {
  return (
    <div className="flex gap-3 text-sm font-mono leading-loose">
      <span className="text-indigo-400 select-none shrink-0">$</span>
      <span className="text-zinc-200">{children}</span>
    </div>
  );
}

function TerminalOutput({ children, accent }: { children: string; accent?: boolean }) {
  return (
    <div className={`text-sm font-mono leading-loose pl-6 ${accent ? 'text-emerald-400' : 'text-zinc-500'}`}>
      {children}
    </div>
  );
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-gray-900 dark:text-white">
          Log bugs fast.<br />Fix them faster.
        </h1>

        <p className="mt-6 max-w-lg text-lg text-gray-500 dark:text-zinc-400 leading-relaxed">
          A bug tracker that lives in your terminal. Capture issues without breaking your flow, then review them in the browser when you&apos;re ready.
        </p>

        <div className="mt-8 flex items-center gap-3 flex-wrap">
          {session ? (
            <Link
              href="/bugs"
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 text-sm transition-colors"
            >
              Go to dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 text-sm transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/bugs"
                className="rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium px-5 py-2.5 text-sm transition-colors"
              >
                Go to dashboard →
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Terminal ── */}
      <section className="px-6 max-w-3xl mx-auto mb-20">
        <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-4 py-3 border-b border-zinc-800">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <span className="ml-3 text-xs text-zinc-500 font-mono">~/projects/myapp</span>
          </div>
          <div className="bg-[#0d0d0f] px-5 py-5 space-y-1">
            <TerminalLine>bug log &quot;Login crashes on Safari 17&quot; -s critical -p myapp -e prod</TerminalLine>
            <TerminalOutput accent>✔ Bug logged a3f2c1 — critical Login crashes on Safari 17</TerminalOutput>
            <div className="py-1.5" />
            <TerminalLine>npm run build 2&gt;&amp;1 | bug pipe &quot;CI build failed&quot; -s high</TerminalLine>
            <TerminalOutput accent>✔ Piped bug logged 77c9d0 — high CI build failed</TerminalOutput>
            <div className="py-1.5" />
            <TerminalLine>bug list --sev critical</TerminalLine>
            <TerminalOutput>  ID      TITLE                          SEV       STATUS</TerminalOutput>
            <TerminalOutput>  a3f2c1  Login crashes on Safari 17     critical  open</TerminalOutput>
            <TerminalOutput>  9b1e44  Checkout 500 on mobile         critical  in-progress</TerminalOutput>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-16 border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">
            What it does
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
            {[
              {
                title: 'One-command capture',
                desc: 'Log a bug with a single command. Pipe error output directly. No context switching, no browser tab.',
              },
              {
                title: 'Web dashboard',
                desc: 'Filter by project, severity, and status. View full details, add comments, update bugs inline.',
              },
              {
                title: 'Magic link auth',
                desc: 'No passwords. Sign in with an email link. Once authenticated, the CLI stays logged in.',
              },
              {
                title: 'Rich metadata',
                desc: 'Attach severity, project, environment, tags, description, and notes to every bug.',
              },
              {
                title: 'Pipe from stdin',
                desc: 'Pipe build errors, stack traces, or any output directly into a bug with one command.',
              },
              {
                title: 'Dark mode',
                desc: 'Fully themed. Follows your system preference and remembers your choice.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-zinc-900 p-6 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-16 border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">
            Get started in four steps
          </h2>
          <ol className="space-y-8">
            {[
              { n: 1, title: 'Install the CLI', code: 'npm install -g bugit-cli' },
              { n: 2, title: 'Authenticate — opens a browser tab to approve', code: 'bug login' },
              { n: 3, title: 'Log your first bug', code: 'bug log "Something broke" -s high -p myapp' },
              { n: 4, title: 'Open the dashboard', code: 'open https://bugit-dev.vercel.app' },
            ].map((step) => (
              <li key={step.n} className="flex gap-5 items-start">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-indigo-600 text-indigo-600 text-xs font-bold">
                  {step.n}
                </span>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</div>
                  <code className="inline-block text-sm font-mono bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg">
                    {step.code}
                  </code>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ── */}
      {!session && (
        <section className="px-6 py-16 border-t border-gray-100 dark:border-zinc-800">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ready to stay on top of your bugs?
            </h2>
            <p className="text-gray-500 dark:text-zinc-400">Free to use. Takes about two minutes to set up.</p>
            <Link
              href="/auth/signin"
              className="inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 text-sm transition-colors"
            >
              Get started free →
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 dark:border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-400 dark:text-zinc-500">
          <span className="font-semibold text-gray-700 dark:text-zinc-300">
            Bug<span className="text-indigo-500">It</span>
          </span>
          <span>Built for developers who ship.</span>
        </div>
      </footer>

    </div>
  );
}
