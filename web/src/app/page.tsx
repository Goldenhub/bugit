import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const PREVIEW_BUGS = [
  { title: 'Login crashes on Safari 17', project: 'myapp', sev: 'critical', sevClass: 'bg-red-100 text-red-700', status: 'open', statusClass: 'border border-amber-400 text-amber-600' },
  { title: 'Checkout 500 on mobile', project: 'storefront', sev: 'high', sevClass: 'bg-orange-100 text-orange-700', status: 'in-progress', statusClass: 'border border-blue-400 text-blue-600' },
  { title: 'Reports query timeout', project: 'api', sev: 'medium', sevClass: 'bg-violet-100 text-violet-700', status: 'open', statusClass: 'border border-amber-400 text-amber-600' },
  { title: 'Avatar upload fails on PNG', project: 'myapp', sev: 'low', sevClass: 'bg-slate-100 text-slate-500', status: 'resolved', statusClass: 'border border-green-500 text-green-600' },
];

function DashboardPreview() {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/60 overflow-hidden text-xs select-none">
      {/* mock nav */}
      <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between bg-white">
        <span className="font-bold text-gray-900 text-sm">Bug<span className="text-indigo-500">It</span></span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200" />
        </div>
      </div>
      {/* mock content */}
      <div className="p-4 space-y-3 bg-gray-50">
        {/* stats */}
        <div className="grid grid-cols-4 gap-2">
          {[['12', 'Total'], ['7', 'Open'], ['3', 'In Progress'], ['2', 'Resolved']].map(([n, l]) => (
            <div key={l} className="bg-white border border-gray-100 rounded-lg px-2.5 py-2">
              <div className="font-bold text-gray-900 text-base leading-none">{n}</div>
              <div className="text-gray-400 mt-1">{l}</div>
            </div>
          ))}
        </div>
        {/* header row */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">Bugs</span>
          <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-md font-medium">+ New Bug</span>
        </div>
        {/* bug list */}
        <div className="space-y-1.5">
          {PREVIEW_BUGS.map((b) => (
            <div key={b.title} className="bg-white border border-gray-100 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-gray-800 truncate">{b.title}</div>
                <div className="text-gray-400 mt-0.5">{b.project}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`px-1.5 py-0.5 rounded font-medium ${b.sevClass}`}>{b.sev}</span>
                <span className={`px-1.5 py-0.5 rounded font-medium ${b.statusClass}`}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      <section className="px-6 pt-24 pb-20 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center gap-14">
          {/* left: copy */}
          <div className="lg:w-[45%] shrink-0">
            <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-gray-900 dark:text-white">
              Log it now.<br />Fix it later.
            </h1>
            <p className="mt-7 text-xl text-gray-500 dark:text-zinc-400 leading-relaxed">
              BugIt is a simple bug logger for developers. Spot something broken, log it in seconds from the terminal, come back when you know the fix.
            </p>
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              {session ? (
                <Link href="/bugs" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 text-sm transition-colors">
                  Go to dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 text-sm transition-colors">
                    Get started free
                  </Link>
                  <Link href="/bugs" className="rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold px-6 py-3 text-sm transition-colors">
                    Go to dashboard →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* right: dashboard preview */}
          <div className="lg:flex-1 w-full rotate-1">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Terminal — full bleed dark ── */}
      <section className="bg-zinc-950 border-y border-zinc-800 py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1.5 mb-5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="ml-3 text-xs text-zinc-500 font-mono">~/projects/myapp</span>
          </div>
          <div className="space-y-1">
            <TerminalLine>bug log &quot;Login crashes on Safari 17&quot; -s critical -p myapp -e prod</TerminalLine>
            <TerminalOutput accent>✔ Bug logged a3f2c1 — critical Login crashes on Safari 17</TerminalOutput>
            <div className="py-2" />
            <TerminalLine>npm run build 2&gt;&amp;1 | bug pipe &quot;CI build failed&quot; -s high -p myapp</TerminalLine>
            <TerminalOutput accent>✔ Piped bug logged 77c9d0 — high CI build failed</TerminalOutput>
            <div className="py-2" />
            <TerminalLine>bug list --sev critical</TerminalLine>
            <TerminalOutput>  ID      TITLE                          SEV       STATUS</TerminalOutput>
            <TerminalOutput>  a3f2c1  Login crashes on Safari 17     critical  open</TerminalOutput>
            <TerminalOutput>  9b1e44  Checkout 500 on mobile         critical  in-progress</TerminalOutput>
            <div className="py-2" />
            <TerminalLine>bug resolve a3f2c1</TerminalLine>
            <TerminalOutput accent>✔ Bug a3f2c1 resolved.</TerminalOutput>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Nothing fancy. Just useful.
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 sm:text-right max-w-xs">
              Built because Jira is overkill and sticky notes don&apos;t have severity levels.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Log from the terminal',
                desc: 'One command. You\'re back to coding in five seconds. No browser, no login flow, no ticket form to fill out.',
              },
              {
                n: '02',
                title: 'Come back to it',
                desc: 'When you find the root cause or the fix, open the dashboard, add your notes, and close it out.',
              },
              {
                n: '03',
                title: 'Works for your team too',
                desc: 'Each person has their own account and their own bugs. Share the tool, not the clutter.',
              },
              {
                n: '04',
                title: 'Pipe build failures in',
                desc: 'npm run build 2>&1 | bug pipe "Build broke". Your CI output becomes a bug in one line.',
              },
              {
                n: '05',
                title: 'Tag what matters',
                desc: 'Severity, project, environment, tags. Enough structure to filter later without becoming a second job.',
              },
              {
                n: '06',
                title: 'No friction to sign in',
                desc: 'Email link, no password. The CLI authenticates through your browser once and stays logged in.',
              },
            ].map((f) => (
              <div key={f.n} className="border-t-2 border-gray-900 dark:border-zinc-100 pt-5 space-y-2">
                <span className="text-xs font-mono text-gray-400 dark:text-zinc-500">{f.n}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — tinted bg ── */}
      <section className="bg-gray-50 dark:bg-zinc-900 border-y border-gray-100 dark:border-zinc-800 px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-12">
            Start in two minutes
          </h2>
          <ol className="space-y-10">
            {[
              {
                n: '01',
                title: 'Install the CLI',
                code: 'npm install -g bugit-cli',
                link: 'https://www.npmjs.com/package/bugit-cli',
              },
              {
                n: '02',
                title: 'Authenticate',
                sub: 'Opens a browser tab. Approve once, stay logged in.',
                code: 'bug login',
              },
              {
                n: '03',
                title: 'Log your first bug',
                code: 'bug log "Dropdown breaks on iOS" -s high -p myapp',
              },
              {
                n: '04',
                title: 'Open the dashboard',
                code: 'open https://bugit-dev.vercel.app',
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-8 items-start">
                <span className="text-3xl font-extrabold text-gray-200 dark:text-zinc-700 font-mono shrink-0 leading-none mt-1">
                  {step.n}
                </span>
                <div className="space-y-2 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white">{step.title}</div>
                  {step.sub && <div className="text-sm text-gray-400 dark:text-zinc-500">{step.sub}</div>}
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="inline-block text-sm font-mono bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg">
                      {step.code}
                    </code>
                    {'link' in step && step.link && (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">
                        npmjs ↗
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA — dark ── */}
      {!session && (
        <section className="bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 px-6 py-20 text-center">
          <div className="max-w-xl mx-auto space-y-5">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Give it a try.
            </h2>
            <p className="text-zinc-400 text-lg">Free. No card. If it doesn&apos;t fit your workflow, uninstall takes one command too.</p>
            <Link
              href="/auth/signin"
              className="inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 text-sm transition-colors"
            >
              Get started →
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
          <span>
            Built by{' '}
            <a
              href="https://github.com/goldenhub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Goldenhub
            </a>
          </span>
        </div>
      </footer>

    </div>
  );
}
