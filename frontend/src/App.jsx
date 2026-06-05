import { ArrowRight, CheckCircle2, Shield, Sparkles, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  ["Checks", "1,284"],
  ["Uptime", "99.98%"],
  ["Alerts", "12"],
];

const features = [
  {
    title: "Quiet by default",
    copy: "A calm landing page and a clean dashboard so the product feels easy to trust.",
  },
  {
    title: "Built for ops",
    copy: "Monitors, alerting, and logs stay close together instead of scattered around the app.",
  },
  {
    title: "Fast to scan",
    copy: "Minimal sections, strong hierarchy, and enough contrast to read everything quickly.",
  },
];

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}

function FeatureCard({ title, copy }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-emerald-300">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#07080b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-emerald-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Moni8</div>
              <div className="text-[11px] text-white/45">uptime monitoring</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="#features" className="hidden text-sm text-white/55 transition hover:text-white sm:inline">
              Features
            </a>
            <Link
              to="/monitor"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-300"
            >
              Open monitor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-14 lg:py-20">
          <section className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/55">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                simple monitoring for real systems
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                <span className="block">Know when things</span>
                <span className="block text-white/55">go quiet.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                Moni8 keeps your checks, history, and logs in one calm place. No noisy dashboard, no clutter —
                just the signal you need when a service slows down or drops.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/monitor"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  See what it does
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {stats.map(([label, value]) => (
                  <StatCard key={label} label={label} value={value} />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -right-8 bottom-12 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />

              <div className="rounded-[2rem] border border-white/10 bg-[#0c0e13]/90 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Preview</div>
                    <div className="mt-1 text-lg font-semibold text-white">Healthy status</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    all good
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["api.moni8.local", "UP", "184 ms"],
                    ["web.moni8.local", "UP", "241 ms"],
                    ["jobs.moni8.local", "WARN", "612 ms"],
                  ].map(([name, state, latency], index) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{name}</div>
                        <div
                          className={
                            index === 2
                              ? "text-[11px] font-semibold tracking-[0.24em] text-amber-300"
                              : "text-[11px] font-semibold tracking-[0.24em] text-emerald-300"
                          }
                        >
                          {state}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">Latency</div>
                        <div className="mt-1 text-sm font-medium text-white tabular-nums">{latency}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/65">
                  Readable history, clean alerts, and logs that don’t get in the way.
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="mt-20 grid gap-4 md:grid-cols-3 lg:mt-24">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </section>

          <footer className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <div>Moni8 — calm monitoring for apps that need attention.</div>
            <div className="flex items-center gap-4">
              <Link to="/monitor" className="transition hover:text-white">
                Dashboard
              </Link>
              <span className="hidden sm:inline">Minimal. Fast. Clear.</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
