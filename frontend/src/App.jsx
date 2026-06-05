import {
  ArrowRight,
  BellRing,
  BarChart3,
  Globe,
  Radar,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "checks running", value: "1,284" },
  { label: "avg response", value: "184 ms" },
  { label: "alerts this week", value: "12" },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Quiet by default",
    copy: "Gradient polish up top, but the product stays calm. The layout keeps focus on signal, not noise.",
  },
  {
    icon: Radar,
    title: "See the problem fast",
    copy: "A live preview, strong hierarchy, and compact cards make it obvious what is healthy and what is not.",
  },
  {
    icon: BellRing,
    title: "Alerts that breathe",
    copy: "The visual language feels modern without becoming flashy, so important states still stand out instantly.",
  },
];

const monitorRows = [
  { name: "api.moni8.local", state: "UP", latency: "184 ms", accent: "emerald" },
  { name: "web.moni8.local", state: "UP", latency: "241 ms", accent: "sky" },
  { name: "jobs.moni8.local", state: "WARN", latency: "612 ms", accent: "amber" },
];

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_16px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">{label}</div>
      <div className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white tabular-nums">{value}</div>
    </div>
  );
}

function PrincipleCard({ icon: Icon, title, copy }) {
  return (
    <div className="group rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.055]">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-cyan-400/18 via-sky-400/12 to-emerald-400/18 text-cyan-200 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/62">{copy}</p>
    </div>
  );
}

function StatusDot({ tone }) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.55)]"
      : tone === "sky"
        ? "bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.55)]"
        : "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.55)]";

  return <span className={`inline-flex h-2.5 w-2.5 rounded-full ${toneClass}`} />;
}

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#05060a] text-white antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-7rem] top-24 h-80 w-80 rounded-full bg-fuchsia-500/16 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] opacity-25" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-cyan-400/20 via-sky-400/14 to-emerald-400/18 text-cyan-200 shadow-[0_0_40px_rgba(56,189,248,0.14)]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[-0.02em]">Moni8</div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">uptime, but calmer</div>
            </div>
          </div>

          <Link
            to="/monitor"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-cyan-100"
          >
            Open monitor
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-12 lg:py-16">
          <section className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/58 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                minimal surface, strong signal
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.9] tracking-[-0.08em] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                <span className="block">A landing page that</span>
                <span className="block bg-linear-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(103,232,249,0.18)]">
                  feels alive.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                I redid the homepage with a deeper visual system: layered gradients, glass panels, sharper hierarchy,
                and a calmer premium vibe so it does not feel like a boring placeholder.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/monitor"
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-300 via-sky-300 to-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(56,189,248,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(56,189,248,0.34)]"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#why-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  See the redesign
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <StatCard key={item.label} {...item} />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/52">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  <TimerReset className="h-4 w-4 text-cyan-300" />
                  fast to scan
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  calm by design
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  <BarChart3 className="h-4 w-4 text-sky-300" />
                  built for ops
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -right-8 bottom-16 h-36 w-36 rounded-full bg-fuchsia-400/14 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_36px_120px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">Live preview</div>
                    <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">Healthy status</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    all good
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {monitorRows.map((row, index) => (
                    <div
                      key={row.name}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition hover:border-white/18 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-white">
                            <StatusDot tone={row.accent} />
                            {row.name}
                          </div>
                          <div
                            className={
                              row.state === "WARN"
                                ? "mt-1 text-[11px] font-semibold tracking-[0.24em] text-amber-200"
                                : "mt-1 text-[11px] font-semibold tracking-[0.24em] text-emerald-200"
                            }
                          >
                            {row.state}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-white/36">Latency</div>
                          <div className="mt-1 text-sm font-medium text-white tabular-nums">{row.latency}</div>
                        </div>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={
                            index === 0
                              ? "h-full w-[84%] rounded-full bg-linear-to-r from-cyan-300 to-emerald-300"
                              : index === 1
                                ? "h-full w-[72%] rounded-full bg-linear-to-r from-sky-300 to-cyan-300"
                                : "h-full w-[48%] rounded-full bg-linear-to-r from-amber-300 to-orange-300"
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/7 to-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">Last alert</div>
                    <div className="mt-2 text-sm text-white/78">12 minutes ago on jobs.moni8.local</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-linear-to-br from-cyan-300/12 via-sky-300/10 to-emerald-300/12 p-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">Mood</div>
                    <div className="mt-2 text-sm text-white/85">Signal first. Panic later.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="why-it-works" className="mt-20 grid gap-4 lg:grid-cols-3 lg:mt-24">
            {principles.map((item) => (
              <PrincipleCard key={item.title} {...item} />
            ))}
          </section>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-linear-to-r from-white/[0.04] via-cyan-400/6 to-emerald-400/6 p-6 shadow-[0_20px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/42">Bottom line</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white sm:text-3xl">
                  More gradient, more polish, still not trying too hard.
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/64 sm:text-base">
                  The homepage now looks intentional: depth, glow, and motion cues without losing the calm product
                  tone. The dashboard still lives safely at /monitor.
                </p>
              </div>

              <Link
                to="/monitor"
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/12 bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_50px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-cyan-100 lg:self-auto"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
