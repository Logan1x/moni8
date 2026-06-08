import { ArrowRight, HeartPulse, Activity, Terminal, Plus, Check, Github } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: HeartPulse,
    title: "Uptime Monitoring",
    copy: "We check your services every few seconds. If something goes down, you'll know before your users do.",
  },
  {
    icon: Activity,
    title: "Latency Charts",
    copy: "Response time graphs with 24-hour and 30-day stats. See trends before they become problems.",
  },
  {
    icon: Terminal,
    title: "PM2 Logs",
    copy: "View server logs directly from the dashboard. No SSH needed, no terminal open.",
  },
];

const steps = [
  {
    num: "01",
    title: "Add your URL",
    copy: "Paste any endpoint you want to monitor. API, website, health check — anything.",
  },
  {
    num: "02",
    title: "We check it",
    copy: "Every 60 seconds (or your custom interval), we hit the URL and record the result.",
  },
  {
    num: "03",
    title: "You know",
    copy: "Uptime, latency, status codes — all in one place. Before your users even notice.",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-8 md:py-12">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <HeartPulse className="h-4 w-4 text-white/70" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Moni8</span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/monitor"
              className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Open Dashboard
            </Link>
            <a
              href="https://github.com/Logan1x/moni8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </header>

        {/* Hero */}
        <main className="flex flex-col items-center pt-16 pb-24 text-center md:pt-24 md:pb-32">
          <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.9] sm:text-7xl lg:text-8xl animate-slide-up">
            <span className="block">Downtime sucks.</span>
            <span className="block text-neutral-500">We're on it.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base text-neutral-500 sm:text-lg animate-slide-up-delay whitespace-nowrap">
            Monitor your services. Get alerted before your users do.
          </p>

          <Link
            to="/monitor"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] animate-slide-up-delay-2"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </main>

        {/* Incidents section — image + text */}
        <section className="grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="image-tilt relative overflow-hidden rounded-3xl border border-white/10">
            <img
              src="/incidents.webp"
              alt="Incident response"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Without monitoring
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tighter leading-[0.95] sm:text-4xl lg:text-5xl">
              Don't wait for the
              <br />
              <span className="text-neutral-500">fire truck.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-500">
              Your users will notice downtime before you do. By then, they've already
              left. Moni8 watches your services so you don't have to stare at a terminal.
            </p>
            <Link
              to="/monitor"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Start monitoring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-4 py-16 md:grid-cols-3 md:py-24">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 p-6 transition hover:border-white/20 hover:bg-white/[0.02] md:p-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <f.icon className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.copy}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-neutral-500">
              How it works
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tighter leading-[0.95] sm:text-4xl">
              Three steps. That's it.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg font-bold text-neutral-400">
                  {s.num}
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{s.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/monitor"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add your first monitor
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-600">
          Moni8 &mdash; uptime monitoring, minimal.
        </footer>
      </div>
    </div>
  );
}
