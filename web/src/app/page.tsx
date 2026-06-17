import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    <div className={`text-sm font-mono leading-loose pl-6 ${accent ? "text-emerald-400" : "text-zinc-500"}`}>
      {children}
    </div>
  );
}

const PREVIEW_BUGS = [
  { title: "Checkout fails on mobile Safari", project: "storefront", sev: "high", sevClass: "bg-orange-100 text-orange-700", status: "open", statusClass: "border border-amber-400 text-amber-600" },
  { title: "Login crashes on Safari 17", project: "myapp", sev: "critical", sevClass: "bg-red-100 text-red-700", status: "in-progress", statusClass: "border border-blue-400 text-blue-600" },
  { title: "Reports query timeout", project: "api", sev: "medium", sevClass: "bg-violet-100 text-violet-700", status: "open", statusClass: "border border-amber-400 text-amber-600" },
];

function DashboardPreview({ highlight }: { highlight?: string }) {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden text-xs select-none">
      <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between bg-white">
        <span className="font-bold text-gray-900 text-sm">Bug<span className="text-indigo-500">It</span></span>
        <div className="w-5 h-5 rounded-full bg-gray-200" />
      </div>
      <div className="p-4 space-y-2 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900 text-sm">Your bugs</span>
          <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-md font-medium">+ New Bug</span>
        </div>
        {PREVIEW_BUGS.map((b) => (
          <div key={b.title} className={`bg-white border rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 ${highlight === b.title ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-100"}`}>
            <div className="min-w-0">
              <div className={`font-medium truncate ${highlight === b.title ? "text-indigo-700" : "text-gray-800"}`}>{b.title}</div>
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
  );
}

function Stage({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 sm:gap-8">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{n}</div>
        <div className="w-px flex-1 bg-gray-200 dark:bg-zinc-800 mt-3" />
      </div>
      <div className="pb-16 flex-1 min-w-0">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">{label}</p>
        {children}
      </div>
    </div>
  );
}

/* Faded CLI commands scattered behind the hero */
function HeroBg() {
  const lines = [
    { text: 'bug log "TypeError: cannot read properties of null"', top: '8%',  left: '2%',   rotate: '-8deg',  opacity: '0.055' },
    { text: '✔ Bug logged 9b1e44 — high',                          top: '18%', right: '3%',  rotate: '5deg',   opacity: '0.045' },
    { text: 'bug list --sev critical --status open',               top: '55%', left: '1%',   rotate: '-4deg',  opacity: '0.04'  },
    { text: 'bug resolve a3f2c1',                                   top: '70%', right: '5%',  rotate: '7deg',   opacity: '0.05'  },
    { text: 'npm run build 2>&1 | bug pipe "Build failed" -s high',top: '82%', left: '8%',   rotate: '-3deg',  opacity: '0.035' },
    { text: 'bug update 9b1e44 --status in-progress',              top: '35%', right: '2%',  rotate: '-6deg',  opacity: '0.04'  },
    { text: '$ bug whoami',                                         top: '91%', right: '15%', rotate: '3deg',   opacity: '0.045' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {lines.map((l, i) => (
        <span
          key={i}
          className="absolute whitespace-nowrap font-mono text-sm text-indigo-950 dark:text-indigo-100"
          style={{ top: l.top, left: l.left, right: l.right, rotate: l.rotate, opacity: l.opacity }}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}

/* Faded outputs behind the dark CTA */
function CtaBg() {
  const lines = [
    { text: '✔ Bug logged a3f2c1 — critical',    top: '12%', left: '5%',   rotate: '-5deg', opacity: '0.07' },
    { text: 'bug resolve 9b1e44',                 top: '25%', right: '6%',  rotate: '4deg',  opacity: '0.06' },
    { text: '✔ Bug 9b1e44 resolved.',             top: '60%', left: '10%',  rotate: '-3deg', opacity: '0.06' },
    { text: 'bug list --status resolved',         top: '75%', right: '4%',  rotate: '6deg',  opacity: '0.05' },
    { text: '✔ Bug logged 77c9d0 — high',         top: '45%', left: '3%',   rotate: '3deg',  opacity: '0.05' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {lines.map((l, i) => (
        <span
          key={i}
          className="absolute whitespace-nowrap font-mono text-sm text-emerald-300"
          style={{ top: l.top, left: l.left, right: l.right, rotate: l.rotate, opacity: l.opacity }}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative px-6 pt-24 pb-20 max-w-3xl mx-auto text-center bg-transparent overflow-hidden">
        <HeroBg />
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-gray-900 dark:text-white">
            Stop fixing bugs.<br />Start understanding them.
          </h1>
          <p className="mt-6 text-xl text-gray-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
            BugIt helps you log issues the moment they appear, trace them to the root cause, and document your findings — so every bug you encounter makes you a sharper developer.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
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
      </section>

      {/* ── Lifecycle ── */}
      <section className="px-6 pb-10 max-w-3xl mx-auto">

        <Stage n="1" label="You notice it">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">You&apos;re three hours into a feature.</h2>
          <p className="text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
            Something&apos;s broken. Checkout is failing on mobile. You don&apos;t know why yet, and you don&apos;t have time to find out right now. But you can&apos;t just leave it floating in your head.
          </p>
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">~/projects/storefront</span>
            </div>
            <div className="px-5 py-5 space-y-1">
              <TerminalLine>bug log &quot;Checkout fails on mobile Safari&quot; -s high -p storefront -e prod</TerminalLine>
              <TerminalOutput accent>✔ Bug logged 9b1e44 — high Checkout fails on mobile Safari</TerminalOutput>
            </div>
          </div>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-4">Ten seconds. You&apos;re back to what you were doing.</p>
        </Stage>

        <Stage n="2" label="It's in your list">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Nothing falls through the cracks.</h2>
          <p className="text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
            Every bug you&apos;ve logged lives in your dashboard. Severity, project, environment — all there. You and your team can see what&apos;s open, what&apos;s being worked on, and what&apos;s been sitting too long.
          </p>
          <DashboardPreview highlight="Checkout fails on mobile Safari" />
        </Stage>

        <Stage n="3" label="You find the cause">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">A day later, you know what it is.</h2>
          <p className="text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
            A missing null check in the payment handler. Open the bug in the dashboard, write down what you found and how you fixed it. That knowledge lives with the bug now — not in your head, not in a Slack message that&apos;ll disappear.
          </p>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Root cause</p>
              <p className="text-sm text-gray-700 dark:text-zinc-300">
                Payment handler wasn&apos;t checking for null user session on Safari. Session cookie expires faster on mobile WebKit. Fixed with a null guard before the charge call.
              </p>
            </div>
            <div className="h-px bg-gray-100 dark:bg-zinc-800" />
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-0.5 rounded font-medium border border-green-500 text-green-600">resolved</span>
              <span className="text-xs text-gray-400 dark:text-zinc-500">Marked resolved — 14 Jun 2025</span>
            </div>
          </div>
        </Stage>

        {/* Stage 4 — no trailing line */}
        <div className="flex gap-5 sm:gap-8">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</div>
          </div>
          <div className="pb-4 flex-1 min-w-0">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Done</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Closed out. On to the next one.</h2>
            <p className="text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
              That&apos;s the whole loop. No ceremony, no project management overhead. Just a clear record of what broke, when, and how you fixed it.
            </p>
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-5 py-5 space-y-1">
                <TerminalLine>bug resolve 9b1e44</TerminalLine>
                <TerminalOutput accent>✔ Bug 9b1e44 resolved.</TerminalOutput>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── Setup ── */}
      <section className="bg-slate-50 dark:bg-zinc-900 border-y border-slate-200 dark:border-zinc-800 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Get the CLI</h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-8">Install it once, use it everywhere.</p>
          <div className="space-y-6">
            {[
              { code: "npm install -g bugit-cli", note: "Install globally", link: "https://www.npmjs.com/package/bugit-cli" },
              { code: "bug login", note: "Opens a browser tab to sign in — takes 30 seconds" },
              { code: 'bug log "Something broke" -s high -p myproject', note: "You're logging bugs" },
            ].map((s, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-xs font-mono text-gray-300 dark:text-zinc-600 mt-2.5 w-4 shrink-0">{i + 1}.</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="text-sm font-mono bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg">
                      {s.code}
                    </code>
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                        npmjs ↗
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 dark:text-zinc-500">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!session && (
        <section className="relative bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 px-6 py-20 text-center overflow-hidden">
          <CtaBg />
          <div className="relative z-10 max-w-lg mx-auto space-y-5">
            <h2 className="text-3xl font-bold text-white">Give it a try.</h2>
            <p className="text-zinc-400">
              Free. No card. If it doesn&apos;t fit,{" "}
              <code className="text-zinc-300 font-mono text-sm">npm uninstall -g bugit-cli</code> and you&apos;re out.
            </p>
            <Link href="/auth/signin" className="inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 text-sm transition-colors">
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
            Built by{" "}
            <a href="https://github.com/goldenhub" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
              Goldenhub
            </a>
          </span>
        </div>
      </footer>

    </div>
  );
}
